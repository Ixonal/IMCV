
define("Control.Controller").assign({
  actionName: null,
  request: null,
  response: null,
  viewData: null,

  Controller: function(request, response) {
    //Controller.allControllers[this.getClassName()] = this;

    this.request = request;
    this.response = response;
    this.viewData = {};
  },

  fileNotFound: function() {
    Routing.Router.redirect(this.response, "/error/404");
    this.response.end();
  },

  forbidden: function() {
    Routing.Router.redirect(this.response, "/error/403");
    this.response.end();
  },

  render: function(viewFile, viewData) {
    var viewRoot = constants.AppRoot + "/App/Views",
        controllerName = this.getClassName().replace(/(\w+)controller/gi, "$1"),
        view;

    if(typeof(viewData) == "object") this.viewData = viewData;


    if(!viewFile || viewFile.length == 0) {
      //viewFile is defined by the action
      viewFile = viewRoot + "/" + controllerName + "/" + this.actionName + ".html";

    } else if(viewFile.charAt(0) == '/') {
      //viewFile is relative to view root
      viewFile = viewRoot + viewFile;

    } else {
      //viewFile is in the controller root
      viewFile = viewRoot + "/" + controllerName + "/" + viewFile;

    }

    view = new Views.View(viewFile, this.request, this.response, this.viewData);
    //console.log("a controller is about to render");
    setTimeout(function() { view.render(); }, 1);
    //console.log("a controller is trying to render.");
  }
});
