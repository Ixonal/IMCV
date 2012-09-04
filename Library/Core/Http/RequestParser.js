
var querystring = require("querystring"),
    formidable = require("./formidable");

define("IMVC.Http.RequestParser").assign({
  _request: null,
  
  _contentType: null,
  _boundary: null,
  
  RequestParser: function(request) {
    this._request = request;
    
    var contentTypeLine = request.getHeader("content-type");
    
    this._boundary = contentTypeLine.substring(contentTypeLine.lastIndexOf("=") + 1, contentTypeLine.length);
    this._contentType = contentTypeLine.substring(0, contentTypeLine.lastIndexOf(";"));
  },
  
  parse: function() {
    switch(this._contentType) {
      case "text/plain":
        this.postVals = this._parsePlain(this._request[" body "]);
        
        break;
      case "multipart/form-data":
        this.postVals = this._parseMultipart(this._request[" body "], boundary);
        
        break;
      case "application/x-www-form-urlencoded":
      default:
        this.postVals = querystring.parse(this._request[" body "]);
        break;
    }
  },
  
  parsePostPlain: function(body) {
    var plainReg = IMVC.Http.RequestParser._plainReg,
        match,
        returnVal = {};
    
    plainReg.lastIndex = 0;
    
    do {
      match = plainReg.exec(body);
      if(!match) continue;
      
      if(returnVal[match[1]]) {
        //name already exists, make array of values
        returnVal[match[1]] = [returnVal[match[1]]];
        returnVal[match[1]].push(match[2]);
      } else {
        //name doesn't exist, set its value
        returnVal[match[1]] = match[2];
      }
    } while(plainReg.lastIndex != 0);
    
    return returnVal;
  },
  
  parsePostQuery: function() {
    return querystring.parse(body);
  },
  
  parsePostMultipart: function() {
    
  }
}).statics({
  _plainReg: /[\r\n]*([^=]+)=(.+)[\r\n]*/gim
});
