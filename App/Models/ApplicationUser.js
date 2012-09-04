
define("Test").extend("IMVC.Models.Model").assign({
  
  Test: function() {
    this.Model();
    this.test = "test";
  }
}).statics({
  schema: {
    test: String
  }
});


define("Models.ApplicationUser").extend("IMVC.Models.Model").assign({
  
  ApplicationUser: function(username) {
    this.Model();
    this.username = username;
  },
  
  validate: function() {
    return this.base("validate");
  }
}).statics({
  schema: {
    username: String,
    associatedUser: {
      type: Test,
      required: true
    }
  }
});


