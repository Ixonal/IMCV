
require("./StaticView.js");

define("IMVC.Views.DirectoryView").extend("IMVC.Views.StaticView").assign({
  DirectoryView: function(viewFile, pathTo, request, response) {
    this.StaticView(viewFile, pathTo, request, response);
  }
});
