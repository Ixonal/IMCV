
require("./Route.js");

define("Routing.ControllerActionRoute").extend("Routing.Route").assign({

  ControllerActionRoute: function(method, path, operation) {
    this.Route(method, path, operation);

    if(operation.lastIndexOf(".") == -1) {
      throw new Error("ControllerActionRoute requires both a controller and an action.");
    }

    this.operation.controller = operation.substring(0, operation.lastIndexOf("."));
    this.operation.action = operation.substring(operation.lastIndexOf(".") + 1, operation.length);
  },

  activate: function(request, response, routeInfo) {
    var controllerClass = COM.ClassObject.obtainNamespace(this.operation.controller),
        controller = new controllerClass(request, response),
        action = controller[this.operation.action],
        args = [];


    args.push(COM.SCM.SubClassTree.extend(routeInfo.query, routeInfo.routeVars));

    setTimeout(function() { action.apply(controller, args); }, 1)
  }
});
