(function (root, factory) {
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
    var jade=function(){function n(n){return null!=n&&""!==n}function t(e){return(Array.isArray(e)?e.map(t):e&&"object"==typeof e?Object.keys(e).filter(function(n){return e[n]}):[e]).filter(n).join(" ")}function e(n){return i[n]||n}function r(n){var t=String(n).replace(o,e);return t===""+n?n:t}var a={};a.merge=function t(e,r){if(1===arguments.length){for(var a=e[0],i=1;i<e.length;i++)a=t(a,e[i]);return a}var o=e.class,s=r.class;(o||s)&&(o=o||[],s=s||[],Array.isArray(o)||(o=[o]),Array.isArray(s)||(s=[s]),e.class=o.concat(s).filter(n));for(var f in r)"class"!=f&&(e[f]=r[f]);return e},a.joinClasses=t,a.cls=function(n,e){for(var r=[],i=0;i<n.length;i++)e&&e[i]?r.push(a.escape(t([n[i]]))):r.push(t(n[i]));var o=t(r);return o.length?' class="'+o+'"':""},a.style=function(n){return n&&"object"==typeof n?Object.keys(n).map(function(t){return t+":"+n[t]}).join(";"):n},a.attr=function(n,t,e,r){return"style"===n&&(t=a.style(t)),"boolean"==typeof t||null==t?t?" "+(r?n:n+'="'+n+'"'):"":0==n.indexOf("data")&&"string"!=typeof t?(JSON.stringify(t).indexOf("&")!==-1&&console.warn("Since Jade 2.0.0, ampersands (`&`) in data attributes will be escaped to `&amp;`"),t&&"function"==typeof t.toISOString&&console.warn("Jade will eliminate the double quotes around dates in ISO form after 2.0.0")," "+n+"='"+JSON.stringify(t).replace(/'/g,"&apos;")+"'"):e?(t&&"function"==typeof t.toISOString&&console.warn("Jade will stringify dates in ISO form after 2.0.0")," "+n+'="'+a.escape(t)+'"'):(t&&"function"==typeof t.toISOString&&console.warn("Jade will stringify dates in ISO form after 2.0.0")," "+n+'="'+t+'"')},a.attrs=function(n,e){var r=[],i=Object.keys(n);if(i.length)for(var o=0;o<i.length;++o){var s=i[o],f=n[s];"class"==s?(f=t(f))&&r.push(" "+s+'="'+f+'"'):r.push(a.attr(s,f,!1,e))}return r.join("")};var i={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"},o=/[&<>"]/g;return a.escape=r,a.rethrow=function n(t,e,r,a){if(!(t instanceof Error))throw t;if(!("undefined"==typeof window&&e||a))throw t.message+=" on line "+r,t;try{a=a||require("fs").readFileSync(e,"utf8")}catch(e){n(t,null,r)}var i=3,o=a.split("\n"),s=Math.max(r-i,0),f=Math.min(o.length,r+i),i=o.slice(s,f).map(function(n,t){var e=t+s+1;return(e==r?"  > ":"    ")+e+"| "+n}).join("\n");throw t.path=e,t.message=(e||"Jade")+":"+r+"\n"+i+"\n\n"+t.message,t},a.DebugItem=function(n,t){this.lineno=n,this.filename=t},a}(); 

    var templatizer = {};
    templatizer["session"] = {};
    templatizer["users"] = {};

    // session/create.jade compiled template
    templatizer["session"]["create"] = function tmpl_session_create() {
        return '<div style="margin-top:100px" class="row"><div class="col-md-4 col-md-offset-4"><div class="panel panel-primary"><div class="panel-heading"><h5>Please Login</h5></div><div class="panel-body"><div class="form-group"><label>Email</label><input type="email" name="email" class="form-control"/></div><div class="form-group"><label>Password</label><input type="password" name="password" class="form-control"/></div><hr/><div class="form-group"><button type="button" class="btn btn-success">Login</button><a v-link="{ path:&quot;/users/create&quot; }" class="btn btn-default pull-right">Create Account</a></div></div></div></div></div>';
    };

    // users/create.jade compiled template
    templatizer["users"]["create"] = function tmpl_users_create() {
        return '<div style="margin-top:100px" class="row"><div class="col-md-4 col-md-offset-4"><div class="panel panel-primary"><div class="panel-heading"><h5>Create Account</h5></div><div class="panel-body"><div class="form-group"><label>First</label><input type="text" placeholder="First Name" v-model="first" class="form-control"/></div><div class="form-group"><label>Last</label><input type="text" placeholder="Last Name" v-model="last" class="form-control"/></div><div class="form-group"><label>Email</label><input type="email" placeholder="Email" v-model="email" class="form-control"/></div><div class="form-group"><label>Password</label><input type="password" v-model="password" class="form-control"/></div><hr/><div class="form-group"><button type="button" @click.prevent="create" class="btn btn-success">Create Account</button><a v-link="{ path:&quot;/session/create&quot; }" class="btn btn-default pull-right">Go To Login Page</a></div></div></div></div></div>';
    };

    return templatizer;
}));
