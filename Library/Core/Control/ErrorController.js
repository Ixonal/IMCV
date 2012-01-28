
require("./Controller");

define("Control.ErrorController").extend("Control.Controller").assign({
  ErrorController: function(request, response) {
    this.Controller(request, response);
  },

  404: function(requestArgs) {
    this.fileNotFound(requestArgs);
  },

  403: function(requestArgs) {
    this.forbidden(requestArgs);
  },

  fileNotFound: function(requestArgs) {
//    Logger.error("not found not implemented (not found?)");

    this.response.writeHead(404);
    this.render("Error/404.html", requestArgs);

    //this.render("404.html");

    //this.response.end("404 file not found");
  },

  forbidden: function(requestArgs) {
//    Logger.error("forbidden not implemented");
//    this.response.end("403 forbidden");
    this.response.writeHead(403);
    this.render("Error/403.html", requestArgs);
  }
});
