
require("./View");

var fs = require("fs"),
    ejs = require("./ejs");

define("IMVC.Views.ControllerView").extend("IMVC.Views.View").assign({
  viewFile: null,
  request: null,
  response: null,
  viewComplete: false,

  parentView: null,

  loadingFiles: null,
  includes: null,

  fileLoaded: null,
  fileIncluded: null,
  viewReady: null,

  outputString: null,

  ControllerView: function(viewFile, context) {
    this.View(viewFile, context);
    
    this.fileLoaded.subscribe("onFileLoaded", this.onFileLoaded);

    this.fileIncluded.subscribe("onFileIncluded", this.onFileIncluded);

    this.viewReady.subscribe("onViewReady", this.onViewReady);

    this.viewFinish.subscribe("__destruction", function() {
    //when finished, send the view to be destroyed
    var _this = this;
      
      setTimeout(function() { destroy(_this); }, 1);
    });

    //this.viewFile = unescape(this.viewFile);
  },

  _View: function() {
    if(this.parentView) {
      destroy(this.parentView);
    }
  },

  render: function(viewData) {
    var _this = this;

    viewData = viewData || {};


    viewData.Helpers = IMVC.Views.Helpers;
    viewData.ReverseRoute = IMVC.Routing.Router.reverseRoute;

    //includes the contents of a file into the current view
    viewData.include = function(file) {
      //console.log("view include called");

      file = IMVC.Views.View.viewRoot + file;

      _this.fileIncluded(file);
      if(typeof(_this.includes[file]) != "string") {
        _this.loadFile(file, function(fileData) {

          _this.includes[file] = (ejs.compile(fileData))(viewData);
          _this.fileLoaded(file);
        });
      }


      return IMVC.Views.View.variableOpen + file + IMVC.Views.View.variableEnd;
    };


    //causes this view to be added to a specified other file
    viewData.inherits = function(file) {
      var viewDataCopy;
      if(!_this.parentView) {
        viewDataCopy = COM.SCM.SubClassTree.extend({}, viewData);
        file = IMVC.Views.View.viewRoot + file;
        _this.parentView = new IMVC.Views.ParentView(file, _this.context, _this);
        _this.parentView.render(viewDataCopy);
      }

      return "";
    };



    this.fileIncluded(this.viewFile);
    this.loadFile(this.viewFile, function(fileData) {
      try {
        var ejsFunc = ejs.compile(fileData);
        _this.outputString = ejsFunc(viewData);
        _this.fileLoaded(_this.viewFile);
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
          fs.readFile(file, function(err, data) {
            if(!err) {
              callback(data.toString());
            } else {
              //couldn't read the file for some reason
              IMVC.Logger.error("Failed to read a file: " + _this.viewFile);
              IMVC.Routing.Router.swapTo("IMVC.Controllers.Error", "500", _this.request, _this.response, {error: err});
            }
          });
        } else {
          //can't view it if it's not a file, do something error-like
          IMVC.Logger.error("Tried to view something that isn't a file: " + _this.viewFile);
          IMVC.Routing.Router.swapTo("IMVC.Controller.Error", "500", _this.request, _this.response, {error: "View file is not a file."});
        }
      } else {
        //the file isn't there, do something error-like
        IMVC.Logger.error("It doesn't appear the file " + file + " exists.");
        _this.response.redirect("IMVC.Controllers.Error", "404", {error: err});
      }
    });
  },

  onFileIncluded: function(filename) {
    this.loadingFiles[filename] = true;
  },

  onFileLoaded: function(filename) {
    var context = this;
    delete this.loadingFiles[filename];

    if(!this.viewComplete) {
      //determine if we're ready to render...
      if(this.ready()) {
        do {
          if(!context.ready()) return;
        } while((context = context.parentView));
        //well, everything should be ready...
        this.onViewReady();
        context = this;
      }
    }

  },

  onViewReady: function() {
    if(this.parentView) {
      this.parentView.viewReady();
    }
    this.finalizeOutput();
    this.display(this.getHighestParentView().outputString);
  },

  getHighestParentView: function() {
    var context = this;

    while(context.parentView) {
      context = context.parentView;
    }

    return context;
  },

  getLowestChildView: function() {
    var context = this;

    while(context.childView) {
      context = context.childView;
    }

    return context;
  },

  ready: function() {
    return Object.keys(this.loadingFiles).length == 0;
  },

  finalizeOutput: function() {
    var variableReg = IMVC.Views.View.variableReg,
        variableName;

    while(variableReg.test(this.outputString)) {
      variableName = (variableReg.exec(this.outputString))[1];
      this.outputString = this.outputString.replace(variableReg, this.includes[variableName]);
    }

    if(this.parentView) {
      this.parentView.finalizeOutput();
    }

    return this.outputString;
  },

  display: function(outputString) {
    if(this.viewComplete) return;

    this.context.response.end(outputString);
    this.viewComplete = true;
    this.viewFinish();
  }
}).statics({
  viewRoot: constants.AppRoot + "/App/Views"
});
