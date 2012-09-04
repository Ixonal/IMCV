
var crypto = require("crypto");

define("IMVC.Http.EncryptedCookie").extend("IMVC.Http.Cookie").assign({
  _encrypted: false,
  
  EncryptedCookie: function(key, value, expires) {
    this.Cookie(key, value, expires);
  },
  
  _decypher: function() {
    if(!this._encrypted) {
      //throw new Error("The cookie is not yet encrypted.");
      return;
    }
    
    //just to make sure these things are in there
    if(!config.http) config.http = {};
    if(!config.http.cookies) config.http.cookies = {};
    if(!config.http.cookies.encryption) config.http.cookies.encryption = {};
    if(!config.http.cookies.encryption.algorithm) config.http.cookies.encryption.algorithm = "AES256";
    if(!config.http.cookies.encryption.key) config.http.cookies.encryption.key = "SOME_KEY";
      
      
    var decypher = crypto.createDecipher(config.http.cookies.encryption.algorithm, config.http.cookies.encryption.key),
        decypheredValue = "";
    
    try {
      decypheredValue += decypher.update(this._value, "hex", "ascii");
      decypheredValue += decypher.final("ascii");
      
    } catch(e) {
      IMVC.Logger.warn("A cookie was unable to be decrypted: " + this._key + ", " + e.stack);
      decypheredValue = this.getValue();
    }
    
    this._encrypted = false;
    this._value = decypheredValue;
  },
  
  _cypher: function() {
    if(this._encrypted) {
      //throw new Error("The cookie is already encrypted.");
      return;
    } 
    
  //just to make sure these things are in there
    if(!config.http) config.http = {};
    if(!config.http.cookies) config.http.cookies = {};
    if(!config.http.cookies.encryption) config.http.cookies.encryption = {};
    if(!config.http.cookies.encryption.algorithm) config.http.cookies.encryption.algorithm = "AES256";
    if(!config.http.cookies.encryption.key) config.http.cookies.encryption.key = "SOME_KEY";
    
    var cypher = crypto.createCipher(config.http.cookies.encryption.algorithm, config.http.cookies.encryption.key),
        newVal = "";
    
    try {
      newVal += cypher.update(this._value, "ascii", "hex");
      newVal += cypher.final("hex");
    } catch(e) {
      IMVC.Logger.warn("A cookie was unable to be encrypted: " + this._key + ", " + e.toString());
      newVal = this.getValue();
    }
    
    this._encrypted = true;
    this._value = newVal;
  },
  
  getValue: function() {
    if(this._encrypted) {
      this._decypher();
    }
    
    return this._value;
  },
  
  getResponseVal: function() {
    this._cypher();
    
    return this._value;
  },
  
  getTypeCode: function() {
    return "E";
  }
  
});
