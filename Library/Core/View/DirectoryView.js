
require("./View");

var fs = require("fs"),
    ejs = require("./ejs");

define("IMVC.Views.DirectoryView").extend("IMVC.Views.ControllerView").assign({
  folder: null,

  DirectoryView: function(viewFile, context, statusCode) {
    this.ControllerView(IMVC.Views.DirectoryView.DIRECTORY_VIEW_FILE, context, statusCode);

    this.folder = viewFile;
  },

  render: function(viewData) {
    var _this = this;


    viewData = viewData || {};

    fs.readdir(this.folder, function(err, files) {
      if(!err) {

        viewData.files = files;
        _this.loadFile(_this.viewFile, function(fileData) {
          _this.display((ejs.compile(fileData))(viewData));
        });

      } else {
        IMVC.Logger.error(err.toString());
        IMVC.Routing.Router.swapTo("IMVC.Controllers.Error", "500", _this.request, _this.response, {error: "View file is not a file."});
      }

    });
  },

  finalizeOutput: function() {},

  display: function(outputString) {
    this.context.response.writeHead(this.statusCode);
    this.context.response.end(outputString);
    this.viewComplete = true;
  }
}).statics({
  DIRECTORY_VIEW_FILE: constants.AppRoot + "/Library/Core/View/Directory.html"
});
