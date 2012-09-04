
var mongoose = require("./mongoose");

require("../Utility/Validatable");

define("IMVC.Models.Model", "abstract").extend("IMVC.Utility.Validatable").assign({
  
  Model: function() {
    this.Validatable();
    
    Object.defineProperty(this, "_persister", {
      value: new (this.getType()._mongooseModel)(),
      writable: true,
      enumerable: false,
      configurable: false
    });
    
    Object.defineProperty(this, "_modified", {
      value: true,
      writable: true,
      enumerable: false,
      configurable: false
    });
    
    var schema = this.getType().schema, index;
    for(index in schema) {
      if(Object.is(schema[index], Array)) {
        this._persister[index] = [];
        this[index] = [];
      }
    }
    
  },
  
  //recursively validate the model
  //todo: mayhaps add a flag for properties to determine if stuff like this should cascade
  validate: function() {
    var index, 
        schema = this.getType().schema;
    
    console.log("Model validation");
    
    this._errors = this._errors.splice(0, this._errors.length);
        
    for(index in schema) {
      var messagePreface = this.getType().getClassPath() + ": " + index;
      if(Object.is(schema[index], IMVC.Models.Model)) {
        this[index].validate();
        var childErrors = this[index].getValidationErrors(); 
        for(var index2 = 0; index2 < childErrors; index2++) {
          this._errors.splice(this._errors.length, 0, childerrors[index2]);
        }
      } else if(schema[index] && schema[index].constructor === Object) {
        //primary validation
        
        
        if(schema[index].required && (this[index] === undefined || this[index] === null)) {
          this._addValidationError(messagePreface + " is required.");
          //this._errors.splice(this._errors.length, 0, messagePreface + " is required.");
        } else {
          if(!Object.is(this[index], schema[index].type) && this[index] !== undefined && this[index] !== null) {
            this._addValidationError(messagePreface + " must be of type " + schema[index].type.getClassPath());
            //this._errors.splice(this._errors.length, 0, messagePreface + " must be of type " + schema[index].type.getClassPath());
          }
        }
        
        if(Object.is(schema[index].type, Number)) {
          if(Object.is(schema[index].min, Number) && this[index] < schema[index].min) {
            this._addValidationError(messagePreface + " has a minimum value of " + schema[index].min);
            //this._errors.splice(this._errors.length, 0, messagePreface + " has a minimum value of " + schema[index].min);
          }
          if(Object.is(schema[index].max, Number) && this[index] > schema[index].max) {
            this._addValidationError(messagePreface + " has a minimum value of " + schema[index].max);
            //this._errors.splice(this._errors.length, 0, messagePreface + " has a minimum value of " + schema[index].max);
          }
        }
        
        if(Object.is(schema[index].type, String)) {
          if(Object.is(schema[index].minLength, Number) && this[index].length < schema[index].minLength) {
            this._addValidationError(messagePreface + " has a minimum length of " + schema[index].minLength);
            //this._errors.splice(this._errors.length, 0, messagePreface + " has a minimum length of " + schema[index].minLength);
          }
          if(Object.is(schema[index].maxLength, Number) && this[index].length > schema[index].maxLength) {
            this._addValidationError(messagePreface + " has a minimum length of " + schema[index].maxLength);
            //this._errors.splice(this._errors.length, 0, messagePreface + " has a minimum length of " + schema[index].maxLength);
          }
          if(schema[index].regExp) {
            if(Object.is(schema[index].regExp, String)) {
              schema[index].regExp = new RegExp(schema[index].regExp);
            }
            
            if(!schama[index].regExp.test(this[index])) {
              this._addValidationError(messagePreface + " must match the regular expression " + schema[index].regExp);
              //this._errors.splice(this._errors.length, 0, messagePreface + " must match the regular expression " + schema[index].regExp);
            }
          }
        }
        
        if(Object.is(schema[index].type, Date)) {
          if(Object.is(schema[index].min, Date) && this[index] < schema[index].min) {
            this._addValidationError(messagePreface + " has a minimum value of " + schema[index].min);
            //this._errors.splice(this._errors.length, 0, messagePreface + " has a minimum value of " + schema[index].min);
          }
          if(Object.is(schema[index].max, Date) && this[index] > schema[index].max) {
            this._addValidationError(messagePreface + " has a minimum value of " + schema[index].max);
            //this._errors.splice(this._errors.length, 0, messagePreface + " has a minimum value of " + schema[index].max);
          }
        }
        
      }
    }
    
    return this._errors.length === 0;
  },
  
//  _addValidationError: function(errMsg) {
//    this._errors.splice(this._errors.length, 0, errMsg);
//  },
  
//  getValidationErrors: function() {
//    return this._errors;
//  },

  //recursively save the model
  save: function() {
    var schema = this.getType().schema, index;
    
    if(!this.validate()) return false;
    
//    console.log("saving " + this.getType().getClassPath());
    
    for(index in schema) {
      if(this._persister[index] !== this[index]) {
        this._modified = true;        
      }
      
      if(Object.is(this[index], IMVC.Models.Model)) {
        this[index].save();
        this._persister[index] = this[index]._persister
        
      } else if(Object.is(this[index], Array)) {
        if(!this._persister[index]) this._persister[index] = [];
        if(this[index].length !== this._persister[index].length) this._modified = true;
        //yay arrays
        for(var index2 = this[index].length - 1; index2 >= 0; index2--) {
          if(this[index][index2] !== this._persister[index][index2]);
          if(Object.is(this[index][index2], IMVC.Models.Model)) {
            this[index][index2].save();
            this._persister[index].push(this[index][index2]._persister);
            
          } else {
            this._persister[index][index2] = this[index][index2];
            
          }
          this._persister.modifiedPaths.push(index2);
        }
        for(index2 in this._persister) {
          if(this._persister[index2] && this._persister[index2].constructor === Array) console.log(index2 + ": " + this._persister[index2]);
        }
      } else this._persister[index] = this[index];
    }
    
    
    if(this._modified) this._persister.save();
    
    this._modified = false;
    return true;
  },

  rollback: function() {
//    var schema = this.getType().schema, index;
    
    IMVC.Models.Repository._hydrateModel(this, this.getType());
    
//    
//    for(index in schema) {
//      if(Object.is(schema[index], IMVC.Models.Model)) {
//        
//        this[index].rollback();
//      } else if(Object.is(schema[index], Array)) {
//        this[index] = [];
//        for(var index2 = 0; index2 < this._persister[index].length; index2++) {
//          if(Object.is(schema[index][0], IMVC.Models.Model)) {
//            this[index][index2] = new (schema[index][0])();
//            this[index][index2]._persister = 
//          } else if(schema[index][0] && schema[index][0].constructor === Object) {
//            
//          } else {
//            this[index][index2] = this._persister[index][index2];
//          }
//          //todo: implement me
//        }
//      } else this[index] = this._persister[index]; 
//    }
//    
//    this._modified = false;
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
      (function() {
        var model = models[index],
            schema;
        //console.log(model.getClassPath());
        if(!model.schema || model.schema.getType() !== Object) throw new Error("No schema present in " + index);
        
        schema = IMVC.Models.Model._checkSchemaPart(model.schema);

        model._mongooseModel = IMVC.Models.Model.dbConnection.model(model.getClassPath(), new Schema(schema));
      })();
    }
  }),
  
  _checkSchemaPart: function(schemaPart) {
    var schema = {}, index;
    
    for(index in schemaPart) {
      if(schemaPart[index] && schemaPart[index].constructor === Array) {
        schema[index] = [IMVC.Models.Model._checkSchemaPart(schemaPart[index])];
        
      } else if(schemaPart[index] && schemaPart[index].constructor === Object) {
        schema[index] = COM.extend({}, schemaPart[index]);
        
        if(Object.is(schemaPart[index].type, IMVC.Models.Model)) {
          schema[index].type = (schemaPart[index].type.schema);
        } else {
          schema[index].type = schemaPart[index].type;
        }
      } else {
        
        if(schemaPart[index] && schemaPart[index].is(IMVC.Models.Model)) {
          IMVC.Models.Model._checkSchemaPart(schemaPart[index].schema);
          schema[index] = schemaPart[index].schema;
        } else {
          schema[index] = schemaPart[index];
        }
      }
    }
    
    return schema;
  },
  
//  _fixModelReferences: function(schemaPart, index) {
//    var tmp = {};
//    if(schemaPart[index] && schemaPart[index].is(IMVC.Models.Model)) {
//      tmp[index] = schemaPart[index].schema;
//    }
//    return tmp;
//  },
  
//  _createInterface: ServerEvents.classesReady.subscribe(function() {
//    var models = IMVC.Models.Model.getInheritingTypes(),
//        modelIndex;
//    
//    for(modelIndex in models) {
//      (function() {
//        var model = models[modelIndex],
//            modelSchema = model.schema,
//            schemaIndex;
//        
//        for(schemaIndex in modelSchema) {
//          (function() {
//            Object.defineProperty(model.prototype, schemaIndex, {
//              get: function() {
//                console.log(this.getType().getClassPath());
//                return this._persister ? this._persister[schemaIndex] : null;
//              },
//              set: function(val) {
//                if(!this._persister) return null;
//                this._modified = true;
//                this._persister[schemaIndex] = val;
//              },
//              enumerable: true,
//              configurable: false,
//            });
////            model.prototype.__defineSetter__(schemaIndex, function(val) {
////              if(!this._persister) return null;
////              this._modified = true;
////              this._persister[schemaIndex] = val;
////            });
////            model.prototype.__defineGetter__(schemaIndex, function() {
////              return this._persister ? this._persister[schemaIndex] : null;
////            });
//          })();
//        }
//      })();
//    }
//  }),
  

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
