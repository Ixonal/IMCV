
define("IMVC.Models.Repository").statics({
  get: overload(
    [Type, Function],
    function(modelType, callback) {
      if(!modelType.is(IMVC.Models.Model)) throw new Error("The given type must inherit from IMVC.Models.Model");
      if(!callback) throw new Error("A callback must be provided")
      
      //console.log(modelType.getClassPath());
      
      modelType._mongooseModel.find({}, function(err, docs) {
        console.log(test);
      });
    }
  )
});
