
require("./View");

var fs = require("fs"),
    utility = require("../Utility");

define("IMVC.Views.FileView").extend("IMVC.Views.View").assign({
  FileView: function(viewFile, context, statusCode) {
    this.View(viewFile, context, statusCode);
  },

  render: function() {
    var _this = this,
        viewFile = unescape(_this.viewFile);
    
    try {
      fs.readFile(viewFile, function(err, fileData) {
        if(!err) {
          _this.context.response.setHeader("Content-Type", utility.determineMimeTypeFromExtension(viewFile));
          _this.display(fileData);
        } else {
          IMVC.Logger.error(err.toString());
          IMVC.Routing.Router.swapTo("IMVC.Controllers.Error", "500", _this.request, _this.response, {error: "View file is not a file."});
        }
      });
    } catch(e) {
      this.response.redirect("IMVC.Conrollers.Error", "404", {error: e});
    }
  },

  finalizeOutput: function() {},

  display: function(fileData) {
    this.context.response.writeHead(this.statusCode);
    this.context.response.end(fileData);
    this.viewComplete = true;
  }
});
