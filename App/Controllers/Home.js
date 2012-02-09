var http = require("http");

define("Home").extend("IMVC.Controllers.Controller").assign({
  Home: function(request, response) {
    this.Controller(request, response);
  },

  Index: function(requestArgs) {
    //console.log("about to render index.html");
    this.viewLocals.message = "Welcome to my brand new site!";

    this.render();

    //console.log("index.html is rendering");
  },

  About: function(requestArgs) {
    this.viewLocals.message = "This website was created with IMVC!";

    this.render();
  },

  otherAction: function(requestArgs) {

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
