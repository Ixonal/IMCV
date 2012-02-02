
require("./View.js");

var fs = require("fs");

//returns the contents of a file 
//with no changes made
define("IMVC.Views.StaticView").extend("IMVC.Views.View").assign({
  pathTo: null,

  StaticView: function(viewFile, pathTo, request, response) {
    this.View(viewFile, request, response, null);

    this.pathTo = pathTo;
  },

  render: function() {
    var _this = this;
    //Logger.log("A static view has been initiated on " + this.viewFile);

    

    fs.stat(this.viewFile, function(err, stats) {

      if(err == null) {
        if(stats.isDirectory()) {
          //print out the directory structure
          //Logger.log("got a directory, output structure");
          _this.renderDirectory();
        } else {
          //output the file
          //Logger.log("got a file, output the file to the response");
          _this.renderFile();
        }
      } else {
        //put a 404 thing here
        IMVC.Logger.error("File not found :( " + err);
        _this.response.end();
      }
    });

  },

  renderFile: function() {
    var _this = this;

    fs.readFile(this.viewFile, function(err, data){
      if(!err) {
        _this.response.write(data);
      } else {
        //put an error here.
        IMVC.Logger.error("The file could not be read: " + err.toString());
      }

      _this.response.end();
    });
  },

  renderDirectory: function() {
    var _this = this;

    fs.readdir(this.viewFile, function(err, files) {
      var index,
          anchor;

      if(!err) {
        with(namespace("IMVC.Views.Helpers")) {
          //Logger.log("writing files to the response");
          for(index in files) {
            anchor = new Anchor(escape(_this.pathTo + "/" + files[index]), files[index]);
            _this.response.write(anchor.toString() + "<br/>\n");
          }
        }
      } else {
        //put an error here...
        IMVC.Logger.error(err);
      }

      _this.response.end();
    });
  }
});
