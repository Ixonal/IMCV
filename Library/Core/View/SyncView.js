
var fs = require("fs"),
    ejs = require("./ejs");

define("IMVC.Views.SyncView").extend("IMVC.Views.View").assign({

  SyncView: function(viewFile, request, response) {
    this.View(viewFile, request, response);
  },

  render: function(viewData) {
    viewData = viewData || {};

    viewData.include = function(file) {}

    viewData.inherit = function(file) {}

    
  },

  loadFile: function(file) {
    var stats;

    try {
      stats = fs.statSync(file);
      if(stats.isFile()) {
        return fs.readFileSync(file);
      } else {

      }
    } catch(e) {

    }
  },

  display: function(outputString) {

  }
});
