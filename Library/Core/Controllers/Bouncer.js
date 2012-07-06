
var crypto = require("crypto");

define("IMVC.Controllers.Bouncer").assign({
  context: null,
  _error: null,
  
  Bouncer: function(context) {
    this.context = context;
    this._error = "";
  },
  
  userIsLoggedIn: function(loggedStatus) {
    if(config.http.security.tokenLocation === "server") {
      return this._userLoggedInSession(loggedStatus);
    } else if(config.http.security.tokenLocation === "client") {
      return this._userLoggedInCookie(loggedStatus);
    } else {
      IMVC.Logging.Logger.warning("Invalid security token location: " + config.http.security.tokenLocation);
      return this._userLoggedInSession(loggedStatus);
    }
  },
  
  _userLoggedInSession: function(loggedStatus) {
    var securityKeyName = this.context.getClientId() + IMVC.Controllers.Bouncer.securityKeyName,
        isLoggedIn = this.context.session.get(securityKeyName);
    
    if(isLoggedIn === undefined || isLoggedIn === null) {
      this.context.session.set(securityKeyName, false);
      isLoggedIn = false
    }
    
    if(typeof(loggedStatus) === "boolean") {
      this.context.session.set(securityKeyName, loggedStatus);
      isLoggedIn = loggedStatus;
    }
    
    return isLoggedIn;
  },
  
  _userLoggedInCookie: function(loggedStatus) {
    var securityKeyName = this.context.getClientId() + IMVC.Controllers.Bouncer.securityKeyName,
        isLoggedIn = this.context.cookies.get(securityKeyName);
    
    if(isLoggedIn === undefined || isLoggedIn === null) {
      this.context.cookies.add(new IMVC.Http.EncryptedCookie(securityKeyName, "false"))
      isLoggedIn = false;
    } else {
      isLoggedIn = (isLoggedIn === "true");
    }
    
    if(typeof(loggedStatus) === "boolean") {
      this.context.cookies.set(securityKeyName, loggedStatus ? "true" : "false");
      isLoggedIn = loggedStatus;
    }
    
    return isLoggedIn
  },
  
  
  getCurrentUsername: function() {
    return this.context.request.retrieve("username");
  },
  
  getCurrentPassword: function() {
    return this.context.request.retrieve("password");
  },
  
  authenticate: function(username, password) {
    if(!username) {
      this._error = "Username not defined";
      return false;
    }
    
    if(!password) {
      this._error = "Password not defined";
      return false;
    }
    
    return true;
  },
  
  success: function() {

  },
  
  failure: function() {

  },
  
  getError: function() {
    return this._error;
  }
}).statics({
  securityKeyName: "UILI"
});
