
var crypto = require("crypto");

define("IMVC.Http.HttpContext").assign({
  request: null,
  response: null, 
  cookies: null,
  session: null,
  
  
  HttpContext: function(request, response) {
    if(!request.is(IMVC.Http.Request)) throw new Error("request must be a valid IMVC.Http.Request.");
    if(!response.is(IMVC.Http.Response)) throw new Error("response must be a valid IMVC.Http.Response.");
    
    this.request = request;
    this.response = response;
    
    request._context = this;
    response._context = this;
    
    this.cookies = new IMVC.Http.CookieJar(this);
    
    var CID = this.getClientId();
    
    if(!CID) {
      var hasher = crypto.createHash("SHA512"),
          headers = this.request.getHeaders(),
          host = headers["host"],
          userAgent = headers["user-agent"],
          appName = config.app.name,
          clientIP = headers['x-forwarded-for'] || this.request.getConnection().remoteAddress,
          CIDValue;
      
      
      CIDValue = host + "_" + appName + "_" + clientIP + "_" + userAgent;
      
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
