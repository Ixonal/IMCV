
require("./View");

var fs = require("fs");

define("IMVC.Views.FileView").extend("IMVC.Views.View").assign({
  FileView: function(viewFile, context) {
    this.View(viewFile, context);
  },

  render: function() {
    var _this = this;

    try {
    fs.readFile(unescape(this.viewFile), function(err, fileData) {
      if(!err) {
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
    this.context.response.end(fileData);
    this.viewComplete = true;
  }
});
