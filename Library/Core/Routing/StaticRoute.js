
require("./Route.js");

var fs = require("fs");

define("IMVC.Routing.StaticRoute").extend("IMVC.Routing.Route").assign({
  StaticRoute: function(method, path, operation, secureStatus) {
    this.Route(method, path, operation, secureStatus);

    if(operation.lastIndexOf(":") == -1 || operation.lastIndexOf("/") == -1) {
      throw new Error("Static routes must map to a directory.");
    }

    var operationParts = operation.split(":");

    this._operation.directory = operationParts[1];
    
  },

  samePathAs: function(otherPath) {
    var variableReg = IMVC.Routing.Router.variableReg,
        otherPathParts = otherPath.split(/\//),
        outputVals = {},
        index,
        currentPartMatches;

    otherPathParts.splice(0, 1);

    if(otherPathParts.length < this._pathParts.length) return null;

    for(index in this._pathParts) {
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

    outputVals.additionalParts = [];
    for(index++; index < otherPathParts.length; index++) {
      outputVals.additionalParts.push(otherPathParts[index]);
    }

    return outputVals;
  },

  activate: function(context, routeInfo) {
    var pathTo = this._path,
        actualPath = constants.AppRoot + this._operation.directory,
        otherPathParts = routeInfo.routeVars.additionalParts,
        index,
        stats;

    for(index in otherPathParts) {
      actualPath += "/" + otherPathParts[index];
      if(index < otherPathParts.length) {
        pathTo += "/" + otherPathParts[index];
      }
    }

    if(pathTo.lastIndexOf("/") == pathTo.length - 1) {
      pathTo = pathTo.substr(0, pathTo.length - 1);
    }

    stats = fs.statSync(unescape(actualPath));

    if(stats.isDirectory()) {
      process.nextTick(function() { new IMVC.Views.DirectoryView(actualPath, context).render({pathTo: pathTo}) });
    } else if(stats.isFile()) {
      process.nextTick(function() { new IMVC.Views.FileView(actualPath, context).render() });
    } else {
      //well then wtf is it?

    }

    
  }
});
