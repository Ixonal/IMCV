
var fs = require("fs"),
    ejs = require("./ejs");

define("Views.View").assign({
  viewFile: null,
  request: null,
  response: null,
  viewData: null,
  
  View: function(viewFile, request, response, viewData) {
    

    this.viewFile = viewFile;
    this.request = request;
    this.response = response;
    this.viewData = viewData;



    this.viewFile = unescape(this.viewFile);
  },

  render: function() {
    var _this = this;
    //console.log("rendering a view: " + this.viewFile);

    //console.log(ejs);

    this.loadViewFile(function(fileData) {
      //console.log("Here is the file data: " + fileData);
      _this.display(ejs.render(fileData));
    });
  },

  loadViewFile: function(callback) {
    var _this = this;

    fs.stat(this.viewFile, function(err, stats) {
      if(!err) {
        if(stats.isFile()) {
          fs.readFile(_this.viewFile, function(err, data) {
            if(!err) {
              callback(data.toString());
            } else {
              //couldn't read the file for some reason
              Logger.error("Failed to read a file: " + _this.viewFile);
              _this.response.end();
            }
          });
        } else {
          //can't view it if it's not a file, do something error-like
          Logger.error("Tried to view something that isn't a file: " + _this.viewFile);
          _this.response.end();
        }
      } else {
        //the file isn't there, do something error-like
        Logger.error("It doesn't appear the file " + _this.viewFile + " exists.");
        _this.response.end();
      }
    });
  },

  display: function(outputString) {
    //console.log("displaying a view");
    this.response.end(outputString);
  }
});
