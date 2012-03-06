
var querystring = require("querystring"),
    formidable = require("./formidable"),
    fs = require("fs");


define("IMVC.Http.Request").assign({
  nodeRequest: null,
  
  postVals: null,
  fileVals: null,
  getVals: null,
  
  postAdded: null,
  bodyLoaded: null,

  Request: function(nodeRequest, completeCallback) {
    this.nodeRequest = nodeRequest;
    
    this.postAdded = event(this);
    this.bodyLoaded = event(this);
    
    this.postVals = {};
    this.fileVals = {};
    this.getVals = {};
    
    var _this = this;
    
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
        
        form.uploadDir = constants.AppRoot + config.http.uploads.directory;
        
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
          
          _this.postVals[field] = file;
          _this.fileVals[field] = file;
          
          _this.postAdded();
        });
        
        form.on("end", function() {
          _this.bodyLoaded();
        });
        
        form.parse(this.nodeRequest);
      }
      
      
    } else {
      setTimeout(function() {
        _this.bodyLoaded();
      }, 1);
    }
  },
  
  post: function(key) {
    return this.postVals[key];
  },
  
  get: function(key) {
    return this.getVals[key];
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
  
  
//  getBody: function() {
//    return this[" body "];
//  },
  
  _parseMultipart: function(body, boundary) {
    //todo: find a quicker way to parse the request body
    //around 230 mbps right now, I know we can do better 
    var bodyParts = body.split(new RegExp(boundary, "gim")),
        multiReg = /\s*Content-Disposition: form-data;\s*name="([^"]*)"(;\s*filename="([^"]*)")?\s*(Content-Type:\s*(\S*))?\s*([\w\W]*)--/gim,
        NAME_FIELD = 1,
        FILENAME_FIELD = 3,
        CONTENT_TYPE = 5,
        VALUE_FIELD = 6,
        tempFolder = (this.getHeaders()['x-forwarded-for'] || this.getConnection().remoteAddress) + "_" + (new Date()).getTime().toString(),
        index,
        result,
        returnVal = {},
        returnRemoveReg = /\r|\n/gm,
        fileBuffer;
    
    
    for(index in bodyParts) {
      multiReg.lastIndex = 0;
      result = multiReg.exec(bodyParts[index]);
      //console.log(result);
      if(result) {
        if(returnVal[result[NAME_FIELD]]) {
          returnVal[result[NAME_FIELD]] = [returnVal[result[NAME_FIELD]]];
          returnVal[result[NAME_FIELD]].push(result[VALUE_FIELD].replace(returnRemoveReg, ""));
        } else {
          if(!result[FILENAME_FIELD]) {
            //normal value here
            returnVal[result[NAME_FIELD]] = result[VALUE_FIELD].replace(returnRemoveReg, "");
          } else {

            //got a file...
            if(result[VALUE_FIELD].replace(returnRemoveReg, "").length > 0) {
              fileBuffer = new Buffer(result[VALUE_FIELD], "binary");
              if(fileBuffer.length <= parseInt(config.http.uploads.uploadLimit)) {
                returnVal[result[NAME_FIELD]] = {
                  fileName: result[FILENAME_FIELD],
                  tempFile: IMVC.Utility.TempFileHandler.createTempFileSync(tempFolder, result[NAME_FIELD], fileBuffer),
                  contentType: result[CONTENT_TYPE]
                };
              }
            }
            
          }
        }
      }
    }
    
    return returnVal;
  },
  
  _parseMultipartII: function(body, boundary) {
    var index = 0,
        substring = "",
        bodyParts = [];
    
    for(index in body) {
      substring += body[index];
      if(substring.indexOf(boundary) !== -1) {
        bodyParts.push(substring);
        substring = "";
        
      }
    }
    
    console.log(bodyParts.length);
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


