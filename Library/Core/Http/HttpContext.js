
var crypto = require("crypto");

define("IMVC.Http.HttpContext").assign({
  request: null,
  response: null, 
  cookies: null,
  session: null,
  userId: null,
  
  HttpContext: function(request, response) {
    this.request = request;
    this.response = response;
    
    this.cookies = new IMVC.Http.CookieJar(this);
    
    var CID = this.cookies.get(IMVC.Http.HttpContext.clientId);
    
    if(!CID) {
      var hasher = crypto.createHash("SHA512"),
          headers = this.request.getHeaders(),
          host = headers["host"],
          userAgent = headers["user-agent"],
          appName = config.app.name,
          hostIP,
          CIDValue;
      
      hostIP = headers['x-forwarded-for'];
      if(typeof(hostIP) == "undefined") {
        hostIP = this.request.getConnection().remoteAddress;
      }
      
      CIDValue = host + "_" + appName + "_" + hostIP + "_" + userAgent;
      
      hasher.update(CIDValue);
      
      CID = this.cookies.add(new IMVC.Http.EncryptedCookie(IMVC.Http.HttpContext.clientId, hasher.digest("hex"))).getValue();
    }
    
    this.session = new IMVC.Http.Session(this, CID);
    
  },
  
  getClientId: function() {
    return this.cookies.get(IMVC.Http.HttpContext.clientId);
  }
}).statics({
  hasher: crypto.createHash("SHA512"),
  clientId: (config.app.name || "default").replace(/\s+/gm, "_") + "_IMVC_CLIENT_ID"
});
