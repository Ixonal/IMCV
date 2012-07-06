
var mongoose = require("./mongoose");

define("IMVC.Models.Model", "abstract").assign({
  
  _persister: null,

  Model: function() {
    this._persister = new (this.getType()._mongooseModel)();
  },

  save: function() {
    var schema = this.getType().schema, index;
    
    for(index in schema) {
      this._persister[index] = this[index];
    }
    
    this._persister.save();
  },

  rollback: function() {
    var schema = this.getType().schema, index;
    
    for(index in schema) {
      this[index] = schema[index];
    }
  }
}).statics({
  
  dbConnection: null,
  schema: {},
  _mongooseModel: null,
  ObjectID: null,
  
  _generateModels: ServerEvents.connectedToDatabase.subscribe(function() {
    var models = IMVC.Models.Model.getInheritingTypes(),
        Schema,
        ObjectId,
        index;
        
    Schema = IMVC.Models.Model.dbConnection.base.Schema;
    
    ObjectId = Schema.ObjectId;
        
    IMVC.Models.Model.ObjectID = ObjectId;
    
    for(index in models) {
      if(!models[index].schema || !models[index].schema.is(Object)) throw new Error("No schema present in " + index);
      models[index]._mongooseModel = IMVC.Models.Model.dbConnection.model(models[index].getClassPath(), new Schema(models[index].schema));
    }
  }),
  

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
