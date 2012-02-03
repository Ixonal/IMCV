
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

  fileNotFound: function(requestArgs) {
    this.response.redirect("IMVC.Controllers.Error", "404", requestArgs);
  },

  forbidden: function(requestArgs) {
    this.response.redirect("IMVC.Controllers.Error", "403", requestArgs);
  },

  internalServerError: function(requestArgs) {
    IMVC.Routing.Router.swapTo("IMVC.Controllers.Error", "500", this.request, this.response, requestArgs);
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
        controllerName = this.getClassName(),
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
    setTimeout(function() {
      try {
        view.render();
      } catch(e) {
        
        switch(e.number) {
          case 404:
            view.response.redirect("IMVC.Controllers.Error", "404", view.viewData);
            break;
          case 500:
          default:
            IMVC.Routing.Router.swapTo("IMVC.Controllers.Error", "500", view.request, view.response, view.viewData);
            break;
        }
      }
    }, 1);
    //console.log("a controller is trying to render.");
  }
});
