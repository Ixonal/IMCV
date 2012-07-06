
require("../Utility/Securable");

define("IMVC.Http.Response").extend("IMVC.Utility.Securable").assign({
  nodeResponse: null,
  _context: null,

  Response: function(nodeResponse, isSecure) {
    this.Securable(isSecure);
    this.nodeResponse = nodeResponse;
  },

  //causes the browser to redirect to a different url
  redirect: overload(
    [String],
    function(url) {
      var header = this._context.cookies.toResponseHeader();
      //console.log(header);
      this.setHeader("Set-Cookie", header);
      this.writeHead(302, {
        Location: url
      });
      this.end();
    },
    
    [String, Boolean],
    function(url, useSecure) {
      if(this._context.request.isSecure()) {
        if(useSecure) {
          this.redirect(url);
        } else {
          this.redirect("http://" + config.http.host + (config.http.port === "80"?"":(":" + config.http.port)) + url);
        }
      } else {
        if(useSecure) {
          this.redirect("https://" + config.http.host + (config.http.ssl.port === "443"?"":(":" + config.http.ssl.port)) + url);
        } else {
          this.redirect(url);
        }
      }
    },
    
    [IMVC.Controllers.Controller, String],
    function(controller, actionName) {
      this.redirect(IMVC.Routing.Router.reverseRoute(controller, actionName));
    },
    
    [IMVC.Controllers.Controller, String, Boolean],
    function(controller, actionName, useSecure) {
      this.redirect(IMVC.Routing.Router.reverseRoute(controller, actionName), useSecure);
    },

    [String, String],
    function(controllerName, actionName) {
      this.redirect(IMVC.Routing.Router.reverseRoute(controllerName, actionName));
    },
    
    [String, String, Boolean],
    function(controllerName, actionName, useSecure) {
      this.redirect(IMVC.Routing.Router.reverseRoute(controllerName, actionName), useSecure);
    },

    [IMVC.Controllers.Controller, String, Object],
    function(controller, actionName, otherData) {
      this.redirect(IMVC.Routing.Router.reverseRoute(controller, actionName, otherData));
    },
    
    [IMVC.Controllers.Controller, String, Object, Boolean],
    function(controller, actionName, otherData, useSecure) {
      this.redirect(IMVC.Routing.Router.reverseRoute(controller, actionName, otherData), useSecure);
    },

    [String, String, Object],
    function(controllerName, actionName, otherData) {
      this.redirect(IMVC.Routing.Router.reverseRoute(controllerName, actionName, otherData));
    },
    
    [String, String, Object, Boolean],
    function(controllerName, actionName, otherData, useSecure) {
      this.redirect(IMVC.Routing.Router.reverseRoute(controllerName, actionName, otherData), useSecure);
    },
    
    [String, Object],
    function(url, otherData) {
      this.redirect(url + IMVC.Routing.Router.constructQueryString(otherData));
    },
    
    [String, Object, Boolean],
    function(url, otherData, useSecure) {
      this.redirect(url + IMVC.Routing.Router.constructQueryString(otherData), useSecure);
    }
  ),
  
  writeContinue: function() {
    return this.nodeResponse.writeContinue();
  },

  writeHead: function(statusCode, reasonPhrase, headers) {
    return this.nodeResponse.writeHead(statusCode, reasonPhrase, headers);
  },

  write: function(chunk, encoding) {
    return this.nodeResponse.write(chunk, encoding);
  },

  setHeader: function(name, value) {
    return this.nodeResponse.setHeader(name, value);
  },

  getHeader: function(name) {
    return this.nodeResponse.getHeader(name);
  },

  removeHeader: function(name) {
    return this.nodeResponse.removeHeader(name);
  },

  write: function(data, encoding) {
    return this.nodeResponse.write(data, encoding);
  },

  end: function(data, encoding) {
    return this.nodeResponse.end(data, encoding);
  },

  addTrailers: function(headers) {
    return this.nodeResponse.addTrailers(headers);
  }
});
