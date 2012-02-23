
var crypto = require("crypto");

define("IMVC.Http.EncryptedCookie").extend("IMVC.Http.Cookie").assign({
  _encrypted: null,
  
  EncryptedCookie: function(key, value, expires) {
    this.Cookie(key, value, expires);
    
    this._encrypted = false;
  },
  
  _decypher: function() {
    if(!this._encrypted) {
      throw new Error("The cookie is not yet encrypted.");
    }
    var decypher = crypto.createDecipher(config.http.cookies.encryption.algorithm || "AES256", config.http.cookies.encryption.key || "SOME_KEY"),
        decypheredValue = "";
    
    try {
      decypheredValue += decypher.update(this.getValue(), "hex", "ascii");
      decypheredValue += decypher.final("ascii");
      
    } catch(e) {
      IMVC.Logger.warn("A cookie was unable to be decrypted: " + this.getKey() + ", " + e.toString());
      decypheredValue = this.getValue();
    }
    
    this._encrypted = true;
    this.setValue(decypheredValue);
  },
  
  _cypher: function() {
    if(this._encrypted) {
      throw new Error("The cookie is already encrypted.");
    } 
    
    var cypher = crypto.createCipher(config.http.cookies.encryption.algorithm || "AES256", config.http.cookies.encryption.key || "SOME_KEY"),
        newVal = "";
    
    try {
      newVal += cypher.update(this.getValue(), "ascii", "hex");
      newVal += cypher.final("hex");
    } catch(e) {
      IMVC.Logger.warn("A cookie was unable to be encrypted: " + this.getKey() + ", " + e.toString());
      newVal = this.getValue();
    }
    
    this._encrypted = false;
    this.setValue(newVal);
  },
  
  
  getResponseVal: function() {
    this._cypher();
    
    return this.getValue();
  },
  
  getTypeCode: function() {
    return "E";
  }
  
});
