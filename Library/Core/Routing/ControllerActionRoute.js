
require("./Route.js");

define("Routing.ControllerActionRoute").extend("Routing.Route").assign({
  actionArgs: null,

  ControllerActionRoute: function(method, path, operation) {
    this.Route(method, path, operation);

    if(operation.lastIndexOf(".") == -1) {
      throw new Error("ControllerActionRoute requires both a controller and an action.");
    }

    this.operation.controller = operation.substring(0, operation.lastIndexOf("."));
    this.operation.action = operation.substring(operation.lastIndexOf(".") + 1, operation.length);
  },

  //resolves a variable controller
  resolveController: function(controller, routeVars) {
    var currentVar,
        variableReg = /[\{]([^}]+)[\}]/;

    while(variableReg.test(controller)) {
      currentVar = (variableReg.exec(controller));
      if(currentVar == null) throw new Error("Controller unmapped");
      else currentVar = currentVar[1];
      controller = controller.replace(variableReg, routeVars[currentVar]);
    }

    return controller;
  },

  //resolves a variable action
  resolveAction: function(action, routeVars) {
    var currentVar,
        variableReg = /[\{]([^}]+)[\}]/;
    
    while(variableReg.test(action)) {
      currentVar = (variableReg.exec(action));
      if(currentVar == null) throw new Error("Action unmapped");
      else currentVar = currentVar[1];
      action = action.replace(variableReg, routeVars[currentVar])
    }

    return action;
  },

  activate: function(request, response, routeInfo) {
    var controllerClass,
        controller,
        actionName,
        action,
        args = [];


    //this.actionArgs = COM.SCM.SubClassTree.extend({}, routeInfo.query);
    //this.actionArgs = COM.SCM.SubClassTree.extend(this.actionArgs, routeInfo.routeVars);
    args.push(COM.SCM.SubClassTree.extend(routeInfo.query, routeInfo.routeVars));


    //console.log(Control);

    //console.log(controllerClass);

    controllerClass = COM.ClassObject.obtainNamespace(this.resolveController(this.operation.controller, routeInfo.routeVars))
    actionName = this.resolveAction(this.operation.action, routeInfo.routeVars);
    controller = new controllerClass(request, response);
    controller.actionName = actionName;
    action = controller[actionName];

    
    setTimeout(function() { action.apply(controller, args); }, 1)
  }
});
