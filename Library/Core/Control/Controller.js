
define("IMVC.Controllers.Controller").assign({
  actionName: null,
  request: null,
  response: null,
  viewData: null,

  Controller: function(request, response) {
    this.request = request;
    this.response = response;
    this.viewLocals = {};

    this.init = event();

    this.preRender = event();

  },

  init: null,

  preRender: null,

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
    var viewRoot = IMVC.Views.View.viewRoot,
        controllerName = this.getClassName(),
        _this = this,
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

    this.preRender();

    view = new IMVC.Views.View(viewFile, this.request, this.response);
    setTimeout(function() {
      try {
        view.render(_this.viewLocals);
      } catch(e) {
        
        switch(e.number) {
          case 404:
            view.response.redirect("IMVC.Controllers.Error", "404", _this.viewLocals);
            break;
          case 500:
          default:
            IMVC.Routing.Router.swapTo("IMVC.Controllers.Error", "500", view.request, view.response, _this.viewLocals);
            break;
        }
      }
    }, 1);
    //console.log("a controller is trying to render.");
  }
});
