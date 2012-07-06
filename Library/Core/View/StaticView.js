
require("./View");

var fs = require("fs");

//returns the contents of a file 
//with no changes made
define("IMVC.Views.StaticView").extend("IMVC.Views.View").assign({
  pathTo: null,
  filename: null,

  StaticView: function(viewFile, context, statusCode) {
    this.View(viewFile, context, statusCode);

    if(viewFile.charAt(viewFile.length - 1) == "/") {
      viewFile = viewFile.substr(0, viewFile.length - 1);
      this.viewFile = viewFile;
    }



    this.pathTo = viewFile.substring(0, viewFile.lastIndexOf("/"));
    this.filename = viewFile.substring(viewFile.lastIndexOf("/") + 1, viewFile.length);
    //this.pathTo = pathTo;
    console.log(this.pathTo);
    console.log(this.filename);
  },

  render: function() {
    var _this = this;
    //Logger.log("A static view has been initiated on " + this.viewFile);

    

    fs.stat(this.viewFile, function(err, stats) {

      if(err == null) {
        if(stats.isDirectory()) {
          _this.renderDirectory();
        } else {
          //output the file
          _this.renderFile();
        }
      } else {
        //put a 404 thing here
        IMVC.Logger.error("File not found :( " + err);
        _this.context.response.end();
      }
    });

  },

  renderFile: function() {
    var _this = this;

    fs.readFile(this.viewFile, function(err, data){
      if(!err) {
        _this.context.response.write(data);
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
            anchor = new Anchor(escape(_this.pathTo + "/" + files[index]), files[index], files[index]);
            _this.context.response.write(anchor.toString() + "<br/>\n");
          }
        }
      } else {
        //put an error here...
        IMVC.Logger.error(err.toString());
      }

      _this.response.end();
    });
  }
});
