
require("./Controller");
require("../Routing/Router");


define("IMVC.Controllers.Error").extend("IMVC.Controllers.Controller").assign({
  Error: function(context) {
    this.Controller(context);
  },

  404: function(requestArgs) {
    this.fileNotFound(requestArgs);
  },

  403: function(requestArgs) {
    this.forbidden(requestArgs);
  },

  500: function(requestArgs) {
    this.internalServerError(requestArgs);
  },

  fileNotFound: function(requestArgs) {
    this.response.writeHead(404);
    this.render("/Error/404.html", requestArgs);
  },

  forbidden: function(requestArgs) {
    this.response.writeHead(403);
    this.render("/Error/403.html", requestArgs);
  },

  internalServerError: function(requestArgs) {
    this.response.writeHead(500);
    COM.SCM.SubClassTree.extend(this.viewLocals, requestArgs);
    this.render("500.html");
    //this.response.end("500 internal server error");
  }
}).statics({

  //routes for errors are hard coded as /error/{errNumber}
  errorRoute: ["GET /error/{errNumber} IMVC.Controllers.Error.{errNumber}"]
});
