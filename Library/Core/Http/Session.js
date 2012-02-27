
define("IMVC.Http.Session").assign({
  _userSession: null,
  
  Session: function(context, CID) {
    var Session = IMVC.Http.Session;
    
    if(typeof(Session.globalSession[CID]) === "undefined") {
      Session.globalSession[CID] = this._userSession = {};
    } else {
      this._userSession = Session.globalSession[CID];
    }
    
  },
  
  add: function(sessionEntry) {
    if(this._userSession[sessionEntry.getKey()]) return this.set(sessionEntry.getKey(), sessionEntry.getValue());
    
    this._userSession[sessionEntry.getKey()] = sessionEntry;
    return sessionEntry;
  },
  
  set: function(key, value) {
    if(!this._userSession[key]) return this.add(new IMVC.Http.SessionEntry(key, value));
    
    return this._userSession[key].setValue(value);
  },
  
  get: function(key) {
    if(this._userSession[key]) {
      return this._userSession[key].getValue();
    } else {
      return null;
    }
  },
  
  remove: function(key) {
    delete this._userSession[key];
  }
}).statics({
  globalSession: {},
  persistSession: ServerEvents.serverExit.subscribe(function() {
    console.log("should persist the session state here...");
  })
});

