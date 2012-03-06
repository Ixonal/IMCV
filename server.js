
//everything is based off of SCM, so it must be included first
//require("./Library/Core/SCM-min");
require("./Library/Core/SCM");

global.ServerEvents = new COM.Namespace("ServerEvents");
global.ServerEvents.coreLibraryLoaded = event();
global.ServerEvents.appLoaded = event();
global.ServerEvents.classesReady = event();
global.ServerEvents.routesLoaded = event();
global.ServerEvents.connectedToDatabase = event();
global.ServerEvents.serverCreated = event();
global.ServerEvents.connectionReceived = event();
global.ServerEvents.requestBodyComplete = event();
global.ServerEvents.caughtError = event();
global.ServerEvents.serverExit = event();
global.ServerEvents.appReady = event();

//polling events
global.ServerEvents.minuteCheck = event();
global.ServerEvents.hourCheck = event();
global.ServerEvents.dayCheck = event();

setInterval(function() { ServerEvents.minuteCheck(); }, 1000 * 60);
setInterval(function() { ServerEvents.hourCheck(); }, 1000 * 60 * 60);
setInterval(function() { ServerEvents.dayCheck(); }, 1000 * 60 * 60 * 24);


ServerEvents.coreLibraryLoaded.subscribe("__coreLoaded", function() {
  IMVC.Logger.log("Core library loaded.");
});

ServerEvents.appLoaded.subscribe("__appLoaded", function() {
  IMVC.Logger.log("App code loaded.");
});

ServerEvents.routesLoaded.subscribe("__routesLoaded", function() {
  IMVC.Logger.log("Routes loaded.");
});

ServerEvents.connectedToDatabase.subscribe("__databaseConnected", function() {
  IMVC.Logger.log("Connected to the database.");
});

ServerEvents.caughtError.subscribe("__caughtError", function(err) {
  IMVC.Logger.error(err.stack);
});

ServerEvents.serverExit.subscribe("__serverExit", function() {
  IMVC.Logger.log("Server shutting down.");
});

ServerEvents.appReady.subscribe("__appReady", function() {
  IMVC.Logger.log("Server created!");
  IMVC.Logger.log("Awaiting connections on " + config.http.host + ":" + config.http.port);
});


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

ServerEvents.coreLibraryLoaded();

//include every other file
utility.requireFolderRecursive(fs.realpathSync("."));

ServerEvents.appLoaded();

//invokes the sub-class manager
finalizeSubClass();

ServerEvents.classesReady();

//load in routes
IMVC.Routing.Router.parseRoutes(IMVC.Controllers.Error.errorRoute);
IMVC.Routing.Router.loadRoutes();

ServerEvents.routesLoaded();

//connect to the database
try {
  if(config.db.connectionString) {
    IMVC.Models.Model.connectToDatabase(config.connectionString);
    ServerEvents.connectedToDatabase();
  } else if(config.db.host && config.db.port && config.db.database) {
    IMVC.Models.Model.connectToDatabase(config.db.host, config.db.database, config.db.port, {});
    ServerEvents.connectedToDatabase();
  }
} catch(e) {
  IMVC.Logger.error("Unable to connect to the database: " + e);
}


//set up the server
global.Server = http.createServer(function(request, response) {
  request = new IMVC.Http.Request(request);
  response = new IMVC.Http.Response(response);
  
  ServerEvents.connectionReceived(request, response);
  

  request.bodyLoaded.subscribe("__requestReady", function() {
    ServerEvents.requestBodyComplete(request);
    
    
    process.nextTick(function() {
      try {
        (new IMVC.Routing.Router()).route(new IMVC.Http.HttpContext(request, response));
      } catch(e) {
        Server.criticalError(response, e.toString());
      }
    });
  });
});

Server.listen(parseInt(config.http.port), config.http.host);

ServerEvents.serverCreated();


Server.criticalError = function(response, message) {
  IMVC.Logger.error("CRITICAL SERVER ERROR: " + message);
  IMVC.Logger.error("NOW CLOSING THE SERVER.");
  response.writeHead(500);
  response.end(message);
  Server.close();
  process.kill(process.pid);
}

Server.on("close", function() {
  ServerEvents.serverExit();
});

process.on("uncaughtException", function (err) {
  ServerEvents.caughtError(err);
});

process.on("exit", function() {
  ServerEvents.serverExit();
});

//process.on("SIGINT", function() {
//  ServerEvents.serverExit();
//});

ServerEvents.appReady();
