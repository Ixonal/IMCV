
define("IMVC.Utility.KeyValuePair").assign({
  _key: null,
  _value: null,
  
  KeyValuePair: function(key, value) {
    if(!key.is(String)) throw new Error("key must be a valid String.");
    if(value === undefined) throw new Error("value must be defined.");
    
    this._key = key;
    this._value = value;
  },
  
  getKey: function() {
    return this._key;
  },
  
  getValue: function() {
    return this._value;
  },
  
  setValue: function(value) {
    this._value = value;
  }
});
