
var fs = require("fs");

define("IMVC.Utility.TempFileHandler").statics({
  
  cleanTempDirectory: ServerEvents.minuteCheck.subscribe(function() {
    var tempRoot = IMVC.Utility.TempFileHandler.tempRoot;

    fs.lstat(tempRoot, function(err, stats) {
      if(!err) {
        if(stats.isDirectory()) {
          fs.readdir(tempRoot, IMVC.Utility.TempFileHandler.scanFiles);
        } else {
          IMVC.Logger.error("The temp directory is not a directory.")
        }
      } else {
        IMVC.Logger.error("Unable to obtain information on the temp directory: " + err);
      }
    });
    
  }),
  
  scanFiles: function(err, files) {
    var index,
        tempRoot = IMVC.Utility.TempFileHandler.tempRoot,
        currentFile;
    
    if(!err) {
      for(index in files) {
        currentFile = tempRoot + "/" + files[index];
        fs.lstat(currentFile, function(err, stats) {
          if(!err) {
            IMVC.Utility.TempFileHandler.deleteIfOld(currentFile, stats);
          } else {
            IMVC.Logger.error("Unable to obtain information about " + files[index] + ": " + err);
          }
        });
      }
    } else {
      IMVC.Logger.error("Unable to read files from the temp directory: " + err);
    }
  },
  
  deleteIfOld: function(file, stats) {
    var timeDifference = new Date().getTime() - stats.ctime.getTime();
    
    if(timeDifference >= +config.http.uploads.holdFor) {
      fs.unlink(file);
    }
  },
  
  tempRoot: constants.AppRoot + config.http.uploads.directory
});
