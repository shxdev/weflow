
const util=require("./util.js");

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
    main_container.fn_filled_with_window=function(parent_window){
        const parent=parent_window||window;
        const style=window.getComputedStyle(this);
        this.setRect({
            x:0
            ,y:0
            ,w:parent.innerWidth-util.float(style["border-left-width"],0)-util.float(style["border-right-width"],0)
            ,h:parent.innerHeight-util.float(style["border-top-width"],0)-util.float(style["border-bottom-width"],0)
        });
    }
    main_container.fn_pointer_at_coloum_resize = function (pointer) {
        const c_left = main_container.querySelector(".container.left");
        const c_center = main_container.querySelector(".container.center");
        const c_right = main_container.querySelector(".container.right");
        const left_rect = c_left.getBoundingClientRect();
        const right_rect = c_right.getBoundingClientRect();
        const fuzzy = 10;
        // if (Math.abs(pointer.x - left_rect.right)< fuzzy) {//鼠标在左侧栏边框
        if (pointer.x - left_rect.right > 0 && pointer.x - left_rect.right < fuzzy) {//鼠标在左侧栏边框
            return "left";
        // } else if (Math.abs(pointer.x - right_rect.left) < fuzzy) { //鼠标在右侧栏边框
        } else if (pointer.x-right_rect.left > 0 && pointer.x - right_rect.left < fuzzy){ //鼠标在右侧栏边框
            return "right";
        } else {
            return false;
        }
    };

    window.addEventListener("resize",(event)=>{
        main_container.fn_filled_with_window();
    });
    main_container.fn_filled_with_window();
    main_container.addEventListener("pointermove",(event)=>{
        const main_container=event.currentTarget;
        const pointer = {
            x: event.clientX
            , y: event.clientY
        };
        if (main_container.isColumnResizing){
            const { target, mouseDownPointer, mouseDownRect} = main_container.resizingData;
            if (main_container.isColumnResizing==="left"){
                target.style["width"] = `${mouseDownRect.width + (pointer.x - mouseDownPointer.x)}px`;
            } else if (main_container.isColumnResizing === "right") {
                target.style["width"] = `${mouseDownRect.width + (mouseDownPointer.x - pointer.x)}px`;
            }

        }else{
            main_container.style["cursor"] = main_container.fn_pointer_at_coloum_resize(pointer) ? "col-resize" : "unset";

        }
    },true);
    main_container.addEventListener("pointerdown", (event) => {
        const main_container = event.currentTarget;
        const pointer = {
            x: event.clientX
            , y: event.clientY
        };
        main_container.isColumnResizing = main_container.fn_pointer_at_coloum_resize(pointer);
        main_container.setPointerCapture(event.pointerId);
        if (main_container.isColumnResizing){
            const target = (main_container.isColumnResizing === "left") ? main_container.querySelector(".container.left") : main_container.querySelector(".container.right") ;
            main_container.resizingData={
                target
                , mouseDownPointer:pointer
                , mouseDownRect:target.getBoundingClientRect()
            }; 
        }

    },true);
    main_container.addEventListener("pointerup", (event) => {
        const main_container = event.currentTarget;
        main_container.isColumnResizing=false;
        main_container.releasePointerCapture(event.pointerId);
    });
});
