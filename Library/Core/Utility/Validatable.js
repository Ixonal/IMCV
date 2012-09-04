
define("IMVC.Utility.Validatable", "abstract").assign({
  Validatable: function() {
    Object.defineProperty(this, "_errors", {
      value: [],
      writable: true,
      enumerable: false,
      configurable: false
    });
    
  },
  
  validate: abstractFunction(),
  
  _addValidationError: function(msg) {
    this._errors.splice(this._errors.length, 0, msg);
  },
  
  getValidationErrors: function() {
    return COM.extend([], this._errors);
  }
});
