var http = require("http");

define("Home").extend("IMVC.Controllers.Controller").assign({
  Home: function(request, response) {
    this.Controller(request, response);
  },

  Index: function(requestArgs) {
    //console.log("about to render index.html");

    this.render();

    //console.log("index.html is rendering");
  },

  otherAction: function(requestArgs) {

    this.viewLocals.pie = "this is pie";
    this.render();
    //this.response.redirect("IMVC.Controllers.Error", "9001");

    //IMVC.Routing.Router.swapTo("IMVC.Controllers.ErrorController", "500", this.request, this.response, requestArgs);
    //this.internalServerError(requestArgs);

    //IMVC.Logger.log(IMVC.Routing.Router.constructQueryString({name: "Bob Dole", "favorite food": "banana$"}));

    //this.response.end("well blah");

  }
});
