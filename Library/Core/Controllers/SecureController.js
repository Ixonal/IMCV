
require("./Controller");
require("./Bouncer");

define("IMVC.Controllers.SecureController").extend("IMVC.Controllers.Controller").assign({
  
  SecureController: function(context) {
    this.Controller(context);

    this.controllerFiring.subscribe(function(action) {
      if(action === this.login || action === this.logout || action === this.authenticate || action === this.authenticateAsync) return;
      
      var bouncer = new IMVC.Controllers.SecureController._registeredBouncer(this.context);
      
      if(!bouncer.userIsLoggedIn()) {
        if(!bouncer.authenticate(bouncer.getCurrentUsername(), bouncer.getCurrentPassword())) {
          bouncer.userIsLoggedIn(false);
          bouncer.failure();
          context.session.set(context.getClientId() + "LoginRedirect", context.request.getUrl());
          this._isRedirecting = true;
          this.context.response.redirect(IMVC.Controllers.SecureController, "login", true);
        } else {
          bouncer.userIsLoggedIn(true);
          bouncer.success();
        }
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
    bouncer.userIsLoggedIn(false);
    this.context.response.redirect(IMVC.Controllers.SecureController._defaultRoute, { logoutMessage: "You have been logged out" }, false);
  },
  
  authenticate: function() {
    var bouncer = new IMVC.Controllers.SecureController._registeredBouncer(this.context),
        redirectTarget;
    
    if(!bouncer.userIsLoggedIn()) {
      if(!bouncer.authenticate(bouncer.getCurrentUsername(), bouncer.getCurrentPassword())) {
        bouncer.failure();
        this.context.response.redirect(IMVC.Controllers.SecureController, "login", {error: bouncer.getError(),
                                                                                    username: bouncer.getCurrentUsername() || ""}, true);
      } else {
        bouncer.userIsLoggedIn(true);
        bouncer.success();
        redirectTarget = this.context.session.get(this.context.getClientId() + "LoginRedirect");
        this._isRedirecting = true;
        this.context.response.redirect(redirectTarget || IMVC.Controllers.SecureController._defaultRoute);
      }
    }
  },
  
  authenticateAsync: function() {
    var bouncer = new IMVC.Controllers.SecureController._registeredBouncer(this.context);

    if(!bouncer.userIsLoggedIn()) {
      if(!bouncer.authenticate(bouncer.getCurrentUsername(), bouncer.getCurrentPassword())) {
        bouncer.failure();
        this.viewLocals.success = false;
        this.viewLocals.error = bouncer.getError();
        this.viewLocals.username = bouncer.getCurrentUsername();
        this.render("/Secure/authenticate.json");
      } else {
        bouncer.userIsLoggedIn(true);
        bouncer.success();
        this.viewLocals.success = true;
        this.viewLocals.username = bouncer.getCurrentUsername();
        this.render("/Secure/authenticate.json");
      }
    }
  }
  
  
}).statics({
  _defaultRoute: "/",
  
  _registeredBouncer: IMVC.Controllers.Bouncer,
  
  registerBouncer: overload(
    [Type],
    function(bouncer) {
      if(!bouncer.is(IMVC.Controllers.Bouncer)) {
        throw new Error("The bouncer must be a type inherited from IMVC.Controllers.Bouncer");
      }
      
      IMVC.Controllers.Bouncer._registeredBouncer = bouncer;
    }
  ),
  securityRoutes: ["GET  /login      IMVC.Controllers.SecureController.login secure",
                   "POST /login      IMVC.Controllers.SecureController.authenticate secure",
                   "GET  /logout     IMVC.Controllers.SecureController.logout indifferent",
                   "GET  /loginAsync IMVC.Controllers.SecureController.authenticateAsync secure",
                   "POST /loginAsync IMVC.Controllers.SecureController.authenticateAsync secure"],
                   
  registerSecurityRoutes: ServerEvents.routePreLoad.subscribe(function() {
    IMVC.Routing.Router.parseRoutes(IMVC.Controllers.SecureController.securityRoutes);
  })
});
