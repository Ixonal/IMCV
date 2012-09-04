
define("IMVC.Models.Repository").statics({
  get: overload(
    [Type, Function],
    function(modelType, callback) {
      IMVC.Models.Repository.get(modelType, {}, callback);
    },
    
    [Type, Object, Function],
    function(modelType, attributes, callback) {
      if(!modelType.is(IMVC.Models.Model)) throw new Error("The given type must inherit from IMVC.Models.Model");
      if(!attributes || !attributes.is(Object)) attributes = {};
      if(!callback) throw new Error("A callback must be provided")
      
      modelType._mongooseModel.find(attributes, function(err, docs) {
        var index, models, model;
        
        models = [];
        
//        console.log(docs);
//        return;
        
        for(index in docs) {
//          model = new (modelType)();
//          Object.defineProperty(model, "_persister", {
//            value: docs[index],
//            writable: false,
//            enumerable: false,
//            configurable: false
//          });
          //model._persister = docs[index];
          model = IMVC.Models.Repository._initializeModel(modelType, docs[index]);
          IMVC.Models.Repository._hydrateModel(model, modelType);
          models.splice(0, 0, model);
        }
        
        callback(models);
      });
    }
    
  ),
  
  _initializeModel: function(modelType, persister) {
    var model = new (modelType)();
    
    Object.defineProperty(model, "_persister", {
      value: persister,
      writable: false,
      enumerable: false,
      configurable: false
    });
    
    return model;
  },
  
  _hydrateModel: function(model, modelType) {
    if(!model) throw new Error("No model to be hydrated.");
    if(!modelType || !modelType.is(Type) || !modelType.is(IMVC.Models.Model)) throw new Error("Invalid modelType.");
    
    var schema = modelType.schema,
        index;
    
    
    for(index in schema) {
      IMVC.Models.Repository._hydrateProperty(model, index);
    }
    model._modified = false;
  },
  
  _hydrateProperty: function(model, propertyIndex) {
    var schema = model.getType().schema,
        schemaProperty = schema[propertyIndex],
        modelProperty = model[propertyIndex];
    
    if(schemaProperty === null || schemaProperty === undefined) return;
    
    if(schemaProperty.is(IMVC.Models.Model) && schemaProperty.is(Type)) {
      
      modelProperty = model[propertyIndex] = IMVC.Models.Repository._initializeModel(schemaProperty, model._persister[propertyIndex]);
      IMVC.Models.Repository._hydrateModel(modelProperty, schemaProperty);
      
    } else if(schemaProperty.constructor === Array) {
      modelProperty = model[propertyIndex] = [];
      if(schemaProperty.length > 0) {
        IMVC.Models.Repository._hydrateList(modelProperty, model._persister[propertyIndex], schemaProperty[0]);
      }
    } else if(schemaProperty.constructor === Object) {
      if(schemaProperty.type === null || schemaProperty.type === undefined) return;
      
      if(schemaProperty.type.is(IMVC.Models.Model) && schemaProperty.type.is(Type)) {
        modelProperty = model[propertyIndex] = IMVC.Models.Repository._initializeModel(schemaProperty.type, model._persister[propertyIndex]);
        IMVC.Models.Repository._hydrateModel(modelProperty, schemaProperty.type);
      } else {
        modelProperty = model[propertyIndex] = model._persister[propertyIndex];
      }
    } else {
      modelProperty = model[propertyIndex] = model._persister[propertyIndex];
    }
  },
  
  _hydrateList: function(list, persistedList, modelType) {
    if(!list) throw new Error("No model to be hydrated.");
    if(!modelType || !modelType.is(Type) || !modelType.is(IMVC.Models.Model)) throw new Error("Invalid modelType.");
    
    var schema = modelType.schema,
        index;
    
//    console.log("test 1");
    
    for(index = 0; index < persistedList.length; index++) {
//      console.log(index);
      list[index] = new modelType();
      list[index]._persister = persistedList[index];
      IMVC.Models.Repository._hydrateModel(list[index], modelType);
    }
//    console.log(list);
  }
});
