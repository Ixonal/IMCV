
define("Controller").assign({
  request: null,
  response: null,
  viewData: null,

  Controller: function(request, response) {
    Controller.allControllers[this.getClassName()] = this;

    this.request = request;
    this.response = response;
    this.viewData = {};
  },

  render: function(viewFile) {
    var view = new Views.View(viewFile, this.request, this.response, this.viewData);

    console.log("a controller is about to render");
    setTimeout(function() { view.render(); }, 1);
    console.log("a controller is trying to render.");
  }
}).statics({
  allControllers: {},

  getAllControllers: function() {
    return COM.SCM.SubClassTree.extend({}, Controller.allControllers);
  },

  getController: function(name) {
    return Controller.allControllers[name];
  }
});
