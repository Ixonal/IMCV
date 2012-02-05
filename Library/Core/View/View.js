
var fs = require("fs"),
    ejs = require("./ejs");

define("IMVC.Views.View").assign({
  viewFile: null,
  request: null,
  response: null,
  viewComplete: true,

  includes: null,

  fileLoaded: null,
  fileIncluded: null,
  
  View: function(viewFile, request, response) {
    
    this.viewFile = viewFile;
    this.request = request;
    this.response = response;

    this.includes = {};

    this.fileLoaded = event();
    this.fileLoaded.subscribe("onFileLoaded", this.onFileLoaded)

    this.fileIncluded = event();
    this.fileIncluded.subscribe("onFileIncluded", this.onFileIncluded);
    
    this.viewFile = unescape(this.viewFile);
  },

  render: function(viewData) {
    var _this = this;

    viewData = viewData || {};

    viewData.include = function(file) {
      file = IMVC.Views.View.viewRoot + file;

      if(!_this.includes[file]) {
        _this.loadFile(file, function(fileData) {
          _this.includes[file] = fileData;
          _this.fileLoaded(file);
        });
      }

      _this.fileIncluded(file);

      return "{" + file + "}";
    }

    viewData.inherit = function(file) {
      
    }

    this.loadFile(this.viewFile, function(fileData) {
      try {
        var ejsFunc = ejs.compile(fileData);
        _this.display(ejsFunc(viewData));
      } catch(e) {
        IMVC.Routing.Router.swapTo("IMVC.Controllers.Error", "500", _this.request, _this.response, {error: e});
      }
    });
  },

  loadFile: function(file, callback) {
    var _this = this;

    fs.stat(file, function(err, stats) {
      if(!err) {
        if(stats.isFile()) {
          fs.readFile(_this.viewFile, function(err, data) {
            if(!err) {
              _this.fileLoaded(file);
              callback(data.toString());
            } else {
              //couldn't read the file for some reason
              IMVC.Logger.error("Failed to read a file: " + _this.viewFile);
              //throw new Error(500, "Failed to read a file: " + _this.viewFile);/
              IMVC.Routing.Router.swapTo("IMVC.Controllers.Error", "500", _this.request, _this.response, {error: err});
              //_this.response.end();
            }
          });
        } else {
          //can't view it if it's not a file, do something error-like
          IMVC.Logger.error("Tried to view something that isn't a file: " + _this.viewFile);
          IMVC.Routing.Router.swapTo("IMVC.Controller.Error", "500", _this.request, _this.response, {error: "View file is not a file."});
          //throw new Error(500, "Tried to view something that isn't a file: " + _this.viewFile);
          //_this.response.end();
        }
      } else {
        //the file isn't there, do something error-like
        IMVC.Logger.error("It doesn't appear the file " + file + " exists.");
        //throw new Error(404, "It doesn't appear the file " + _this.viewFile + " exists.");
        _this.response.redirect("IMVC.Controllers.Error", "404", {error: err})
        //_this.response.end();
      }
    });
  },

  onFileIncluded: function() {
    console.log(this);
  },

  onFileLoaded: function(filename) {
    
  },

  display: function(outputString) {
    //while

    if(this.viewComplete) {
      this.response.end(outputString);
    }
  }
}).statics({
  viewRoot: constants.AppRoot + "/App/Views"
});
