
define("SecureHome").extend("IMVC.Controllers.SecureController").assign({
  SecureHome: function(context) {
    this.SecureController(context);
  },
  
  test: function() {
    this.render();
  }
});
