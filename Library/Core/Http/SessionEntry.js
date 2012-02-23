

require("../Utility/KeyValuePair");


define("IMVC.Http.SessionEntry").extend("IMVC.Utility.KeyValuePair").assign({
  
  SessionEntry: function(key, value) {
    this.KeyValuePair(key, value);
  }
});
