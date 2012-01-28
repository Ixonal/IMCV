
define("HomeController").extend("Control.Controller").assign({
  HomeController: function(request, response) {
    this.Controller(request, response);
  },

  Index: function(requestArgs) {
    //console.log("about to render index.html");

    this.render("/Home/Index.html");

    //console.log("index.html is rendering");
  },

  otherAction: function(requestArgs) {
    //console.log(requestArgs);

    this.fileNotFound();

    this.response.end("blaaahhhh!")
  }
});
