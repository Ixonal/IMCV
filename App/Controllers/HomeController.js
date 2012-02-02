var http = require("http");

define("HomeController").extend("IMVC.Controllers.Controller").assign({
  HomeController: function(request, response) {
    this.Controller(request, response);
  },

  Index: function(requestArgs) {
    //console.log("about to render index.html");

    this.render("/Home/Index.html");

    //console.log("index.html is rendering");
  },

  otherAction: function(requestArgs) {
    this.response.redirect("IMVC.Controllers.ErrorController", "9001");

  }
});
