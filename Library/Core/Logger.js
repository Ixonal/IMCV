
var fs = require("fs");

define("Logger").statics({
  useConsole: false,
  useError: false,
  useWarn: false,
  useLog: false,

  MessageType: {
    info: 1,
    warn: 2,
    error: 3
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
    switch(messageType) {
      case Logger.MessageType.info:

        break;
      case Logger.MessageType.warn:

        break;
      case Logger.MessageType.error:

        break;
    }
  },

  log: function(message) {
    message = Logger.formatMessage(message, Logger.MessageType.info);
    console.log(message);
  },

  info: function(message) {
    message = Logger.formatMessage(message, Logger.MessageType.info);
    console.log(message);
  },

  warn: function(message) {
    message = Logger.formatMessage(message, Logger.MessageType.warn);
    console.warn(message);
  },

  error: function(message) {
    message = Logger.formatMessage(message, Logger.MessageType.error);
    console.error(message);
  },

  writeToLog: function(message) {
    fs.open("", "a+", "0666", function(err, fd) {
      fs.write(fd, message, 0, message.length, 0);
    });
  }
});
