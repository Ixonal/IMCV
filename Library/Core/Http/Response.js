
define("IMVC.Http.Response").assign({
  nodeResponse: null,

  Response: function(nodeResponse) {
    this.nodeResponse = nodeResponse;
  },

  //causes the browser to redirect to a different url
  redirect: overload(
    [String],
    function(url) {
      this.writeHead(302, {
        Location: url
      });
      this.end();
    },

    [IMVC.Controllers.Controller, String],
    function(controller, actionName) {
      this.redirect(IMVC.Routing.Router.reverseRoute(controller, actionName));
    },

    [String, String],
    function(controllerName, actionName) {
      console.log(IMVC.Routing.Router.reverseRoute(controllerName, actionName));
      this.redirect(IMVC.Routing.Router.reverseRoute(controllerName, actionName));
    }
  ),

  writeContinue: function() {
    return this.nodeResponse.writeContinue();
  },

  writeHead: function(statusCode, reasonPhrase, headers) {
    return this.nodeResponse.writeHead(statusCode, reasonPhrase, headers);
  },

  writeHeader: function() {

  },

  setHeader: function() {

  },

  getHeader: function() {

  },

  removeHeader: function() {

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
