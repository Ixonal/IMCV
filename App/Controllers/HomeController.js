
define("HomeController").extend("Controller").assign({
  HomeController: function(request, response) {
    this.Controller(request, response);
  },

  Index: function(request, response) {
    console.log("about to render index.html");

    this.render("index.html");

    console.log("index.html is rendering");
  }
});
