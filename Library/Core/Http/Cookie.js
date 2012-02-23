
require("../Utility/KeyValuePair");

//todo: force types in this

define("IMVC.Http.Cookie").extend("IMVC.Utility.KeyValuePair").assign({
  _domain: null,
  _path: null,
  _expires: null,
  _secure: null,
  _httpOnly: null,
  _modified: null,
  
  Cookie: function(key, value, expires) {
    this.KeyValuePair(key, value);
    
    //by default, will expire after a week
    if(typeof(expires) !== "number") {
      expires = 1000 * 60 * 60 * 24 * 7;
    }
    
    this._modified = true;
    this._expires = new Date();
    this._expires.setTime(this._expires.getTime() + expires);
  },
  
  getResponseVal: function() {
    return this._value;
  },
  
  getTypeCode: function() {
    return "C";
  },
  
  setValue: function(value) {
    this._value = value;
    this._modified = true;
  },
  
  setDomain: function(domain) {
    this._domain = domain;
    this._modified = true;
  },
  
  setPath: function(path) {
    this._path = path;
    this._modified = true;
  },
  
  setExpires: function(expires) {
    this._expires.setTime(expires);
    this._modified = true;
  },
  
  setSecure: function(secure) {
    this._secure = secure;
    this._modified = true;
  },
  
  setHttpOnly: function(httpOnly) {
    this._httpOnly = httpOnly;
    this._modified = true;
  },
  
  remove: function() {
    this.setExpires(new Date().getTime() - 1);
  }
});
