

define("IMVC.Views.Helpers.Anchor").assign({
  path: null,
  innerHtml: null,
  target: null,


  Anchor: function(path, innerHtml, target) {
    this.path = path;
    this.innerHtml = innerHtml;
    this.target = target;
  },

  toString: function() {
    var targetText = "";
    if(this.target) {
      targetText = " target=\"" + this.target + "\"";
    }
    return "<a href=\"" + this.path + "\"" + targetText + ">" + this.innerHtml + "</a>";
  }
})

