
//everything is based off of SCM, so it must be included first
require("./Library/Core/SCM-min");

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

Logger.log("Core library loaded.");

//include every other file
utility.requireFolderRecursive(fs.realpathSync("."));

Logger.log("App code loaded.")

//invokes the sub-class manager
finalizeSubClass();


//load in routes
Routing.Router.loadRoutes();


//set up the server
global.Server = http.createServer(function(request, response) {
  //var router = new Router();
  setTimeout(function() { (new Routing.Router()).route(request, response); }, 1);
});

Server.listen(parseInt(config.http.port), config.http.host);


Logger.log("Server created!");
Logger.log("Awaiting connections on " + config.http.host + ":" + config.http.port);
