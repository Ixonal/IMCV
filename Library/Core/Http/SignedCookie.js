
define("IMVC.Http.SignedCookie").extend("IMVC.Http.Cookie").assign({
  SignedCookie: function(key, value) {
    this.Cookie(key, value);
  },
  
  
  getResponseVal: function() {
    return this.value;
  }
});
