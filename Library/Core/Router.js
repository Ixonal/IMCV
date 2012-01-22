
//require("./Controller.js");

var url = require("url");

define("Router").assign({
  routes: null,
  controllers: null,

  Router: function() {
    this.controllers = Controller.getAllControllers();
    this.routes = {};

    this.ignore = [];

    this.ignore.push("/favicon.ico"),

    this.routes["index"] = {
      controller: "HomeController",
      action: "Index",
      method: "get"
    };

  },

  route: function(request, response) {
    var selectedIndex,
        controllerClass,
        controller,
        action,
        args;

    selectedIndex = this.resolve(request);

    if(selectedIndex === null) {
      console.log("the route is ignored");
      response.end();
      return;
    }

    controllerClass = COM.ClassObject.obtainNamespace(this.routes[selectedIndex].controller);
    controller = new controllerClass(request, response);
    action = controller[this.routes[selectedIndex].action];
    args = [];

    console.log("about to route.");


    setTimeout(function() { action.apply(controller, args); }, 1)

    console.log("now routing...");
    
    //this.routes["default"].render();
  },

  resolve: function(request) {

    var urlString = url.parse(request.url),
        index;

    for(index in this.ignore) {
      if(urlString.pathname === this.ignore[index]) {
        return null;
      }
    }

    return "index";
  },


  loadRoutes: function() {

  }
}).statics({
  ROUTE_FILE: "",

  loadRoutes: function() {

  },

  routes: null
});
