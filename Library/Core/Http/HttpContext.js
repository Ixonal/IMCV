
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
    
    var CID = this.cookies.get("IMVC_CLIENT_ID");
    
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
      
      CID = this.cookies.add(new IMVC.Http.EncryptedCookie("IMVC_CLIENT_ID", hasher.digest("hex")));
    }
    
    this.session = new IMVC.Http.Session(this, CID.getValue());
    
  }
}).statics({
  hasher: crypto.createHash("SHA512")
});
