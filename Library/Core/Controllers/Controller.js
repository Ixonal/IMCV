
define("IMVC.Controllers.Controller").assign({
  _isActive: false,
  actionName: null,
  context: null,
  viewLocals: null,
  _isRedirecting: false,
  
  init: null,
  
  preRender: null,
  
  controllerFiring: null,
  controllerFired: null,
  
  finalize: null,
  
  Controller: function(context) {
    if(!Object.is(context, IMVC.Http.HttpContext)) throw new Error("Instantiating a Constructor requires a valid HttpContext.");
    
    this.context = context;
    this.viewLocals = {};
    this._isActive = false;
    this._isRedirecting = false;

    this.init = event(this);
    this.controllerFiring = event(this);
    this.controllerFired = event(this);
    this.preRender = event(this);
    this.finalize = event(this);

    this.finalize.subscribe(function() {
      var _this = this;
      setTimeout(function() { destroy(_this); }, 1);
    });
    
    this.finalize.subscribe(function() {
      if(!this.context.response._headersSent) {
        this.context.response.setHeader("Set-Cookie", this.context.cookies.toResponseHeader());
      }
    });
    
  },

  fileNotFound: function() {
    this.context.response.redirect("IMVC.Controllers.Error", "404");
    this._isRedirecting = true;
  },

  forbidden: function() {
    this.context.response.redirect("IMVC.Controllers.Error", "403");
    this._isRedirecting = true;
  },

  internalServerError: function() {
    IMVC.Routing.Router.swapTo("IMVC.Controllers.Error", "500", this.context);
    this._isRedirecting = true;
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

    this.render(viewFile, viewData);
  },

  render: function(viewFile, viewData) {
    var viewRoot = IMVC.Views.View.viewRoot,
        controllerName = this.getType().getClassName(),
        _this = this,
        view;

    if(this._isRedirecting) return;
    
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

    view = new IMVC.Views.ControllerView(viewFile, this.context);
    
    //detaching the view from the controller
    process.nextTick(function() {
      try {
        view.render(_this.viewLocals);
        _this.finalize();
      } catch(e) {
        switch(e.number) {
          case 404:
            view.response.redirect("IMVC.Controllers.Error", "404", _this.viewLocals);
            break;
          case 500:
          default:
            IMVC.Routing.Router.swapTo("IMVC.Controllers.Error", "500", _this.context, {error: e});
            break;
        }
      }
    });
    //console.log("a controller is trying to render.");
  }
}).statics({
  configureActions: ServerEvents.classesReady.subscribe(function() {
    //return;
    var inheritingTypes = IMVC.Controllers.Controller.getInheritingTypes(),
        controllerMethods = IMVC.Controllers.Controller.getMethods(),
        typeActions,
        typeIndex,
        actionIndex,
        currentType,
        originalAction;
    
    //check all types that inherit from Controller
    for(typeIndex in inheritingTypes) {
      currentType = inheritingTypes[typeIndex];
      typeActions = currentType.getMethods();
      
      //check all actions in the current type
      for(actionIndex in typeActions) {
        
        //methods provided by the base controller class can be ignored
        if(controllerMethods[actionIndex]) continue;
        
        originalAction = typeActions[actionIndex];
        
        //need a new function to create the actual closure
        (function() {
          var actionToRun = originalAction,
              currentIndex = actionIndex,
              nestingFunction;
          
          //the current function will be nested inside of this function.
          //any checking that should be done before any action runs should be 
          //done here or in the controllerFiring event.
          nestingFunction = currentType.prototype[actionIndex] = function(otherVals) {
            
            if(this._isActive) {
              if(this.actionName !== _this.getActionName()) {
                this.context.response.redirect(this.getType().getClassName(), nestingFunction.getActionName(), COM.extend(this.context.request.retrieveAll(), otherVals));
                this._isRedirecting = true;
                return;
              }
            }

            //run the controller firing event
            this.controllerFiring(nestingFunction);

            //set that the controller is active
            if(!this._isActive) {
              this._isActive = true;
            
              //run the inner function
              actionToRun.call(this);
            }
          }
          
          //returns the name of the action in question
          nestingFunction.getActionName = function() { return currentIndex; }
          nestingFunction.getAction = function() { return actionToRun; }
//          nestingFunction.getController = function() { return currentType; }
        })();
        
        
      }
    }
  })
  
});



