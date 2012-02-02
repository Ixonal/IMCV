
define("IMVC.Controllers.Controller").assign({
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
    //console.log(COM.ClassHierarchy.isObjectthis.response);
    IMVC.Routing.Router.redirect(this.response, "IMVC.Controllers.ErrorController", "404");
    //Routing.Router.redirect(this.response)

    //this.response.end();
  },

  forbidden: function() {
    IMVC.Routing.Router.redirect(this.response, "IMVC.Controllers.ErrorController", "403");
    //this.response.end();
  },

  renderJson: function(viewFile, viewData) {
    if(viewData == undefined) viewData = null;

    if(!viewFile || viewFile.length == 0) {
      viewFile = this.actionName + ".json";
    }

    this.render(viewFile, viewData);
  },

  renderXml: function(viewFile, viewData) {
    if(viewData == undefined) viewData = null;

    if(!viewFile || viewFile.length == 0) {
      viewFile = this.actionName + ".xml";
    }

    this.render(viewFile, viewData)
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

    view = new IMVC.Views.View(viewFile, this.request, this.response, this.viewData);
    //console.log("a controller is about to render");
    setTimeout(function() { view.render(); }, 1);
    //console.log("a controller is trying to render.");
  }
});
