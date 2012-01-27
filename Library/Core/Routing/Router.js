
var url = require("url"),
    fs = require("fs");

define("Routing.Router").assign({
  routes: null,

  Router: function() {
    this.routes = Routing.Router.routes;
  },

  route: function(request, response) {
    var selectedIndex,
        controllerClass,
        controller,
        action,
        args;

    selectedIndex = this.resolve(request);

    if(selectedIndex === null) {
      //throw an error here, 404
      Logger.log("404 error");
      response.end();
      return;
    }

    this.routes[selectedIndex.index].activate(request, response, selectedIndex);

    destroy(this);
  },

  resolve: function(request) {
    var urlObj = url.parse(request.url, true),
        routeVars,
        index;

    for(index in this.routes) {
      if(this.routes[index].sameMethodAs(request.method) &&
         (routeVars = this.routes[index].samePathAs(urlObj.pathname))) {

        return {index: index, routeVars: routeVars, query: urlObj.query};
      }
    }

    return null;
  },

  //causes the browser to redirect to a different url
  redirect: function(url) {

  },

  //overrides the current route and runs a new url or
  //controller.action without notifying the browser
  swapTo: overload(
    [String],
    function(url) {
      Logger.error("swapTo(url) not yet implemented");
    },

    [Controller, Function],
    function(controller, action) {
      Logger.error("swapTo(controller, action) not yet implemented");
    },

    [Controller, String],
    function(controller, actionString) {
      Logger.error("swapTo(controller, actionString) not yet implemented");
    },

    [String, String],
    function(controllerString, actionString) {
      Logger.error("swapTo(controllerString, actionString) not yet implemented");
    }
  )

}).statics({
  ROUTE_FILE: config.http.routes,

  loadRoutes: function() {
    var routeText = fs.readFileSync(constants.AppRoot + config.http.routes).toString(),
        routeLines,
        index;

    //oh god the fun with regular expressions!

    //remove comments
    routeText = routeText.replace(/[#].*[\n\r]/gim, "");

    //remove excess spaces
    routeText = routeText.replace(/[ \t]+/gim, " ");

    //remove returns
    routeText = routeText.replace(/\r/gim, "");

    //remove extra newlines
    routeText = routeText.replace(/\n*(.+)\n*/, "$1\n")

    //remove any spare last newlines
    routeText = routeText.replace(/^(.*)(\n?)$/gim, "$1");

    //split along the newlines
    routeLines = routeText.split(/\n/);

    Routing.Router.parseRoutes(routeLines);
  },

  parseRoutes: function(routes) {
    var routeParts,
        index,
        method,
        path,
        operation,
        newRoute;

    for(index in routes) {
      routeParts = routes[index].split(/ /);
      
      //ignore improperly formatted lines
      if(routeParts.length != 3) {
        Logger.error("Invalid route found: " + routes[index]);
        continue;
      }

      
      method = routeParts[0];
      path = routeParts[1];
      operation = routeParts[2];

      if(operation.toLowerCase().indexOf(".") != -1) {
        newRoute = new Routing.ControllerActionRoute(method, path, operation);
      } else if(operation.toLowerCase().indexOf("static") != -1) {
        newRoute = new Routing.StaticRoute(method, path, operation);
      } else if(operation.toLowerCase().indexOf("ignore") != -1) {
        newRoute = new Routing.IgnoreRoute(method, path, operation);
      } else {
        Logger.error("Unknown action string: " + operation);
      }

      Routing.Router.routes.push(newRoute);
    }
  },

  routes: []
});

