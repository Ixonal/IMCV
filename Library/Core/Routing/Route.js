
require("./Router");

require("../Http/HttpContext");

define("IMVC.Routing.Route", "abstract").assign({
  _method: null,
  _path: null,
  _pathParts: null,
  _action: null,
  _secureStatus: null,

  Route: function(method, path, operation, secureCode) {
    if(!Object.is(method, String)) throw new Error("method must be a valid string.");
    if(!Object.is(path, String)) throw new Error("path must be a valid string.");
    if(!Object.is(operation, String)) throw new Error("operation must be a valid string.");
    if(!Object.is(secureCode, String)) throw new Error("secureCode must be a valid string.");
    
    this._method = method;
    this._path = path;
    this._operation = { full: operation };
    this._pathParts = this._path.split(/\//);
    this._pathParts.splice(0, 1);
    this._secureStatus = new IMVC.Routing.RouteSecureStatus(secureCode);
  },

  sameMethodAs: function(otherMethod) {
    return this._method.toLowerCase() == otherMethod.toLowerCase();
  },

  samePathAs: function(otherPath) {
    var outputVals = null,
        variableReg = IMVC.Routing.Router.variableReg,
        otherPathParts = otherPath.split(/\//),
        index,
        currentPartMatches;

    otherPathParts.splice(0, 1);

    //initial test. if they don't have the same number of parts,
    //the paths can't be the same
    if(this._pathParts.length !== otherPathParts.length) {
      return null;
    }

    outputVals = {};

    for(index in otherPathParts) {
      currentPartMatches = false;

      if(this._pathParts[index].match(variableReg)) {
        currentPartMatches = true;
        outputVals[this._pathParts[index].replace(variableReg, "$1")] = otherPathParts[index];
      } else {
        if(this._pathParts[index] == otherPathParts[index]) {
          currentPartMatches = true;
        }
      }

      if(!currentPartMatches) return null;
    }

    return outputVals;
  },
  
  getSecureStatus: function() {
    return this._secureStatus.getStatus();
  },

  activate: abstractFunction(IMVC.Http.HttpContext, Object)
});

define("IMVC.Routing.RouteSecureStatus").assign({
  _code: null,
  
  RouteSecureStatus: function(code) {
    if(code === "") {
      code = IMVC.Routing.RouteSecureStatus.INDIFFERENT_CODE;
    }
    
    if(!IMVC.Routing.RouteSecureStatus.validate(code)) {
      throw new Error("Invalid Route Secure Status Code: " + code);
    }
    
    this._code = code.toLowerCase();
  },
  
  getStatus: function() {
    return this._code;
  }
}).statics({
  SECURE_CODE: "secure",
  INSECURE_CODE: "insecure",
  INDIFFERENT_CODE: "indifferent",
  
  validate: function(code) {
    var RouteSecureStatus = IMVC.Routing.RouteSecureStatus;
    
    if(!code.is(String)) return false;
    
    code = code.toLowerCase();
    
    if(code !== RouteSecureStatus.SECURE_CODE && code !== RouteSecureStatus.INSECURE_CODE && code !== RouteSecureStatus.INDIFFERENT_CODE) {
      return false;
    }
    
    return true;
  }
});
