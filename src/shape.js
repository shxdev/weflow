"use strict";
(function(exports, require, module,__filename, __dirname, process, global, Buffer){
    class Shape{
        constructor(){
            this.canvas = document.createElement("canvas");
            this.path_set = [];
        }
    };

    class ShapRectangle extends Shape{
        constructor() {
            super();

            // console.log(this.path_set);
        }
    }

    const Line = function (){};



    module.exports = exports = { Shape, Line, ShapRectangle};
}).call(this,exports, require, module,__filename,__dirname)


