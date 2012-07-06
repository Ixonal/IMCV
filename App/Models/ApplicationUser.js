
define("Models.ApplicationUser").extend("IMVC.Models.Model").assign({
  username: null,
  
  ApplicationUser: function(username) {
    this.Model();
    this.username = username;
  }
}).statics({
  schema: {
    username: String
  }
});