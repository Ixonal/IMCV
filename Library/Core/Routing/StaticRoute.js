
require("./Route.js");

var fs = require("fs");

define("Routing.StaticRoute").extend("Routing.Route").assign({
  StaticRoute: function(method, path, operation) {
    this.Route(method, path, operation);

    if(operation.lastIndexOf(":") == -1 || operation.lastIndexOf("/") == -1) {
      throw new Error("Static routes must map to a directory.");
    }

    var operationParts = operation.split(":");

    this.operation.directory = operationParts[1];
    
  },

  samePathAs: function(otherPath) {
    var otherPathParts = otherPath.split(/\//),
        outputVals = {},
        index,
        currentPartMatches;

    otherPathParts.splice(0, 1);

    if(otherPathParts.length < this.pathParts.length) return null;

    for(index in this.pathParts) {
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

    outputVals.additionalParts = [];
    for(index++; index < otherPathParts.length; index++) {
      outputVals.additionalParts.push(otherPathParts[index]);
    }

    return outputVals;
  },

  activate: function(request, response, routeInfo) {
    var pathTo = this.path,
        actualPath = constants.AppRoot + this.operation.directory,
        otherPathParts = routeInfo.routeVars.additionalParts,
        index;

    for(index in otherPathParts) {
      actualPath += "/" + otherPathParts[index];
      if(index < otherPathParts.length) {
        pathTo += "/" + otherPathParts[index];
      }
    }

    setTimeout(function() { new Views.StaticView(actualPath, pathTo, request, response).render() }, 1);
  }
});
