
require("./StaticView.js");

define("Views.DirectoryView").extend("Views.StaticView").assign({
  DirectoryView: function(viewFile, pathTo, request, response) {
    this.StaticView(viewFile, pathTo, request, response);
  }
});
