
require("./Controller");
require("../Routing/Router");


define("IMVC.Controllers.Error").extend("IMVC.Controllers.Controller").assign({
  Error: function(context) {
    this.Controller(context);
  },

  404: function() {
//    if(requestArgs && requestArgs.error) {
//      IMVC.Logger.error(requestArgs.error.stack);
//    }
    IMVC.Logger.error(this.context.request.retrieve("error"));
    
    this.render("/Error/404.html", 404);
  },

  403: function() {
//    if(requestArgs && requestArgs.error) {
//      IMVC.Logger.error(requestArgs.error.stack);
//    }
    
    IMVC.Logger.error(this.context.request.retrieve("error"));
    
    this.render("/Error/403.html", 403);
  },
  
  413: function() {
//    if(requestArgs && requestArgs.error) {
//      IMVC.Logger.error(requestArgs.error.stack);
//    }
    IMVC.Logger.error(this.context.request.retrieve("error"));
    
    this.render("/Error/413.html", 413);
  },

  500: function() {
//    if(requestArgs && requestArgs.error) {
//      IMVC.Logger.error(requestArgs.error.stack);
//    }
    //COM.extend(this.viewLocals, this.context.request.requestArgs);
    
    IMVC.Logger.error(this.context.request.retrieve("error").stack);
    
    this.viewLocals.error = this.context.request.retrieve("error").stack;
    
    this.render("500.html", 500);
  }
}).statics({

  //routes for errors are hard coded as /error/{errNumber}
  errorRoute: ["GET /error/{errNumber} IMVC.Controllers.Error.{errNumber}"],

  registerErrorRoute: ServerEvents.routePreLoad.subscribe(function() {
    IMVC.Routing.Router.parseRoutes(IMVC.Controllers.Error.errorRoute);
  })
});
