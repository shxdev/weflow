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
    module.exports=exports=Util;
}).call(this,exports, require, module,__filename,__dirname)


