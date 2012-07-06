
define("IMVC.Http.Session").assign({
  _userSession: null,
  _userTimeout: null,
  _CID: null,
  
  Session: function(context, CID) {
    var Session = IMVC.Http.Session,
        _this = this;
    
    this._CID = CID;
    
    if(typeof(Session.globalSession[CID]) === "undefined") {
      Session.globalSession[CID] = this._userSession = {};
    } else {
      this._userSession = Session.globalSession[CID];
    }
    
    if(Session.globalTimeouts[CID]) {
      this._userTimeout = Session.globalTimeouts[CID];
    } else {
      this._userTimeout = Session.globalTimeouts[CID] = setInterval(function() { _this.sessionTimeout.call(_this); }, +(config.http.session.duration));
    }
    
  },
  
  _Session: function() {
    var index;
    
    for(index in this._userSession) {
      destroy(this._userSession[index]);
    }
    
    delete IMVC.Http.Session.globalSession[this._CID];
    delete IMVC.Http.Session.globalTimeouts[this._CID];
  },
  
  add: function(sessionEntry) {
    if(!Object.is(sessionEntry, IMVC.Http.SessionEntry)) throw new Error("Only Session Entries may be added to the Session");
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
  },
  
  sessionTimeout: function() {
    var CID = this._CID;
    if(this._userTimeout) clearInterval(this._userTimeout);
    
    destroy(this);
    
    IMVC.Http.Session.sessionTimedOut(CID);
  }
}).statics({
  globalSession: {},
  globalTimeouts: {}, 
  
  sessionAdded: event(),
  sessionEntryAdded: event(),
  sessionEntryRemoved: event(),
  sessionTimedOut: event(),

  
  persistSession: ServerEvents.serverExit.subscribe(function() {
    console.log("should persist the session state here...");
  })
});

