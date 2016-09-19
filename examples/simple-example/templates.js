;(function(root,factory){
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        if (typeof root === 'undefined' || root !== Object(root)) {
            throw new Error('templatizer: window does not exist or is not an object');
        }
        root.templatizer = factory();
    }
}(this, function () {
    var pug = require('pug/runtime')

    var puglatizer = {}
    puglatizer[""]["session"] = {}
    puglatizer[""]["session"]["create"] = function template(a){var s,l,e="";try{l=1,e+='<div class="row" style="margin-top:100px">',l=2,e+='<div class="col-md-4 col-md-offset-4">',l=3,e+='<div class="panel panel-primary">',l=4,e+='<div class="panel-heading">',l=5,e+="<h5>",l=5,e+="Create you login screen here</h5></div>",l=6,e+='<div class="panel-body">',l=7,e+='<div class="form-group">',l=8,e+="<label>",l=8,e+="Email</label>",l=9,e+='<input class="form-control" type="email" name="email"/></div>',l=10,e+='<div class="form-group">',l=11,e+="<label>",l=11,e+="Password</label>",l=12,e+='<input class="form-control" type="password" name="password"/></div>',l=13,e+="<hr/>",l=14,e+='<div class="form-group">',l=15,e+='<button class="btn btn-success" type="button">',l=15,e+="Login</button></div></div></div></div></div>"}catch(o){pug.rethrow(o,s,l)}return e};


    return puglatizer;
}));
