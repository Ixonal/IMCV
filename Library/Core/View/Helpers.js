

define("IMVC.Views.Helpers.Anchor").assign({
  path: null,
  title: null,
  innerHtml: null,
  target: null,


  Anchor: function(path, title, innerHtml, target) {
    this.path = path || "";
    this.title = title || "";
    this.innerHtml = innerHtml || "";
    this.target = target;
  },

  toString: function() {
    var targetText = "",
        titleText = "";
    if(this.target) {
      targetText = " target=\"" + this.target + "\"";
    }
    if(this.title) {
      titleText = " title=\"" + this.title + "\"";
    }
    return "<a href=\"" + this.path + "\"" + titleText + targetText + ">" + this.innerHtml + "</a>";
  }
})

