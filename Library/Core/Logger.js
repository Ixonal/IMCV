
var fs = require("fs");

define("Logger").statics({
  useConsole: false,
  useError: false,
  useWarn: false,
  useLog: false,

  MessageType: {
    info: "Info",
    warn: "Warning",
    error: "Error"
  },

  updateWriteFlags: function() {
    switch(config.app.logging.reportingLevel.toLowerCase()) {
      case "console":
        Logger.useConsole = true;
        Logger.useError = true;
        Logger.useWarn = true;
        Logger.useLog = false;
        break;
      case "debug":
        Logger.useConsole = true;
        Logger.useError = true;
        Logger.useWarn = true;
        Logger.useLog = true;
        break;
      case "important":
        Logger.useConsole = false;
        Logger.useError = true;
        Logger.useWarn = false;
        Logger.useLog = true;
        break;
      case "log":
        Logger.useConsole = false;
        Logger.useError = false;
        Logger.useWarn = false;
        Logger.useLog = true;
        break;
      case "silent":
      default:
        Logger.useConsole = false;
        Logger.useError = false;
        Logger.useWarn = false;
        Logger.useLog = false;
        break;
    }
  },

  formatMessage: function(message, messageType) {
    var currentTime = new Date(Date.now()),
        timeStamp = (currentTime.getMonth() + 1) + "/" +
                    currentTime.getDate() + "/" +
                    (currentTime.getYear() + 1900) + " " +
                    currentTime.getHours() + ":" +
                    currentTime.getMinutes() + ":" +
                    currentTime.getSeconds();
    return (messageType + ": " + timeStamp + " - " + message);

//    switch(messageType) {
//      case Logger.MessageType.info:
//
//        break;
//      case Logger.MessageType.warn:
//
//        break;
//      case Logger.MessageType.error:
//
//        break;
//    }
  },

  log: function(message) {
    Logger.updateWriteFlags();
    message = Logger.formatMessage(message, Logger.MessageType.info);

    if(Logger.useConsole) {
      console.log(message);
    }
    if(Logger.useLog) {
      Logger.writeToLog(message);
    }
  },

  info: function(message) {
    Logger.updateWriteFlags();
    message = Logger.formatMessage(message, Logger.MessageType.info);

    if(Logger.useConsole) {
      console.log(message);
    }

    if(Logger.useLog) {
      Logger.writeToLog(message);
    }
  },

  warn: function(message) {
    Logger.updateWriteFlags();
    message = Logger.formatMessage(message, Logger.MessageType.warn);

    if(Logger.useWarn) {
      console.warn(message);
    }

    if(Logger.useLog) {
      Logger.writeToLog(message);
    }
  },

  warning: function(message) {
    Logger.warn(message);
  },

  error: function(message) {
    Logger.updateWriteFlags();
    message = Logger.formatMessage(message, Logger.MessageType.error);

    if(Logger.useError) {
      console.error(message);
    }

    if(Logger.useLog) {
      Logger.writeToLog(message);
    }
  },

  err: function(message) {
    Logger.error(message);
  },

  writeToLog: function(message) {
    Logger.updateWriteFlags();

    if(Logger.useLog) {
      var logFile = fs.createWriteStream(constants.AppRoot + config.app.logging.log, {flags: 'a'});

      logFile.write(message + "\n");
    }
  }
});
