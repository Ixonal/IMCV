
require("./Route.js");
require("./Router");

define("IMVC.Routing.ControllerActionRoute").extend("IMVC.Routing.Route").assign({
  actionArgs: null,

  ControllerActionRoute: function(method, path, operation, secureStatus) {
    this.Route(method, path, operation, secureStatus);

    if(operation.lastIndexOf(".") == -1) {
      throw new Error("ControllerActionRoute requires both a controller and an action.");
    }

    this._operation.controller = operation.substring(0, operation.lastIndexOf("."));
    this._operation.action = operation.substring(operation.lastIndexOf(".") + 1, operation.length);
  },

  //resolves a variable controller
  resolveController: function(controller, routeVars) {
    var currentVar,
        variableReg = IMVC.Routing.Router.variableReg;

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
        variableReg = IMVC.Routing.Router.variableReg;
    
    while(variableReg.test(action)) {
      currentVar = (variableReg.exec(action));
      if(currentVar == null) throw new Error("Action unmapped");
      else currentVar = currentVar[1];
      action = action.replace(variableReg, routeVars[currentVar]);
    }

    return action;
  },

  activate: function(context, routeInfo) {
    var controllerClass,
        controller,
        actionName,
        action,
        index;
    
    //populating the request's route hash
    if(routeInfo.routeVars) {
      for(index in routeInfo.routeVars) {
        context.request.routeVals[index] = routeInfo.routeVars[index];
      }
    }

    try {
      
      //get the actual class of the controller
      controllerClass = COM.obtainNamespace(this.resolveController(this._operation.controller, routeInfo.routeVars));
      
      //determine which action to run
      actionName = this.resolveAction(this._operation.action, routeInfo.routeVars);

      //the controller class is a namespace... guess it didn't exist
      if(controllerClass.__Namespace__) {
        //the controller wasn't there, so it made it a namespace
        throw new Error("Controller " + this._operation.controller + " does not exist.");
      }

      //create a new instance of the given controller
      controller = new controllerClass(context);
      controller.actionName = actionName;
      action = controller[actionName];
      
      //that action doesn't exist
      if(typeof(action) == "undefined") {
        destroy(controller);
        throw new Error("Action " + this._operation.full + " does not exist.");
      }

      //fire the controller's init event
      controller.init();

      //detach the controller from the router
      process.nextTick(function() {
        try {
          action.call(controller);
        } catch(e) {
          IMVC.Routing.Router.swapTo("IMVC.Controllers.Error", "500", context, {error: e});
        }
         
      });
      
    } catch(e) {
      IMVC.Routing.Router.swapTo("IMVC.Controllers.Error", "500", context, {error: e});
    }

  }
});
