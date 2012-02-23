
var url = require("url"),
    fs = require("fs");

    require("../Logger");
    require("./ControllerActionRoute");
    require("../Http/HttpContext");

define("IMVC.Routing.Router").assign({
  routes: null,

  Router: function() {
    this.routes = IMVC.Routing.Router.routes;
  },

  route: function(context) {
    var selectedIndex;

    selectedIndex = this.resolve(context.request);

    if(selectedIndex === null) {
      //throw an error here, 404
      IMVC.Logger.log("404 error");
      response.redirect("IMVC.Controllers.Error", "404");
    }

    this.routes[selectedIndex.index].activate(context, selectedIndex);

    destroy(this);
  },

  resolve: function(request) {
    var urlObj = url.parse(request.getUrl(), true),
        routeVars,
        index;

    for(index in this.routes) {
      if(this.routes[index].sameMethodAs(request.getMethod()) &&
         (routeVars = this.routes[index].samePathAs(urlObj.pathname))) {

        return {index: index, routeVars: routeVars, query: urlObj.query};
      }
    }

    return null;
  }

}).statics({
  ROUTE_FILE: config.http.routes,
  variableReg: /[\{]([^}]+)[\}]/,


  

  //overrides the current route and runs a new 
  //controller.action without notifying the browser
  swapTo: overload(
    [IMVC.Controllers.Controller, String, IMVC.Http.HttpContext],
    function(controllerClass, actionString, context) {
      return IMVC.Routing.Router.swapTo(controllerClass, actionString, context, {});
    },

    [String, String, IMVC.Http.HttpContext],
    function(controllerString, actionString, context) {
      return IMVC.Routing.Router.swapTo(controllerString, actionString, context, {});
    },

    [IMVC.Controllers.Controller, String, IMVC.Http.HttpContext, Object],
    function(controllerClass, actionString, context, requestVals) {
      var controller,
          action;

      try {
        controller = new controllerClass(context);
        action = controller[actionString];

        controller.actionName = actionString;
        controller.init();
        action.apply(controller, [requestVals]);

      } catch(e) {
        if(controllerClass == IMVC.Controllers.ErrorController && actionString == "500") {
          Server.criticalError(context.response, "Internal Server Error unreachable, " + e.toString());
        } else {
          IMVC.Routing.Router.swapTo("IMVC.Controllers.Error", "500", context, {requestVals: requestVals, error: e});
        }
        return;
      }
    },

    [String, String, IMVC.Http.HttpContext, Object],
    function(controllerString, actionString, context, requestVals) {

      var controller = COM.ClassObject.obtainNamespace(controllerString);
      IMVC.Routing.Router.swapTo(controller, actionString, context, requestVals);
    }
  ),


  loadRoutes: function() {
    var routeText = fs.readFileSync(constants.AppRoot + config.http.routes).toString(),
        routeLines;

    //oh god the fun with regular expressions!

    //remove comments
    routeText = routeText.replace(/[#].*[\n\r]/gim, "");

    //remove excess spaces
    routeText = routeText.replace(/[ \t]+/gim, " ");

    //remove returns
    routeText = routeText.replace(/\r/gim, "");

    //remove extra newlines
    routeText = routeText.replace(/\n*(.+)\n*/, "$1\n");

    //remove any spare last newlines
    routeText = routeText.replace(/^(.*)(\n?)$/gim, "$1");

    //split along the newlines
    routeLines = routeText.split(/\n/);

    IMVC.Routing.Router.parseRoutes(routeLines);
  },

  parseRoutes: function(routes) {
    var routeParts,
        index,
        method,
        path,
        operation,
        newRoute;

    for(index in routes) {
      routeParts = routes[index].split(/\s/);
      
      //ignore improperly formatted lines
      if(routeParts.length != 3) {
        Logger.error("Invalid route found: " + routes[index]);
        continue;
      }

      
      method = routeParts[0];
      path = routeParts[1];
      operation = routeParts[2];

      if(operation.toLowerCase().indexOf(".") != -1) {
        newRoute = new IMVC.Routing.ControllerActionRoute(method, path, operation);
      } else if(operation.toLowerCase().indexOf("static") != -1) {
        newRoute = new IMVC.Routing.StaticRoute(method, path, operation);
      } else if(operation.toLowerCase().indexOf("ignore") != -1) {
        newRoute = new IMVC.Routing.IgnoreRoute(method, path, operation);
      } else {
        Logger.error("Unknown action string: " + operation);
      }

      IMVC.Routing.Router.routes.push(newRoute);
    }
  },

  reverseRoute: overload(
    [String, String],
    function(controllerString, actionString) {
      return IMVC.Routing.Router.reverseRoute(controllerString, actionString, {});
    },

    [IMVC.Controllers.Controller, String],
    function(controller, actionString) {
      return IMVC.Routing.Router.reverseRoute(controller, actionString, {});
    },

    [IMVC.Controllers.Controller, String, Object],
    function(controller, actionString, otherInfo) {
      var controllerNamespace = controller.getClassNamespace(),
          controllerName = controller.getClassName(),
          controllerString;

      if(typeof(otherInfo) != "object") otherInfo = {};

      if(controllerNamespace && controllerNamespace.length > 0) {
        controllerString = controllerNamespace + "." + controllerName;
      } else {
        controllerString = controllerName;
      }

      return IMVC.Routing.Router.reverseRoute(controllerString, actionString, otherInfo);
    },
    
    [String, String, Object],
    function(controllerString, actionString, otherInfo) {
      var index, index2,
          routes = IMVC.Routing.Router.routes,
          variableReg = IMVC.Routing.Router.variableReg,
          textCaptureReg = "([a-zA-Z0-9_\\.&%\\-]+)",
          matchingRoute = null,
          matchingRoutePath,
          currentController,
          currentAction,
          controllerReg,
          actionReg,
          controllerResult,
          actionResult,
          controllerVars,
          actionVars,
          screenedVars = [];

      if(typeof(otherInfo) != "object") otherInfo = {};

      //check for static routes
      for(index in routes) {
        if(routes[index].getClassName() != "ControllerActionRoute") continue;

        controllerVars = [];
        actionVars = [];

        currentController = "^" + routes[index].operation.controller + "$";
        currentAction = "^" + routes[index].operation.action + "$";

        while(variableReg.test(currentController)) {
          controllerVars.push(variableReg.exec(currentController)[1]);
          currentController = currentController.replace(variableReg, textCaptureReg);
        }

        while(variableReg.test(currentAction)) {
          actionVars.push(variableReg.exec(currentAction)[1]);
          currentAction = currentAction.replace(variableReg, textCaptureReg);
        }

        controllerReg = new RegExp(currentController, "g");
        actionReg = new RegExp(currentAction, "g");

        controllerResult = controllerReg.exec(controllerString);
        actionResult = actionReg.exec(actionString);

        if(controllerResult != null && actionResult != null) {

          for(index2 = 1; index2 < controllerResult.length; index2++) {

            otherInfo[controllerVars[index2 - 1]] = controllerResult[index2];
          }

          for(index2 = 1; index2 < actionResult.length; index2++) {
            otherInfo[actionVars[index2 - 1]] = actionResult[index2];
          }
          matchingRoute = routes[index];
          matchingRoutePath = matchingRoute.path;
          break;
        }

      }

      if(matchingRoute == null) {
        throw new Error("The router was unable to find a route for that controller and action.");
      }

      //adjust the route to the given information
      while(variableReg.test(matchingRoutePath)) {
        index = variableReg.exec(matchingRoutePath);
        index = index[1];
        matchingRoutePath = matchingRoutePath.replace(variableReg, otherInfo[index]);
        screenedVars.push(index);
      }

      for(index in screenedVars) {
        delete otherInfo[index];
      }

      matchingRoutePath = matchingRoutePath + IMVC.Routing.Router.constructQueryString(otherInfo);


      return matchingRoutePath;
    }
  ),

  constructQueryString: function(queryData) {
    var index,
        queryString = "?";

    for(index in queryData) {
      queryString += escape(index);
      queryString += "=";
      queryString += escape(queryData[index]);
      queryString += "&";
    }

    return queryString.substring(0, queryString.length - 1);
  },

  routes: []
});

