

define("IMVC.Http.Request").assign({
  nodeRequest: null,

  Request: function(nodeRequest) {
    this.nodeRequest = nodeRequest;
  },

  getMethod: function() {
    return this.nodeRequest.method;
  },

  getUrl: function() {
    return this.nodeRequest.url;
  },

  getHeaders: function() {
    return this.nodeRequest.headers;
  },

  getTrailers: function() {
    return this.nodeRequest.trailers;
  },

  getHttpVersion: function() {
    return this.nodeRequest.httpVersion;
  },

  getConnection: function() {
    return this.nodeRequest.connection;
  },

  pause: function() {
    return this.nodeRequest.pause();
  },

  resume: function() {
    return this.nodeRequest.resume();
  }
})

