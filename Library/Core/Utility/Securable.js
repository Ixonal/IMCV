
define("IMVC.Utility.Securable", "abstract").assign({
  _isSecure: false,
  
  Securable: function(isSecure) {
    if(typeof(isSecure) !== "undefined" && typeof(isSecure) !== "null" && isSecure.is(Boolean)) {
      this.setSecure(isSecure);
    }
  },
  
  isSecure: function() {
    return this._isSecure;
  },
  
  setSecure: function(isSecure) {
    this._isSecure = isSecure;
  }
})