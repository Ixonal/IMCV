
var mongoose = require("./mongoose");

define("IMVC.Models.Model").assign({
  persister: null,

  Model: function() {

  },

  save: function() {

  },

  rollback: function() {
    
  }
}).statics({
  dbConnection: null,

  connectToDatabase: overload(
    [String],
    function(connectionString) {
      if(!IMVC.Models.Model.dbConnection) {
        IMVC.Models.Model.dbConnection = mongoose.createConnection(connectionString);
      }
    },

    [String, String, String, Object],
    function(host, database, port, options) {
      if(!IMVC.Models.Model.dbConnection) {
        IMVC.Models.Model.dbConnection = mongoose.createConnection(host, database, port, options);
      }
    }
  )
});
