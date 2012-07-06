require("../Utility/Securable");

var querystring = require("querystring"),
    formidable = require("./formidable"),
    fs = require("fs"),
    url = require("url");


define("IMVC.Http.Request").extend("IMVC.Utility.Securable").assign({
  nodeRequest: null,
  _context: null,
  errorEncountered: false,
  
  postVals: null,
  fileVals: null,
  queryVals: null,
  routeVals: null,
  
  postAdded: null,
  bodyLoaded: null,
  error: null,

  Request: function(nodeRequest, isSecure) {
    this.Securable(isSecure);
    this.nodeRequest = nodeRequest;
    
    this.postAdded = event(this);
    this.bodyLoaded = event(this);
    this.error = event(this);
    
    this.postVals = {};
    this.fileVals = {};
    this.queryVals = {};
    this.routeVals = {};
    
    var _this = this,
        urlObj = url.parse(this.getUrl(), true),
        index;
    
    for(index in urlObj.query) {
      this.queryVals[index] = urlObj.query[index];
    }
    
    if(this.getMethod().toUpperCase() === "POST") {
      
      if(this.getHeader("content-type").indexOf("text/plain") !== -1) {
        //text/plain forms
        var body = "";
        
        this.nodeRequest.on("data", function(chunk) {
          body += chunk;
        });
        
        this.nodeRequest.on("end", function() {
          _this._parsePlain(body);
          _this.bodyLoaded();
        });
        
      } else {
        //everything else
  
        var form = formidable.IncomingForm();
        
        form.uploadDir = IMVC.Utility.TempFileHandler.tempRoot;
        

        form.on("progress", function(received, expected) {
          
        });
        
        form.on("field", function(field, value) {
          if(_this.postVals[field]) {
            _this.postVals[field] = [_this.postVals[field]];
            _this.postVals[field].push(value);
          } else {
            _this.postVals[field] = value;
          }
          
          _this.postAdded();        
        });
        
        
        form.on("file", function(field, file) {
          if(file.size >= +config.http.uploads.uploadLimit) {
            fs.unlink(file.path);
            _this.errorEncountered = true;
            if(!_this.errorEncountered) {
              _this.error(new Error("Upload limit exceeded."));
            }
          } else {
            _this.postVals[field] = file;
            _this.fileVals[field] = file;
          
            _this.postAdded();
          }
        });
        
        form.on("end", function() {
          if(!_this.errorEncountered) {
            _this.bodyLoaded();
          }
        });
        
        form.parse(this.nodeRequest);
      }
      
      
    } else {
      setTimeout(function() {
        if(!_this.errorEncountered) {
          _this.bodyLoaded();
        }
      }, 1);
    }
  },
  
  getMethod: function() {
    return this.nodeRequest.method;
  },

  getUrl: function() {
    return this.nodeRequest.url;
  },

  getHeaders: function() {
    return this.nodeRequest.headers;
  },
  
  getHeader: function(key) {
    return this.getHeaders()[key];
  },

  getTrailers: function() {
    return this.nodeRequest.trailers;
  },

  getHttpVersion: function() {
    return this.nodeRequest.httpVersion;
  },

  getConnection: function() {
    return this.nodeRequest.connection;
  },

  pause: function() {
    return this.nodeRequest.pause();
  },

  resume: function() {
    return this.nodeRequest.resume();
  },
  
  setEncoding: function(to) {
    return this.nodeRequest.setEncoding(to);
  },
  
  retrieve: function(key) {
    var retVal = null;
    
    retVal = this.post(key);
    if(retVal) return retVal;
    
    retVal = this.file(key);
    if(retVal) return retVal;
    
    retVal = this.query(key);
    if(retVal) return retVal;
    
    retVal = this.route(key);
    if(retVal) return retVal;
    
    return null;
  },
  
  retrieveAll: function() {
    return COM.extend(this.postAll(), this.fileAll(), this.queryAll(), this.routeAll());
  },
  
  post: function(key) {
    var index;
    
    for(index in this.postVals) {
      if(index === key) return this.postVals[index];
    }
    
    return null;
  },
  
  postAll: function() {
    return COM.extend({}, this.postVals);
  },
  
  file: function(key) {
    var index;
    
    for(index in this.fileVals) {
      if(index === key) return this.fileVals[index];
    }
    
    return null;
  },
  
  fileAll: function() {
    return COM.extend({}, this.fileVals);
  },
  
  query: function(key) {
    var index;
    
    for(index in this.queryVals) {
      if(index === key) return this.queryVals[index];
    }
    
    return null;
  },
  
  queryAll: function() {
    return COM.extend({}, this.queryVals);
  },
  
  route: function(key) {
    var index;
    
    for(index in this.routeVals) {
      if(index === key) return this.routeVals[index];
    }
    
    return null;
  },
  
  routeAll: function() {
    return COM.extend({}, this.routeVals);
  },
  
  
  _parsePlain: function(body) {
    var plainReg = IMVC.Http.Request._plainReg,
        match;
    
    plainReg.lastIndex = 0;
    
    do {
      match = plainReg.exec(body);
      if(!match) continue;
      
      if(this.postVals[match[1]]) {
        //name already exists, make array of values
        this.postVals[match[1]] = [this.postVals[match[1]]];
        this.postVals[match[1]].push(match[2]);
      } else {
        //name doesn't exist, set its value
        this.postVals[match[1]] = match[2];
      }
    } while(plainReg.lastIndex != 0);

    return this.postVals;
  }
}).statics({
  _plainReg: /[\r\n]*([^=]+)=(.+)[\r\n]*/gim
});


