
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
IMVC.Routing.Router.parseRoutes(IMVC.Controllers.Error.errorRoute);
IMVC.Routing.Router.loadRoutes();
IMVC.Logger.log("Routes loaded.");


//connect to the database
try {
if(config.db.connectionString) {
  IMVC.Models.Model.connectToDatabase(config.connectionString);
  IMVC.Logger.log("Connected to the database.");
} else if(config.db.host && config.db.port && config.db.database) {
  IMVC.Models.Model.connectToDatabase(config.db.host, config.db.database, config.db.port, {});
  IMVC.Logger.log("Connected to the database.");
}
} catch(e) {
  IMVC.Logger.error("Unable to connect to the database: " + e);
}


//set up the server
global.Server = http.createServer(function(request, response) {
  request = new IMVC.Http.Request(request);
  response = new IMVC.Http.Response(response);
  
  setTimeout(function() {
    try {
      (new IMVC.Routing.Router()).route(new IMVC.Http.HttpContext(request, response));
    } catch(e) {
      Server.criticalError(response, e.toString());
    }
  }, 1);
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
