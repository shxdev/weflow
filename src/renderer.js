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
    const pointer_enemy={};
    glob.enemies = glob.enemies||[];
    for(let i=0;i<40;i++){
        glob.enemies.push({center_point:{x:(i+1)*50,y:100}});
    }
    document.addEventListener("pointermove",(event)=>{
        const {clientX,clientY}=event;
        glob.pointermove(clientX,clientY);
        if (glob.enemies.indexOf(pointer_enemy)<0){
            glob.enemies.push(pointer_enemy);
        }
        pointer_enemy.center_point = { x: clientX, y: clientY};
    })
    let down_point = undefined;
    const fn_autofire=()=>{
        if (down_point){
            glob.fire(down_point.x,down_point.y);
            requestAnimationFrame(fn_autofire);
        }else{
            cancelAnimationFrame(fn_autofire);
        }
    }
    document.addEventListener("pointerdown", (event) => {
        down_point={x:event.clientX,y:event.clientY};
        fn_autofire();
    })
    document.addEventListener("pointermove", (event) => {
        if(down_point){
            down_point = { x: event.clientX, y: event.clientY };
        }
    })
    document.addEventListener("pointerup", (event) => {
        down_point = undefined;
    })

    glob.b_array=[];
    let conflict_count=0
    const view_port=document.querySelector(".container.center>.canvas");
    const view_port_canvas = document.querySelector(".container.center>.canvas>div");
    const view_port_rect=view_port.getBoundingClientRect();
    const default_w = 23;//parseInt(Math.min(view_port_rect.width,view_port_rect.height)/20);
    const default_space = 2;
    const max_col = parseInt(view_port_rect.width / (default_w + default_space));
    const max_row = parseInt(view_port_rect.height / (default_w + default_space));

    // glob.gen_map(max_col,max_row);
    // const div_valid_area=document.createElement("div");
    // div_valid_area.style["position"] ="absolute";
    // div_valid_area.style["left"] = "0px";
    // div_valid_area.style["top"] = "0px";
    // div_valid_area.style["width"] = `${max_col * (default_w+default_space)}px`;
    // div_valid_area.style["height"] = `${max_row * (default_w + default_space)}px`;
    // div_valid_area.style["background-color"] = "rgba(0,0,0,0.5)";
    // div_valid_area.style["pointer-events"] = "none";
    // view_port_canvas.appendChild(div_valid_area);
    const div_mask_area1 = document.createElement("div");
    const div_mask_area2 = document.createElement("div");
    div_mask_area1.style["position"] = "absolute";
    div_mask_area2.style["position"] = "absolute";

    div_mask_area1.style["left"] = "0px";
    div_mask_area1.style["top"] = `${max_row * (default_w + default_space)}px`;
    div_mask_area1.style["width"] = `${view_port_rect.width}px`;
    div_mask_area1.style["height"] = `${(default_w + default_space)*2}px`;
    
    div_mask_area2.style["left"] = `${max_col * (default_w + default_space)}px`;
    div_mask_area2.style["top"] = "0px";
    div_mask_area2.style["width"] = `${(default_w + default_space) * 2}px`;
    div_mask_area2.style["height"] = `${max_row * (default_w + default_space)}px`;

    div_mask_area1.style["background-color"] = "rgba(0,0,0,0.5)";
    div_mask_area1.style["pointer-events"] = "none";
    div_mask_area2.style["background-color"] = "rgba(0,0,0,0.5)";
    div_mask_area2.style["pointer-events"] = "none";

    view_port_canvas.appendChild(div_mask_area1);
    view_port_canvas.appendChild(div_mask_area2);


    for(let i=0;i<100;i++){
        const rect={
            x: parseInt(Math.random() * max_col) * (default_w + default_space) //parseInt(Math.random()*(view_port_rect.width-default_w*2))
            , y: parseInt(Math.random() * max_row) * (default_w + default_space) //parseInt(Math.random()*(view_port_rect.height-default_w*2))
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
            glob.b_array.push(new Battery({...rect,level:parseInt(Math.random()*5+1)}))
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
    pointermove:function(x,y){
        // (glob.b_array||[]).forEach((b)=>{
        //     b.lookto({x,y});
        // });
    }
    ,fire: function(x, y) {
        (glob.b_array || []).forEach((b) => {
            b.fire( x, y );
        });
    }
    , gen_map: function (col,row){
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
        this.level = this.options && this.options.level||1;
        this.level_color = ["lightgray", "lightgreen", "lightblue", "gold", "orangered"];
        this.status="working";
        this.fire_pre_sec = 1.5;
        this.bullet_speed_pre_sec = 500;
        this.fire_distance=Infinity;
        this.radar_range = 100;
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
            this.eye.style["border-radius"]=`${this.rect.w/10}px`;
            this.eye.style["left"]=`${offset}px`;
            this.eye.style["top"]=`${offset}px`;
            this.eye.style["background-color"]=`black`;
            this.body.appendChild(this.eye);
            this.container.appendChild(this.body);
            this.pos=this.body.getBoundingClientRect();
            this.center_point={x:this.pos.left+this.pos.width/2,y:this.pos.top+this.pos.height/2}
            this.offset_center_point = { x: this.body.offsetLeft + this.body.offsetWidth / 2, y: this.body.offsetTop + this.body.offsetHeight / 2};
        }
        if(!this.radar){
            this.radar=document.createElement("div");
            this.radar.style["position"] = `absolute`;
            this.radar.style["width"] = `${this.radar_range*2}px`;
            this.radar.style["height"] = `${this.radar_range*2}px`;
            this.radar.style["left"] = `${this.offset_center_point.x - this.radar_range}px`;
            this.radar.style["top"] = `${this.offset_center_point.y - this.radar_range}px`;
            this.radar.style["border"] = `1px solid ${this.level_color[this.level-1]||this.level_color[0]}`;
            this.radar.style["background-color"] = `transparent`;
            this.radar.style["opacity"] = `0.3`;
            this.radar.style["border-radius"] = `${this.radar_range}px`;
            this.radar.style["pointer-events"] = `none`;
            this.container.appendChild(this.radar);
        }
        this.lookto_deg = 0;
        this.search();

    }
    redraw(){
        this.body.style["transform"] = `rotateZ(${this.lookto_deg + 45}deg)`;
        let bg_color = this.level_color[this.level - 1] || this.level_color[0];
        this.body.style["background-color"] = bg_color  ;
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

    distance(p0,p1){
        return Math.sqrt(Math.pow(p0.x - p1.x, 2) + Math.pow(p0.y - p1.y, 2));
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
    convertAngle(angle){
        if(angle<=90){
            return 90-angle; 
        }else if(angle<=180){
            return -(angle-90);
        } else if (angle <= 270) {
            return -(angle - 90);
        } else if (angle <= 360) {
            return 360-angle+90;
        }
        return angle;
    }
    search(){
        if(this.status==="working"){
            const see_enemies=[];
            (glob.enemies||[]).forEach((enemy)=>{
                if (enemy.center_point && this.distance(this.center_point, enemy.center_point) < this.radar_range){
                    see_enemies.push(enemy);
                }
            });
            if(see_enemies.length>0){
                this.fire(see_enemies[0].center_point.x, see_enemies[0].center_point.y);
            }
        }
        if(this.status==="destroy"){
            cancelAnimationFrame(()=>{this.search()});
        }else{
            requestAnimationFrame(() => { this.search()});
        }
    }
    fire(x,y){
        this.lookto({x,y});
        const t1=new Date().getTime();
        if (this.last_fire_time && (t1 - this.last_fire_time) < (1000/this.fire_pre_sec)){
            return;
        }
        this.last_fire_time=t1;
        this.bullets = this.bullets||[];
        const bullet=document.createElement("div");
        bullet.style["position"] = `absolute`;
        bullet.style["width"]="2px";
        bullet.style["height"] = "10px";
        bullet.style["background-color"] = "black";
        const angle=this.getAngle(this.center_point.x, this.center_point.y,x,y);
        const converted_angle = this.convertAngle(angle);
        bullet.style["background-color"] = this.level_color[this.level-1]||this.level_color[0];
        bullet.style["transform"] = `rotateZ(${angle}deg)`;



        const scale_x = Math.cos(converted_angle * Math.PI / 180);
        const scale_y = -Math.sin(converted_angle * Math.PI / 180);
        const radius = (this.rect.w / 2);

        this.offset_center_point={
            x: this.body.offsetLeft + this.body.offsetWidth / 2
            , y: this.body.offsetTop + this.body.offsetHeight / 2
        };

        const viewport_rect=this.container.parentElement.getBoundingClientRect();

        const p0_x = this.offset_center_point.x + scale_x * radius + scale_x / Math.abs(scale_x)-1;
        const p0_y = this.offset_center_point.y + scale_y * radius + scale_y / Math.abs(scale_y)-5;
        const p0 = { x: p0_x, y: p0_y };

        bullet.style["left"] = `${p0.x}px`;
        bullet.style["top"] = `${p0.y}px`;
        this.container.appendChild(bullet);

        const t0=new Date().getTime();
        const speed_pre_sec = this.bullet_speed_pre_sec;
        const fn_fly=()=>{
            const t1 = new Date().getTime();
            const sec=(t1-t0)/1000;
            const distance = speed_pre_sec*sec;
            const offset_x = Math.cos(converted_angle * Math.PI / 180) * distance;
            const offset_y = -Math.sin(converted_angle * Math.PI / 180) * distance;

            const x = p0.x + offset_x;
            const y = p0.y + offset_y;
            bullet.style["left"]=`${x}px`;
            bullet.style["top"] = `${y}px`;

            if (distance > this.fire_distance || x < 0 || y < 0 || x > viewport_rect.width || y > viewport_rect.height){
                this.container.removeChild(bullet);
                cancelAnimationFrame(fn_fly);
            }else{
                requestAnimationFrame(fn_fly);
            }
        };
        fn_fly();
    }
}