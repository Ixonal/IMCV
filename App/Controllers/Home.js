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
    this.response.redirect("IMVC.Controllers.Error", "9001");

    //IMVC.Routing.Router.swapTo("IMVC.Controllers.ErrorController", "500", this.request, this.response, requestArgs);
    //this.internalServerError(requestArgs);

    //this.response.end("well blah");

  }
});
