
var http = require("http"),
    url = require("url"),
    fs = require("fs"),
    utility = require("./Library/Core/Utility");


//everything is based off of SCM, so it must be included first
require("./Library/Core/SCM-min");


global.constants = new COM.Namespace("constants");
global.constants.AppRoot = fs.realpathSync(".");

utility.loadConfig();

global.constants.IsDev = (config.app.environment === "dev");

//console.log(config.random.info);

//include all core files
utility.requireFolderRecursive(global.constants.AppRoot + config.app.library.root);

console.log("----------------------------------------------------");

//include every other file
utility.requireFolderRecursive(fs.realpathSync("."));

finalizeSubClass();

server = http.createServer(function(request, response) {
  var router = new Router();
  console.log("-----------------------------------------");
  console.log("new server request encountered");

  setTimeout(function() { router.route(request, response); }, 1);

  console.log("ending server handler function");
});

server.listen(9009, "localhost");


console.log("Server created...");