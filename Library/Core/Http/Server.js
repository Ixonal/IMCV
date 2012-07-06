

//everything is based off of SCM, so it must be included first
//require("./Library/Core/SCM-min");
require("../SCM");

//if server events are already defined, this has already been called once
if(global.ServerEvents) return;

//process.nextTick(function() {
  
  global.ServerEvents = new COM.Namespace("ServerEvents");
  global.ServerEvents.coreLibraryLoaded = event();
  global.ServerEvents.appLoaded = event();
  global.ServerEvents.externalCodeLoading = event();
  global.ServerEvents.externalCodeLoaded = event();
  global.ServerEvents.classesReady = event();
  global.ServerEvents.routePreLoad = event();
  global.ServerEvents.routesLoaded = event();
  global.ServerEvents.connectedToDatabase = event();
  global.ServerEvents.serverCreated = event();
  global.ServerEvents.connectionReceived = event();
  global.ServerEvents.secureConnectionReceived = event();
  global.ServerEvents.requestBodyComplete = event();
  global.ServerEvents.caughtError = event();
  global.ServerEvents.serverExit = event();
  global.ServerEvents.appReady = event();
  
  global.ServerEvents.routing = event();
  global.ServerEvents.rendering = event();
  
  //polling events
  global.ServerEvents.minuteCheck = event();
  global.ServerEvents.hourCheck = event();
  global.ServerEvents.dayCheck = event();
  
  setInterval(function() { ServerEvents.minuteCheck(); }, 1000 * 60);
  setInterval(function() { ServerEvents.hourCheck(); }, 1000 * 60 * 60);
  setInterval(function() { ServerEvents.dayCheck(); }, 1000 * 60 * 60 * 24);
  
  
  ServerEvents.coreLibraryLoaded.subscribe(function() {
    IMVC.Logger.log("Core library loaded.");
  });
  
  ServerEvents.appLoaded.subscribe(function() {
    IMVC.Logger.log("App code loaded.");
  });
  
  ServerEvents.externalCodeLoading.subscribe(function(filename) {
    IMVC.Logger.log("Loading external code: " + filename);
  });
  
  ServerEvents.externalCodeLoaded.subscribe(function() {
    IMVC.Logger.log("External code loaded.");
  });
  
  ServerEvents.routesLoaded.subscribe(function() {
    IMVC.Logger.log("Routes loaded.");
  });
  
  ServerEvents.connectedToDatabase.subscribe(function() {
    IMVC.Logger.log("Connected to the database.");
  });
  
  ServerEvents.caughtError.subscribe(function(err) {
    IMVC.Logger.error(err.stack || err);
  });
  
  ServerEvents.serverExit.subscribe(function() {
    IMVC.Logger.log("Server shutting down.");
  });
  
  ServerEvents.appReady.subscribe(function() {
    IMVC.Logger.log("Server created!");
    IMVC.Logger.log("Awaiting connections on " + config.http.host + ":" + config.http.port);
  });
  
  
  var http = require("http"),
      https = require("https"),
      url = require("url"),
      fs = require("fs"),
      utility = require("../Utility");
  
  //set up the global constants
  global.constants = new COM.Namespace("constants");
  
  //store the server's physical root
  global.constants.AppRoot = process.cwd();
  
  //load the configuration file
  utility.loadConfig();
  
  global.constants.host = config.http.host;
  global.constants.port = config.http.port;
  global.constants.secureHost = config.http.ssl.host;
  global.constants.securePort = config.http.ssl.port;
  
  //store whether or not the server is in development
  global.constants.IsDev = (config.app.environment.toLowerCase() === "dev");
  
  //store whether or not the server is in production
  global.constants.IsProd = (config.app.environment.toLowerCase() === "prod");
  
  //include all core files
  utility.requireFolderRecursive(global.constants.AppRoot + config.app.library.root);
  
  ServerEvents.coreLibraryLoaded();
  
  //include every other file
  utility.requireFolderRecursive(constants.AppRoot);
  
  ServerEvents.appLoaded();
  
  //include all external code
  if(config.app && config.app.external) {
    for(var c in config.app.external) {
      ServerEvents.externalCodeLoading(config.app.external[c]);
      require(config.app.external[c]);
    }
  
    ServerEvents.externalCodeLoaded();
  }
  
  
  //invokes the sub-class manager
  finalizeSubClass();
  
  ServerEvents.classesReady();
  
  //load in routes
  ServerEvents.routePreLoad();
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
    IMVC.Logger.error("Unable to connect to the database: " + e.stack);
  }
  
  
  //set up the server
  global.Server = http.createServer(function(request, response) {
    request = new IMVC.Http.Request(request);
    response = new IMVC.Http.Response(response);
    
    ServerEvents.connectionReceived(request, response);
    
    var context = new IMVC.Http.HttpContext(request, response), 
        contentLength = request.getHeader("content-length");
    if(contentLength && +contentLength >= +config.http.request.maxSize) {
      request.errorEncountered = true;
      IMVC.Routing.Router.swapTo(IMVC.Controllers.Error, "413", context, {error: new Error("The request is too large.") });
    }
    
    request.error.subscribe(function(err) {
      IMVC.Routing.Router.swapTo(IMVC.Controllers.Error, "500", context, {error: err});
    });
    
  
    request.bodyLoaded.subscribe(function() {
      ServerEvents.requestBodyComplete(request);
      
      process.nextTick(function() {
        try {
          (new IMVC.Routing.Router()).route(context);
        } catch(e) {
          Server.criticalError(response, e.toString(), e);
        }
      });
    });
  });
  
  Server.listen(parseInt(config.http.port), config.http.host);
  
  
  if(utility.runSecureServer()) {
    global.SecureServer = https.createServer({
      key: utility.getPrivateKey(),
      cert: utility.getCertificate()
    }, function(request, response) {
      request = new IMVC.Http.Request(request, true);
      response = new IMVC.Http.Response(response, true);
      
      ServerEvents.secureConnectionReceived(request, response);
      
      var context = new IMVC.Http.HttpContext(request, response),
          contentLength = request.getHeader("content-length");
      if(contentLength && +contentLength >= +config.http.request.maxSize) {
        request.errorEncountered = true;
        IMVC.Routing.Router.swapTo(IMVC.Controllers.Error, "413", context, {error: new Error("The request is too large.") });
      }
      
      request.error.subscribe(function(err) {
        IMVC.Routing.Router.swapTo(IMVC.Controllers.Error, "500", context, {error: err});
      });
      
  
      request.bodyLoaded.subscribe(function() {
        ServerEvents.requestBodyComplete(request);
        
        process.nextTick(function() {
          try {
            (new IMVC.Routing.Router()).route(context);
          } catch(e) {
            Server.criticalError(response, e.toString(), e);
          }
        });
      });
    });
    
    SecureServer.listen(parseInt(config.http.ssl.port), config.http.ssl.host);
    

    SecureServer.criticalError = function(response, message, error) {
      IMVC.Logger.error("CRITICAL SERVER ERROR: " + message);
      if(error) IMVC.Logger.error(error.stack);
      IMVC.Logger.error("NOW CLOSING THE SERVER.");
      if(response) {
        response.writeHead(500);
        response.end(message);
      }
      Server.close();
      process.kill(process.pid);
    }
    
    SecureServer.on("close", function() {
      ServerEvents.serverExit();
    });
    
  }
  
  ServerEvents.serverCreated();
  
  
  Server.criticalError = function(response, message, error) {
    IMVC.Logger.error("CRITICAL SERVER ERROR: " + message);
    if(error) IMVC.Logger.error(error.stack);
    IMVC.Logger.error("NOW CLOSING THE SERVER.");
    if(response) {
      response.writeHead(500);
      response.end(message);
    }
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
  
  var test = new Models.ApplicationUser("test user");
  
  test.save();
  
  IMVC.Models.Repository.get(Models.ApplicationUser, function() {});
  
//});
