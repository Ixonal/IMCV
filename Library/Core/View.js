
define("View").assign({
  viewFile: null,
  request: null,
  response: null,
  viewData: null,
  
  View: function(viewFile, request, response, viewData) {
    this.viewFile = viewFile;
    this.request = request;
    this.response = response;
    this.viewData = viewData;
  },

  render: function() {
    var stringToDisplay = "hello from the view!";

    console.log("rendering a view");

    this.display(stringToDisplay);
  },

  display: function(outputString) {
    console.log("displaying a view");
    this.response.end(outputString);
  }
});
