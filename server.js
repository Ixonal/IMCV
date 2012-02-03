
//everything is based off of SCM, so it must be included first
//require("./Library/Core/SCM-min");
require("./Library/Core/SCM");

var http = require("http"),
    url = require("url"),
    fs = require("fs"),
    utility = require("./Library/Core/Utility");

//set up the global constants
global.constants = new COM.Namespace("constants");

//store the server's physical root
global.constants.AppRoot = fs.realpathSync(".");

//load the configuration file
utility.loadConfig();

//store whether or not the server is in development
global.constants.IsDev = (config.app.environment.toLowerCase() === "dev");

//store whether or not the server is in production
global.constants.IsProd = (config.app.environment.toLowerCase() === "prod");

//include all core files
utility.requireFolderRecursive(global.constants.AppRoot + config.app.library.root);

IMVC.Logger.log("Core library loaded.");

//include every other file
utility.requireFolderRecursive(fs.realpathSync("."));

IMVC.Logger.log("App code loaded.")

//invokes the sub-class manager
finalizeSubClass();


//load in routes
IMVC.Routing.Router.parseRoutes(IMVC.Controllers.ErrorController.errorRoute);
IMVC.Routing.Router.loadRoutes();


//set up the server
global.Server = http.createServer(function(request, response) {
  request = new IMVC.Http.Request(request);
  response = new IMVC.Http.Response(response);
  setTimeout(function() { (new IMVC.Routing.Router()).route(request, response); }, 1);
});

Server.listen(parseInt(config.http.port), config.http.host);



Server.criticalError = function(response, message) {
  IMVC.Logger.error("CRITICAL SERVER ERROR: " + message);
  IMVC.Logger.error("NOW CLOSING THE SERVER.");
  response.writeHead(500);
  response.end(message);
  Server.close();
}

IMVC.Logger.log("Server created!");
IMVC.Logger.log("Awaiting connections on " + config.http.host + ":" + config.http.port);
