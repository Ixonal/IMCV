
var crypto = require("crypto");

require("./Cookie");
//
//var hasher = crypto.createHash("SHA512"),
//    cipher = crypto.createCipher("AES256", "SOME_KEY"), 
//    decipher = crypto.createDecipher("AES256", "SOME_KEY"),
//    signer = crypto.createSign("DSA");
//
//var original = "blah";
//
//cipher.update(original, "utf8", "hex");
//
//var something = cipher.final("hex");
//
//decipher.update(something, "hex", "utf8");
//
//console.log(original);
//
//console.log(something);
//
//console.log(decipher.final("utf8"));
//
//console.log("----------------------");
//
//signer.update(original);
//
//console.log(signer.sign("SOME_KEY", "hex"));


define("IMVC.Http.CookieJar").assign({
  crypto: crypto,
  context: null,
  cookies: null,
  
  CookieJar: function(context) {
    this.context = context;
    this.cookies = {};
  },
  
  //loads all cookies into the jar
  populate: function() {
    var CookieJar = IMVC.Http.CookiJar,
        headers = this.context.request.getHeaders(),
        cookieHeader = headers["cookie"],
        cookies,
        cookieType,
        temp, temp2,
        index,
        newCookie;
    
    if(!cookieHeader) return;
    
    cookies = cookieHeader.split(CookieJar.FIELD_DELIMITER);
    
    for(index in cookies) {
      temp = cookies[index].split(CookieJar.ASSIGNMENT_DELIMITER);
      temp2 = temp[0].split(CookieJar.TYPE_DELIMITER),
      cookieType = temp2[0];
      
      switch(cookieType) {
        case "C":
          newCookie = new IMVC.Http.Cookie(temp2[1], temp[1]);
          break;
        case "S":
          newCookie = new IMVC.Http.SignedCookie(temp2[1], temp[1]);
          break;
        case "E":
          newCookie = new IMVC.Http.EncryptedCookie(temp2[1], temp[1]);
          newCookie._decypher();
          break;
        default:
          newCookie = new IMVC.Http.Cookie(cookieType, temp[1]);
          break;
      }
      
      this.cookies[newCookie.key] = newCookie;
      newCookie.modified = false;
      //this.cookies[temp[0]] = new IMVC.Http.Cookie(temp[0], temp[1]);
    }
  },
  
  toResponseHeader: function() {
    var CookieJar = IMVC.Http.CookieJar,
        responseHeader = [],
        index,
        cookie;
    
    for(index in this.cookies) {
      cookie = this.cookies[index];
      
      if(cookie._modified) {
        responseHeader.push(cookie.getTypeCode() + 
                            CookieJar.TYPE_DELIMITER + 
                            cookie.getKey() + 
                            CookieJar.ASSIGNMENT_DELIMITER + 
                            cookie.getResponseVal() + 
                            CookieJar.FIELD_DELIMITER + 
                            "expires" +
                            CookieJar.ASSIGNMENT_DELIMITER + 
                            cookie._expires.toGMTString()) + 
                            CookieJar.FIELD_DELIMITER;
      }
    }
    
    return responseHeader;
  },
  
  get: function(id) {
    
    if(this.cookies[id]) {
      return this.cookies[id];
    }
    
    return this.loadCookie(id);
  },
  
  loadCookie: function(id) {
    var CookieJar = IMVC.Http.CookieJar,
        headers = this.context.request.getHeaders(),
        cookieHeader = headers["cookie"],
        cookies,
        cookieParts,
        cookieName,
        cookieType,
        cookieValue,
        temp,
        index,
        newCookie = null;
    
    if(!cookieHeader) return null;
    
    cookies = cookieHeader.split(CookieJar.FIELD_DELIMITER);
    
    for(index in cookies) {
      cookieParts = cookies[index].split(CookieJar.ASSIGNMENT_DELIMITER);
      temp = cookieParts[0].split(CookieJar.TYPE_DELIMITER);
      cookieType = temp[0];
      cookieName = temp[1];
      cookieValue = cookieParts[1];
      
      if(cookieName == id) {
        switch(cookieType) {
          case "C":
            newCookie = new IMVC.Http.Cookie(cookieName, cookieValue);
            break;
          case "S":
            newCookie = new IMVC.Http.SignedCookie(cookieName, cookieValue);
            break;
          case "E":
            newCookie = new IMVC.Http.EncryptedCookie(cookieName, cookieValue);
            newCookie._encrypted = true;
            newCookie._decypher();
            break;
          default:
            newCookie = new IMVC.Http.Cookie(cookieType, cookieValue);              
            break;
        }
        
        newCookie._modified = false;
        this.cookies[cookieName] = newCookie;
        
        break;
      }
    }
    
    return newCookie;
    
  },
  
  set: function(id, value) {
    if(!this.cookies[id]) return this.add(new IMVC.Http.Cookie(id, value));
    
    this.cookies[id].value = value;
    return this.cookies[id];
  },
  
  add: function(cookie) {
    if(this.cookies[cookie.id]) return this.set(cookie.key, cookie.value);
    
    this.cookies[cookie.id] = cookie;
    return cookie;
  }
}).statics({
  TYPE_DELIMITER: "_",
  ASSIGNMENT_DELIMITER: "=",
  FIELD_DELIMITER: ";"
});

