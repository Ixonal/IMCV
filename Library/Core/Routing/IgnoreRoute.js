
require("./Route.js");

define("IMVC.Routing.IgnoreRoute").extend("IMVC.Routing.Route").assign({
  IgnoreRoute: function(method, path, operation, secureStatus) {
    this.Route(method, path, operation, secureStatus);

    //action should always be ignore for this
    if(operation.toString().toLowerCase() !== "ignore") {
      throw new Error("Can't create an ignore route that doesn't ignore.");
    }

    this._operation.ignore = operation;

  },

  activate: function(context, routeInfo) {
    context.response.end();
    return;
  }
});
