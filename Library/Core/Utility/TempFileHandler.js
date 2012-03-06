
var fs = require("fs");

define("IMVC.Utility.TempFileHandler").statics({
  TEMP_FILE_EXTENSION: ".tmp",
  
  createTempFileSync: function(folder, file, data) {
    var writtenFolder, writtenFile, fd;
    
    if(folder.charAt(0) !== '/') {
      folder = "/" + folder;
    }
    
    writtenFolder = constants.AppRoot + config.http.uploads.directory + folder;
    try {
      fs.statSync(writtenFolder);
    } catch(e) {
      fs.mkdirSync(writtenFolder, 0700);
    }
    
    
    if(file.charAt(0) !== '/') {
      file = "/" + file;
    }
    
    writtenFile = writtenFolder + file + IMVC.Utility.TempFileHandler.TEMP_FILE_EXTENSION;
    
    
    fd = fs.openSync(writtenFile, "w", 0666);
    
    fs.writeSync(fd, data, 0, data.length, 0);
    
    fs.closeSync(fd);
    
    return fs.realpathSync(writtenFile);
  },
  
  createTempFileAsync: function(folder, file, data, callback) {
    
  },
  
  removeTempFileSync: function(folder, file) {
    
  },
  
  removeTempFileAsync: function(folder, file, callback) {
    
  },
  

  cleanTempDirectory: ServerEvents.minuteCheck.subscribe("__cleaningTempDirectory", function() {
    //todo: implement me!
    //console.log("busy cleaning the temp directory!");
  })
});

//IMVC.Utility.TempFileHandler.cleaningTemp.subscribe("__cleaningTemp", IMVC.Utility.TempFileHandler.cleanTempDirectory);