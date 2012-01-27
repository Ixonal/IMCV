
define("Routing.Route", "abstract").assign({
  method: null,
  path: null,
  pathParts: null,
  action: null,

  Route: function(method, path, operation) {
    this.method = method;
    this.path = path;
    this.operation = { full: operation };
    this.pathParts = this.path.split(/\//);
    this.pathParts.splice(0, 1);
  },

  equals: function(otherRoute) {
    
  },

  sameMethodAs: function(otherMethod) {
    return this.method.toLowerCase() == otherMethod.toLowerCase();
  },

  samePathAs: function(otherPath) {
    var outputVals = null,
        otherPathParts = otherPath.split(/\//),
        index,
        currentPartMatches;

    otherPathParts.splice(0, 1);

    //initial test. if they don't have the same number of parts,
    //the paths can't be the same
    if(this.pathParts.length !== otherPathParts.length) {
      return null;
    }

    outputVals = {};

    for(index in otherPathParts) {
      currentPartMatches = false;

      if(this.pathParts[index].match(/[\{].+[\}]/)) {
        currentPartMatches = true;
        outputVals[this.pathParts[index].replace(/[\{](.+)[\}]/, "$1")] = otherPathParts[index];
      } else {
        if(this.pathParts[index] == otherPathParts[index]) {
          currentPartMatches = true;
        }
      }

      if(!currentPartMatches) return null;
    }

    return outputVals;
  },

  activate: abstractFunction(Object)
});
