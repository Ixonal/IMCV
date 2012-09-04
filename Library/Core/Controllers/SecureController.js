
require("./Controller");
require("./Bouncer");

define("IMVC.Controllers.SecureController").extend("IMVC.Controllers.Controller").assign({
  
  SecureController: function(context) {
    this.Controller(context);
    
    var _this = this;

    this.controllerFiring.subscribe(function(action) {
      if(action === _this.login || action === _this.logout || action === _this.authenticate || action === _this.authenticateAsync) return;
      
      var bouncer = new IMVC.Controllers.SecureController._registeredBouncer(this.context);
      
      if(!bouncer.isUserLoggedIn()) {
        _this._isActive = true;
        bouncer.authenticate(bouncer.getCurrentUsername(), bouncer.getCurrentPassword(), function(result) {
          if(result) {
            bouncer._setUserLoggedIn(true);
            bouncer.success();
            action.getAction().call(_this);
          } else {
            bouncer._setUserLoggedIn(false);
            bouncer.failure();
            context.session.set(context.getClientId() + "LoginRedirect", context.request.getUrl());
            _this._isRedirecting = true;
            _this.context.response.redirect(IMVC.Controllers.SecureController, "login", true);
          }
        });
//        if(!bouncer.authenticate(bouncer.getCurrentUsername(), bouncer.getCurrentPassword())) {
//          bouncer.userIsLoggedIn(false);
//          bouncer.failure();
//          context.session.set(context.getClientId() + "LoginRedirect", context.request.getUrl());
//          this._isRedirecting = true;
//          this.context.response.redirect(IMVC.Controllers.SecureController, "login", true);
//        } else {
//          bouncer.userIsLoggedIn(true);
//          bouncer.success();
//        }
      }
    });
  },
  
  login: function() {
    this.viewLocals.error = this.context.request.query("error");
    this.viewLocals.username = this.context.request.retrieve("username") || "";
    this.render("/Secure/login.html");
  },
  
  
  logout: function() {
    var bouncer = new IMVC.Controllers.SecureController._registeredBouncer(this.context);
    bouncer._setUserLoggedIn(false);
    this.context.response.redirect(IMVC.Controllers.SecureController._defaultRoute, { logoutMessage: "You have been logged out" }, false);
  },
  
  
  authenticate: function() {
    var _this = this, 
        bouncer = new IMVC.Controllers.SecureController._registeredBouncer(_this.context),
        redirectTarget;
    
    if(!bouncer.isUserLoggedIn()) {
      bouncer.authenticate(bouncer.getCurrentUsername(), bouncer.getCurrentPassword(), function(result) {
        if(result) {
          bouncer._setUserLoggedIn(true);
          bouncer.success();
          redirectTarget = _this.context.session.get(_this.context.getClientId() + "LoginRedirect");
          _this._isRedirecting = true;
          _this.context.response.redirect(redirectTarget || IMVC.Controllers.SecureController._defaultRoute);
        } else {
          bouncer.failure();
          _this.context.response.redirect(IMVC.Controllers.SecureController, "login", {error: bouncer.getError(),
                                                                                       username: bouncer.getCurrentUsername() || ""}, true);
        }
      });
      
//      if(!bouncer.authenticate(bouncer.getCurrentUsername(), bouncer.getCurrentPassword())) {
//        bouncer.failure();
//        _this.context.response.redirect(IMVC.Controllers.SecureController, "login", {error: bouncer.getError(),
//                                                                                    username: bouncer.getCurrentUsername() || ""}, true);
//      } else {
//        bouncer.userIsLoggedIn(true);
//        bouncer.success();
//        redirectTarget = _this.context.session.get(this.context.getClientId() + "LoginRedirect");
//        _this._isRedirecting = true;
//        _this.context.response.redirect(redirectTarget || IMVC.Controllers.SecureController._defaultRoute);
//      }
    }
  },
  
  authenticateAsync: function() {
    var _this = this, 
        bouncer = new IMVC.Controllers.SecureController._registeredBouncer(_this.context);

    _this.viewLocals.jsonPCallback = _this.context.request.retrieve(IMVC.Controllers.SecureController._jsonPCallback);
    
    if(!bouncer.isUserLoggedIn()) {
      bouncer.authenticate(bouncer.getCurrentUsername(), bouncer.getCurrentPassword(), function(result) {
        if(result) {
          bouncer._setUserLoggedIn(true);
          bouncer.success();
          _this.viewLocals.success = true;
          _this.viewLocals.username = bouncer.getCurrentUsername();
        } else {
          bouncer._setUserLoggedIn(false);
          bouncer.failure();
          _this.viewLocals.success = false;
          _this.viewLocals.loginError = bouncer.getError();
          _this.viewLocals.username = bouncer.getCurrentUsername();
        }
        
        _this.render("/Secure/authenticate.json");
      });
      
//      if(!bouncer.authenticate(bouncer.getCurrentUsername(), bouncer.getCurrentPassword())) {
//        bouncer.failure();
//        _this.viewLocals.success = false;
//        _this.viewLocals.error = bouncer.getError();
//        _this.viewLocals.username = bouncer.getCurrentUsername();
//        _this.render("/Secure/authenticate.json");
//      } else {
//        bouncer.userIsLoggedIn(true);
//        bouncer.success();
//        _this.viewLocals.success = true;
//        _this.viewLocals.username = bouncer.getCurrentUsername();
//        _this.render("/Secure/authenticate.json");
//      }
    }
  }
  
  
}).statics({
  _defaultRoute: "/",
  
  _jsonPCallback: "callback",
  
  _registeredBouncer: IMVC.Controllers.Bouncer,
  
  registerBouncer: overload(
    [Type],
    function(bouncer) {
      if(!bouncer.is(IMVC.Controllers.Bouncer)) {
        throw new Error("The bouncer must be a type inherited from IMVC.Controllers.Bouncer");
      }
      
      IMVC.Controllers.SecureController._registeredBouncer = bouncer;
    }
  ),
  securityRoutes: ["GET  /login      IMVC.Controllers.SecureController.login             secure",
                   "POST /login      IMVC.Controllers.SecureController.authenticate      secure",
                   "GET  /logout     IMVC.Controllers.SecureController.logout            indifferent",
                   "GET  /loginAsync IMVC.Controllers.SecureController.authenticateAsync secure",
                   "POST /loginAsync IMVC.Controllers.SecureController.authenticateAsync secure"],
                   
  registerSecurityRoutes: ServerEvents.routePreLoad.subscribe(function() {
    IMVC.Routing.Router.parseRoutes(IMVC.Controllers.SecureController.securityRoutes);
  })
});
