var ejs = require("./ejs");

define("IMVC.Views.ParentView").extend("IMVC.Views.View").assign({
  childView: null,
  childViewPlaceholder: null,

  ParentView: function(viewFile, request, response, childView) {
    this.View(viewFile, request, response);

    this.childView = childView;

    this.childViewPlaceHolder = "{childview" + this.childView.viewFile + "}";
  },

  render: function(viewData) {
    var _this = this;

    viewData = viewData || {};

    //includes the contents of a file into the current view
    viewData.include = function(file) {
      //console.log("parent view include called");
      file = IMVC.Views.View.viewRoot + file;

      _this.fileIncluded(file);
      if(typeof(_this.includes[file]) != "string") {
        _this.loadFile(file, function(fileData) {

          _this.includes[file] = (ejs.compile(fileData))(viewData);
          _this.fileLoaded(file);
        });
      }


      return "{" + file + "}";
    }


    //causes this view to be added to a specified other file
    viewData.inherits = function(file) {
      var viewDataCopy;
      if(!_this.parentView) {
        viewDataCopy = COM.SCM.SubClassTree.extend({}, viewData)
        file = IMVC.Views.View.viewRoot + file;
        _this.parentView = new IMVC.Views.ParentView(file, _this.request, _this.response, _this);
        _this.parentView.render(viewDataCopy);
      }

      return "";
    }


    //renders the content from a child view into this view
    viewData.renderContent = function() {
      return _this.childViewPlaceholder;
    }



    this.loadFile(this.viewFile, function(fileData) {
      try {
        var ejsFunc = ejs.compile(fileData);
        _this.outputString = ejsFunc(viewData);
        _this.fileLoaded(_this.viewFile);
      } catch(e) {
        IMVC.Routing.Router.swapTo("IMVC.Controllers.Error", "500", _this.request, _this.response, {error: e});
      }
    });
    this.fileIncluded(this.viewFile);
  },

  onFileLoaded: function(filename) {
    var context = this;

    delete this.loadingFiles[filename];

    if(!this.viewComplete) {
      if(this.childView.ready() && this.ready()) {
        while(context.parentView) {
          context = context.parentView;
          if(!context.ready()) return;
        }
        this.getLowestChildView().viewReady();
      }
    }
  },

  onFileIncluded: function(filename) {
    this.loadingFiles[filename] = true;
  },

  ready: function() {
    return (Object.keys(this.loadingFiles).length == 0 && this.childView.ready());
  },

  onViewReady: function() {
    if(this.parentView) {
      this.parentView.viewReady();
    }
  },

  finalizeOutput: function() {
    var variableReg = IMVC.Routing.Router.variableReg,
        variableName;

    if(this.childView) {
      this.outputString = this.outputString.replace(this.childViewPlaceholder, this.childView.outputString);
    }

    while(variableReg.test(this.outputString)) {
      variableName = (variableReg.exec(this.outputString))[1];
      this.outputString = this.outputString.replace(variableReg, this.includes[variableName]);
    }

    if(this.parentView) {
      this.parentView.finalizeOutput();
    }

    return this.outputString;
  }
});
