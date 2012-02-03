
require("./Controller");
require("../Routing/Router");


define("IMVC.Controllers.Error").extend("IMVC.Controllers.Controller").assign({
  Error: function(request, response) {
    this.Controller(request, response);
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
    this.render("/Error/500.html", requestArgs);
    //this.response.end("500 internal server error");
  }
}).statics({

  //routes for errors are hard coded as /error/{errNumber}
  errorRoute: ["GET /error/{errNumber} IMVC.Controllers.Error.{errNumber}"]
});
