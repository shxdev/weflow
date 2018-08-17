(function(exports, require, module,__filename, __dirname, process, global, Buffer){
    const Util=require("util");
    Util.int=function(v,default_value){
        const ret=parseInt(v);
        return isNaN(ret)?default_value:ret;
    };
    Util.float=function(v,default_value){
        const ret=parseFloat(v);
        return isNaN(ret)?default_value:ret;
    };
    Util.intValue=function(){
        const ret=undefined;
        for(let i=0;i<arguments.length;i++){
            const v=this.int(arguments[i]);
            if(v!==undefined){
                ret=v;
                break;
            }
        }
        return ret;
    };
    Util.floatValue=function(){
        let ret=undefined;
        for(let i=0;i<arguments.length;i++){
            const v=this.float(arguments[i]);
            if(v!==undefined){
                ret=v;
                break;
            }
        }
        return ret;
    };
    Util.widthAndHeightStatus = function (target) {
        const style = window.getComputedStyle(target);
        let isMaxWidth = false;
        let isMinWidth = false;
        let isMaxHeight = false;
        let isMinHeight = false;
        if (this.int(style["width"]) >= this.int(style["max-width"], Infinity)) {//最大宽度
            isMaxWidth = true;
            isMinWidth = false;
        }
        if (this.int(style["width"]) <= this.int(style["min-width"], 0)) {//最小宽度
            isMaxWidth = false;
            isMinWidth = true;
        }
        if (this.int(style["height"]) >= this.int(style["max-height"], Infinity)) {//最大高度
            isMaxHeight = true;
            isMinHeight = false;
        }
        if (this.int(style["height"]) <= this.int(style["min-height"], 0)) {//最小高度
            isMaxHeight = false;
            isMinHeight = true;
        }

        return { isMaxWidth, isMinWidth, isMaxHeight, isMinHeight }
    };

    module.exports=exports=Util;
}).call(this,exports, require, module,__filename,__dirname)


