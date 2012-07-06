var http = require("http");

define("Home").extend("IMVC.Controllers.Controller").assign({
  Home: function(context) {
    this.Controller(context);
    
  },

  Index: function() {
    //console.log("about to render index.html");
    this.viewLocals.message = "Welcome to my brand new site!";

    //console.log(IMVC.Controllers.Controller.getInheritingTypes());
//    
//    console.log(this.is(IMVC.Controllers.Controller));
//    console.log(this.is(Boolean));
//    console.log(this.is(Object));
//    
    
    
    //console.log(arguments.callee.caller);

    this.render();

    //console.log("index.html is rendering");
  },

  About: function() {
    this.viewLocals.message = "This website was created with IMVC!";
    
    //this.Index({boobs: "yes, please!"});
    //this.internalServerError();

    this.render();
  },

  otherAction: function() {
    this.viewLocals.blah = this.context.request.retrieve("something");
    this.viewLocals.something = "this is something";
    this.viewLocals.pie = "this is pie";
    this.render();
    //this.response.redirect("IMVC.Controllers.Error", "9001");

    //IMVC.Routing.Router.swapTo("IMVC.Controllers.ErrorController", "500", this.request, this.response, requestArgs);
    //this.internalServerError(requestArgs);

    //IMVC.Logger.log(IMVC.Routing.Router.constructQueryString({name: "Bob Dole", "favorite food": "banana$"}));

    //this.response.end("well blah");

  }
});
