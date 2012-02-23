
var mongoose = require("./mongoose");

define("IMVC.Models.Model").assign({
  persister: null,
  _schema: null,
  _schemaObj: null,

  Model: function() {
    this.schemaObj = new Schema(this.getClassName(), this._schema);
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
      return IMVC.Models.Model.dbConnection;
    },

    [String, String, String, Object],
    function(host, database, port, options) {
      if(!IMVC.Models.Model.dbConnection) {
        IMVC.Models.Model.dbConnection = mongoose.createConnection(host, database, port, options);
      }
      return IMVC.Models.Model.dbConnection;
    }
  )
});
