
require("./Route.js");

define("Routing.IgnoreRoute").extend("Routing.Route").assign({
  IgnoreRoute: function(method, path, operation) {
    this.Route(method, path, operation);

    //action should always be ignore for this
    if(operation.toString().toLowerCase() !== "ignore") {
      throw new Error("Can't create an ignore route that doesn't ignore.");
    }

    this.operation.ignore = operation;

  },

  activate: function(request, response, routeInfo) {
    Logger.log("ignoring a route");
      response.end();
      return;
  }
});
