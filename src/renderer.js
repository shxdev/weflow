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
});

