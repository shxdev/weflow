"use strict";
global.Function = window.Function = window.eval = global.eval = function () {
    throw new Error(`Sorry, this app does not support "unsafe-eval".`)
};

const { remote } = require('electron');

const util=require("./util.js");

const { ShapRectangle}=require("./shape.js");
require("./shape.plugin.js");

const a=new ShapRectangle();

HTMLElement.prototype.setRect=function(rect){
    if(rect){
        const _rect={
            x:util.floatValue(rect.x,rect.left)
            ,y:util.floatValue(rect.y,rect.top)
            ,w:util.floatValue(rect.w,rect.width)
            ,h:util.floatValue(rect.h,rect.height)
        };
        this.style["left"]=`${_rect.x}px`;
        this.style["top"]=`${_rect.y}px`;
        this.style["width"]=`${_rect.w}px`;
        this.style["height"]=`${_rect.h}px`;
    }
};

document.addEventListener("DOMContentLoaded",(event)=>{
    const main_container=document.querySelector(".main-container");
    main_container.fn_pointer_at_coloum_resize = function (pointer) {
        const c_left = main_container.querySelector(".container.left");
        const c_center = main_container.querySelector(".container.center");
        const c_right = main_container.querySelector(".container.right");
        const left_rect = c_left.getBoundingClientRect();
        const right_rect = c_right.getBoundingClientRect();
        const fuzzy = 10;
        let ret={};
        // if (Math.abs(pointer.x - left_rect.right)< fuzzy) {//鼠标在左侧栏边框
        if (pointer.x - left_rect.right > 0 && pointer.x - left_rect.right < fuzzy) {//鼠标在左侧栏边框
            ret.targetKey="left";
            ret.target=c_left;
        // } else if (Math.abs(pointer.x - right_rect.left) < fuzzy) { //鼠标在右侧栏边框
        } else if (pointer.x-right_rect.left > 0 && pointer.x - right_rect.left < fuzzy){ //鼠标在右侧栏边框
            ret.targetKey = "right";
            ret.target = c_right;
        } else {
            ret=false;
        }
        if(ret.target){
            const { isMaxWidth, isMinWidth } = util.widthAndHeightStatus(ret.target);
            ret.isMaxWidth = isMaxWidth;
            ret.isMinWidth = isMinWidth;
        }
        return ret;
    };

    main_container.addEventListener("pointermove",(event)=>{
        const main_container=event.currentTarget;
        const pointer = {
            x: event.clientX
            , y: event.clientY
        };
        if (main_container.isColumnResizing){
            const { target, mouseDownPointer, mouseDownRect} = main_container.resizingData;
            if (main_container.isColumnResizing.targetKey==="left"){
                target.style["width"] = `${mouseDownRect.width + (pointer.x - mouseDownPointer.x)}px`;
            } else if (main_container.isColumnResizing.targetKey === "right") {
                target.style["width"] = `${mouseDownRect.width + (mouseDownPointer.x - pointer.x)}px`;
            }

            const { isMaxWidth,isMinWidth }=util.widthAndHeightStatus(target);
            if (
                (isMaxWidth && main_container.isColumnResizing.targetKey === "right")
                || (isMinWidth && main_container.isColumnResizing.targetKey === "left")
            ) {
                main_container.style["cursor"] = "e-resize";
            } else if (
                (isMinWidth && main_container.isColumnResizing.targetKey === "right")
                || (isMaxWidth && main_container.isColumnResizing.targetKey === "left")
            ) {
                main_container.style["cursor"] = "w-resize";
            } else {
                main_container.style["cursor"] = "col-resize";
            }


        }else{
            const column_resize_data=main_container.fn_pointer_at_coloum_resize(pointer);
            if (column_resize_data){
                if (
                    (column_resize_data.isMaxWidth && column_resize_data.targetKey==="right")
                    || (column_resize_data.isMinWidth && column_resize_data.targetKey === "left")
                ){
                    main_container.style["cursor"] = "e-resize";
                } else if (
                    (column_resize_data.isMinWidth && column_resize_data.targetKey === "right")
                    || (column_resize_data.isMaxWidth && column_resize_data.targetKey === "left")
                ) {
                    main_container.style["cursor"] = "w-resize";
                }else{
                    main_container.style["cursor"] = "col-resize";
                }
                
            }else{
                main_container.style["cursor"] = "unset";
            }

        }
    });
    main_container.addEventListener("pointerdown", (event) => {
        const main_container = event.currentTarget;
        const pointer = {
            x: event.clientX
            , y: event.clientY
        };
        main_container.isColumnResizing = main_container.fn_pointer_at_coloum_resize(pointer);
        main_container.setPointerCapture(event.pointerId);
        if (main_container.isColumnResizing){
            const target = main_container.isColumnResizing.target;
            main_container.resizingData={
                target
                , mouseDownPointer:pointer
                , mouseDownRect:target.getBoundingClientRect()
            }; 
        }

    });
    main_container.addEventListener("pointerup", (event) => {
        const main_container = event.currentTarget;
        main_container.isColumnResizing=false;
        main_container.releasePointerCapture(event.pointerId);
    });

    // ------------------------------
    document.addEventListener("pointermove",(event)=>{
        const {clientX,clientY}=event;
        glob.pointermove(clientX,clientY);
    })
    glob.b_array=[];
    let conflict_count=0
    const view_port=document.querySelector(".container.center>.canvas");
    const view_port_rect=view_port.getBoundingClientRect();
    const default_w=parseInt(Math.min(view_port_rect.width,view_port_rect.height)/20);
    for(let i=0;i<500;i++){
        const rect={
            x:parseInt(Math.random()*(view_port_rect.width-default_w*2))
            ,y:parseInt(Math.random()*(view_port_rect.height-default_w*2))
            ,w:default_w
            ,h:default_w
        }
        let conflict=false;
        for(let n=0;n<glob.b_array.length;n++){
            if(glob.b_array[n].conflict(rect)){
                conflict=true;
                break;
            }
        }
        if(conflict){
            i--;
            conflict_count++;
            if(conflict_count>100){
                console.log("too many conflict!!");
                break;
            }
        }else{
            conflict_count=0
            glob.b_array.push(new Battery(rect))
        }
    }
    const fn_draw=()=>{
        (glob.b_array||[]).forEach((b)=>{
            b.redraw();
        });
        requestAnimationFrame(fn_draw);
    };
    fn_draw();
    // ------------------------------
});

const glob={
    pointermove:(x,y)=>{
        (glob.b_array||[]).forEach((b)=>{
            b.lookto({x,y});
        });
    }
}

class Battery{
    constructor(options){
        this.options=options;
        this.rect={
            x:this.options && this.options.x || 0
            ,y:this.options && this.options.y || 0
            ,w:this.options && this.options.w || 10
            ,h:this.options && this.options.h || 10
        }
        this.rect={...this.rect,
            left:this.rect.x
            ,right:this.rect.x+this.rect.w
            ,top:this.rect.y
            ,bottom:this.rect.y+this.rect.h

        };
        this.container=this.options && this.options.container || document.querySelector(".container.center>.canvas>div");
        this.init();
    }

    init(){
        if(!this.body){
            this.body=document.createElement("div");
            this.body.style["position"]=`absolute`;
            this.body.style["width"]=`${this.rect.w}px`;
            this.body.style["height"]=`${this.rect.h}px`;
            this.body.style["left"]=`${this.rect.x}px`;
            this.body.style["top"]=`${this.rect.y}px`;
            this.body.style["border"]=`1px solid black`;
            this.body.style["border-radius"]=`${this.rect.w/2+1}px`;
            this.body.style["pointer-events"]=`none`;
            
            const scale=Math.sin(45*Math.PI/180);
            const radius=this.rect.w/2;
            const offset=radius-scale*radius;
            this.eye=document.createElement("div");
            this.eye.style["position"]=`absolute`;
            this.eye.style["width"]=`${this.rect.w/5}px`;
            this.eye.style["height"]=`${this.rect.w/5}px`;
            this.eye.style["border-radius"]=`${this.rect.w/10+1}px`;
            this.eye.style["left"]=`${offset}px`;
            this.eye.style["top"]=`${offset}px`;
            this.eye.style["background-color"]=`black`;
            this.body.appendChild(this.eye);
            this.container.appendChild(this.body);
            this.pos=this.body.getBoundingClientRect();
            this.center_point={x:this.pos.left+this.pos.width/2,y:this.pos.top+this.pos.height/2}
            this.lookto_deg=0;
        }
    }
    redraw(){
        this.body.style["transform"]=`rotateZ(${this.lookto_deg+45}deg)`;
    }
    lookto(point){
        (async()=>{
            this.lookto_deg=this.getAngle(this.center_point.x,this.center_point.y,point.x,point.y);
        })();
    }

    getAngle(x0,y0,x1,y1){
        const x=Math.abs(x0-x1);
        const y=Math.abs(y0-y1);
        const hypotl=Math.sqrt(Math.pow(x, 2)+Math.pow(y, 2));
        let angle=Math.asin(y/hypotl)*180/Math.PI;
        if(x1>=x0 && y1<=y0){//第一象限
            angle=90-angle;
        }else if(x1>=x0 && y1>=y0){//第二象限
            angle=90+angle;
        }else if(x1<=x0 && y1>=y0){//第三象限
            angle=270-angle;
        }else if(x1<=x0 && y1<=y0){//第四象限
            angle=270+angle;
        }
        return angle;
    }

    conflict(rect){
        let ret=false;
        if(rect){
            const t_rect={
                x:rect.x||0
                ,y:rect.y||0
                ,w:rect.w||0
                ,h:rect.h||0
            };
            t_rect.left=t_rect.x;
            t_rect.right=t_rect.x+t_rect.w;
            t_rect.top=t_rect.y;
            t_rect.bottom=t_rect.y+t_rect.h;


            const zx = Math.abs(t_rect.left + t_rect.right -this.rect.left - this.rect.right);
            const x  = Math.abs(t_rect.left - t_rect.right) + Math.abs(this.rect.left - this.rect.right);
            const zy = Math.abs(t_rect.top + t_rect.bottom - this.rect.top - this.rect.bottom);
            const y  = Math.abs(t_rect.top - t_rect.bottom) + Math.abs(this.rect.top - this.rect.bottom);
            ret=(zx <= x && zy <= y);
        }
        return ret;
    }
}