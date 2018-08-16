
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
    main_container.filled_with_window=function(parent_window){
        const parent=parent_window||window;
        const style=window.getComputedStyle(this);
        this.setRect({
            x:0
            ,y:0
            ,w:window.innerWidth-util.float(style["border-left-width"],0)-util.float(style["border-right-width"],0)
            ,h:window.innerHeight-util.float(style["border-top-width"],0)-util.float(style["border-bottom-width"],0)
        });
    }
    window.addEventListener("resize",(event)=>{
        main_container.filled_with_window();
    });
    main_container.filled_with_window();
    main_container.addEventListener("mousemove",(event)=>{
        window.a=event;
        const main_container=event.currentTarget;
        const c_left=main_container.querySelector(".container.left");
        const c_center=main_container.querySelector(".container.center");
        const c_right=main_container.querySelector(".container.right");
        const pointer={
            x:event.clientX
            ,y:event.clientY
        };
        const left_rect=c_left.getBoundingClientRect();
        const right_rect=c_right.getBoundingClientRect();
        const fuzzy=10;
        if(
            (pointer.x-left_rect.right>0 && pointer.x-left_rect.right<fuzzy) //鼠标在左侧栏边框
            ||(right_rect.left-pointer.x>0 && right_rect.left-pointer.x<fuzzy) //鼠标在右侧栏边框
        ){
            main_container.style["cursor"]="col-resize";
        }else{
            main_container.style["cursor"]="unset";
        }
    });
});
