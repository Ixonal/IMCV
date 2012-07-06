
var fs = require("fs"),
    ejs = require("./ejs"),
    utility = require("../Utility");

define("IMVC.Views.View", "abstract").assign({
  viewFile: null,
  context: null,
  viewComplete: false,

  parentView: null,

  loadingFiles: null,
  includes: null,

  fileLoaded: null,
  fileIncluded: null,
  viewReady: null,

  outputString: null,
  
  mimeType: null,
  statusCode: null,

  View: function(viewFile, context, statusCode) {
    if(!viewFile.is(String)) throw new Error("viewFile must be a valid String.");
    if(!context.is(IMVC.Http.HttpContext)) throw new Error("context must be a valid IMVC.Http.HttpContext.");
    
    this.viewFile = viewFile;
    this.context = context;

    this.loadingFiles = {};
    this.includes = {};

    this.fileLoaded = event(this);

    this.fileIncluded = event(this);

    this.viewReady = event(this);

    this.viewFinish = event(this);

    this.viewFile = unescape(this.viewFile);
    
    this.mimeType = utility.determineMimeTypeFromExtension(this.viewFile);
    this.statusCode = statusCode || 200;
  },

  render: abstractFunction(Object),

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

  finalizeOutput: abstractFunction(),

  display: abstractFunction(String)
}).statics({
  viewRoot: constants.AppRoot + "/App/Views",
  
  variableOpen: "*|",
  variableEnd: "|*",
  variableReg: /\*\|([^\|]+)\|\*/m
});
