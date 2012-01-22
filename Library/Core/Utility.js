
var fs = require("fs"),
    util = require("util");

exports.requireFolder = function(folder) {
  var files = fs.readdirSync(folder),
      stats,
      index,
      fileParts,
      isJsFile;

  if(ignoreFolder(folder)) return;

  //just in case there's not an ending / for this folder
  if(folder.lastIndexOf("/") < folder.length - 1) {
    folder += "/";
  }

  for(index in files) {
    stats = fs.lstatSync(files[index]),
    fileParts = files[index].split('.'),
    isJsFile = fileParts[fileParts.length - 1] === "js" ||
               fileParts[fileParts.length - 1] === "node";

    if(stats.isFile() && isJsFile) {
      require(folder + files[index]);
    }
  }
}

exports.requireFolderRecursive = function(folder) {
  var files = fs.readdirSync(folder),
      file,
      stats,
      index,
      fileParts,
      fileName,
      isJsFile;

  //just in case there's not an ending / for this folder
  if(folder.lastIndexOf("/") < folder.length - 1) {
    folder += "/";
  }

  for(index in files) {
    file = folder + files[index];
    stats = fs.lstatSync(file);

    if(stats.isDirectory() && !ignoreFolder(file)) {
      exports.requireFolderRecursive(file);
    } else if(stats.isFile()) {
      fileParts = file.split(".");
      isJsFile = (fileParts[fileParts.length - 1] === "js") ||
                 (fileParts[fileParts.length - 1] === "node");

      if(isJsFile) {
        fileName = file.split("/");
        fileName = fileName[fileName.length - 1];
        util.log("requiring \"" + fileName + "\"");
        require(file);
      }
    }
  }
}

function ignoreFolder(folder) {
  var currentFolder,
      index;

  for(index in config.app.ignore) {
    currentFolder = constants.AppRoot + config.app.ignore[index];
    if(folder == currentFolder) return true;
  }

  return false;
}

exports.loadConfig = function() {
  var input = fs.readFileSync(global.constants.AppRoot + "/Config/Application.config"),
      inputString = input.toString(),
      inputLines,
      currentLine,
      index;

  //get rid of any returns
  inputString = inputString.replace(/(\r)+/gim, "");

  //get rid of extra spaces
  inputString = inputString.replace(/[ ]+/gim, " ");

  //get lines
  inputLines = inputString.split("\n");

  //cut out any empty lines
  for(index in inputLines) {
    if(inputLines[index] === "") {
      inputLines.splice(index, 1);
    }
  }

  //checking every line
  for(index in inputLines) {
    //ignore comments
    if(inputLines[index][0] !== '#') {
      currentLine = inputLines[index].split("=");
      resolveConfigProperty(currentLine[0], currentLine[1]);
    }
  }
}

function resolveConfigProperty(propertyString, propertyValue) {
  var base = COM.ClassObject.obtainNamespace("global.config"),
      trail = propertyString.replace(/[ ]+/gim, "").split("."),
      index;

  //follow the trail
  for(index = 0; index < trail.length - 1; index++) {
    //console.log(base[trail])
    base[trail[index]] = base[trail[index]] || {};
    base = base[trail[index]];
  }

  if(propertyValue != null && propertyValue != undefined) {
    base[trail[index]] = propertyValue.replace(/[ ]+/, "");
  }
}
