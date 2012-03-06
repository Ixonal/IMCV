
var fs = require("fs"),
    util = require("util"),

    JS_EXTENSION = "js",
    NODE_EXTENSION = "node";

exports.requireFolder = function(folder) {
  var files = fs.readdirSync(folder),
      stats,
      index,
      fileParts,
      isJsFile;

  if(ignoreFolder(folder)) return;

  //just in case there's not an ending / for this folder
  if(folder.lastIndexOf("/") < folder.length - 1) {
    folder += "/";
  }

  for(index in files) {
    stats = fs.lstatSync(files[index]),
    fileParts = files[index].split('.'),
    isJsFile = fileParts[fileParts.length - 1].toLowerCase() === JS_EXTENSION ||
               fileParts[fileParts.length - 1].toLowerCase() === NODE_EXTENSION;

    if(stats.isFile() && isJsFile) {
      require(folder + files[index]);
    }
  }
}

exports.requireFolderRecursive = function(folder) {
  var files = fs.readdirSync(folder),
      file,
      stats,
      index,
      fileParts,
      fileName,
      isJsFile;

  //just in case there's not an ending / for this folder
  if(folder.lastIndexOf("/") < folder.length - 1) {
    folder += "/";
  }

  for(index in files) {
    file = folder + files[index];
    stats = fs.lstatSync(file);

    if(stats.isDirectory() && !ignoreFolder(file)) {
      exports.requireFolderRecursive(file);
    } else if(stats.isFile()) {
      fileParts = file.split(".");
      isJsFile = (fileParts[fileParts.length - 1].toLowerCase() === JS_EXTENSION) ||
                 (fileParts[fileParts.length - 1].toLowerCase() === NODE_EXTENSION);

      if(isJsFile) {
        fileName = file.split("/");
        fileName = fileName[fileName.length - 1];
        require(file);
      }
    }
  }
}

function ignoreFolder(folder) {
  var currentFolder,
      index;

  for(index in config.app.ignore) {
    currentFolder = constants.AppRoot + config.app.ignore[index];
    if(folder == currentFolder) return true;
  }

  return false;
}

exports.loadConfig = function() {
  var input = fs.readFileSync(global.constants.AppRoot + "/Config/Application.config"),
      inputString = input.toString(),
      inputLines,
      currentLine,
      index;

  //get rid of any returns
  inputString = inputString.replace(/(\r)+/gim, "");

  //get rid of extra spaces
  //inputString = inputString.replace(/[ ]+/gim, " ");

  //get lines
  inputLines = inputString.split("\n");

  //cut out any empty lines
  for(index in inputLines) {
    if(inputLines[index] === "") {
      inputLines.splice(index, 1);
    }
  }

  //checking every line
  for(index in inputLines) {
    //ignore comments
    if(inputLines[index][0] !== '#') {
      currentLine = inputLines[index].split("=");

      //should only be a left hand side and a right hand side
      if(currentLine.length != 2) continue;

      resolveConfigProperty(currentLine[0], currentLine[1]);
    }
  }
}

function resolveConfigProperty(propertyString, propertyValue) {
  var base = COM.ClassObject.obtainNamespace("global.config"),
      trail = propertyString.replace(/[ \t]+/gim, "").split("."),
      index;

  //follow the trail
  for(index = 0; index < trail.length - 1; index++) {
    //console.log(base[trail])
    base[trail[index]] = base[trail[index]] || {};
    base = base[trail[index]];
  }

  if(propertyValue != null && propertyValue != undefined) {
    base[trail[index]] = propertyValue.replace(/[ \t]+/, "");
  }
}

exports.determineMimeTypeFromExtension = function(file) {
  if(typeof(file) !== "string") {
    throw new Error("The file must be specified as a string");
  }
  
  var extension = file.substring(file.lastIndexOf(".") + 1).toLowerCase();
  
  switch(extension) {
    //application extensions
    case "a":
    case "bin":
    case "dump":
    case "exe":
    case "lzh":
    case "lzx":
    case "o":
    case "psd":
    case "saveme":
    case "uu":
    case "zoo":
      return "application/octet-stream";
    case "bz":
      return "application/x-bzip";
    case "bz2":
      return "application/x-bzip2";
    case "class":
      return "application/java";
    case "csh":
      return "application/x-csh";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "frl":
      return "application/freeloader";
    case "gtar":
      return "application/x-gtar";
    case "gz":
    case "gzip":
      return "application/x-gzip";
    case "hlp":
    case "help":
      return "application/x-helpfile";
    case "imap":
      return "application/x-httpd-imap";
    case "ins":
      return "application/x-internett-signup";
    case "js":
      return "application/x-javascript";
    case "ksh":
      return "application/x-ksh";
    case "latex":
    case "ltx":
      return "application/x-latex";
    case "map":
      return "application/x-navimap";
    case "mm":
    case "mme":
      return "application/base64";
    case "mpt":
    case "mpv":
    case "mpx":
      return "application/x-project";
    case "nvd":
      return "application/x-navidoc";
    case "oda":
      return "application/oda";
    case "pdf":
      return "application/pdf";
    case "pnm":
      return "application/x-portable-anymap";
    case "pot":
    case "ppa":
    case "pps":
    case "ppt":
    case "pwz":
      return "application/vnd.ms-powerpoint";
    case "ps":
      return "applicatino/postscript";
    case "pyc":
      return "application/x-bytecode.python";
    case "sh":
      return "application/x-sh";
    case "spr":
    case "sprite":
      return "application/x-spirte";
    case "ssm":
      return "application/streamingmedia";
    case "step":
    case "stp":
      return "application/step";
    case "svr":
      return "application/x-world";
    case "swf":
      return "application/x-shockwave-flash";
    case "tar":
      return "application/x-tar";
    case "tbk":
      return "application/toolbook";
    case "tgz":
    case "z":
    case "zip":
      return "application/x-compressed";
    case "vrml":
      return "application/x-vrml";
    case "vsd":
    case "vst":
    case "vsw":
      return "application/x-visio";
    case "w60":
      return "application/wordperfect6.0";
    case "w61":
      return "application/wordperfect6.1";
    case "doc":
    case "dot":
    case "w6w":
    case "wiz":
    case "word":
      return "application/msword";
    case "wp":
    case "wp5":
    case "wp6":
    case "wpd":
      return "application/wordperfect";
    case "xaml":
      return "application/xaml+xml";
    case "xap":
      return "application/x-silverlight-app";
    case "xbap":
      return "application/x-ms-xbap";
    case "xl":
    case "xla":
    case "xlb":
    case "xlc":
    case "xld":
    case "xlk":
    case "xll":
    case "xlm":
    case "xls":
    case "xlt":
    case "xlv":
    case "xlw":
      return "application/excel";
      
      
    //image extensions
    case "bmp":
      return "image/bmp";
    case "bm":
      return "image/bmp";
    case "dwg":
      return "image/x-dwg";
    case "fif":
      return "image/fif";
    case "g3":
      return "image/g3fax";
    case "gif":
      return "image/gif";
    case "ico":
      return "image/x-icon";
    case "ief":
    case "iefs":
      return "image/ief";
    case "jfif":
    case "jpe":
    case "jpeg":
    case "jpg":
      return "image/jpeg";
    case "jps":
      return "image/x-jps";
    case "mcf":
      return "image/vasa";
    case "nif":
    case "niff":
      return "image/x-niff";
    case "pbm":
      return "image/x-portable-bitmap";
    case "pct":
      return "image/x-pict";
    case "pcx":
      return "image/x-pcx";
    case "pgm":
      return "image/x-portable-graymap";
    case "pic":
    case "pict":
      return "image/pict";
    case "png":
    case "x-png":
      return "image/png";
    case "ppm":
      return "image/x-portable-pixmap";
    case "qif":
    case "qti":
    case "qtif":
      return "image/x-quicktime";
    case "ras":
    case "rast":
      return "image/cmu-raster";
    case "rgb":
      return "image/x-rgb";
    case "svf":
      return "image/x-dwg";
    case "svg":
      return "image/svg+xml";
    case "tif":
    case "tiff":
      return "image/tiff";
    case "xbm":
      return "image/xbm";
    case "xif":
      return "image/vnd.xiff";
    case "xpm":
      return "image/xpm";
    case "xwd":
      return "image/x-xwd";
      
      
      
    //audio extensions
    case "au":
    case "snd":
      return "audio/basic";
    case "funk":
    case "my":
    case "pfunk":
      return "audio/make";
    case "jam":
      return "audio/x-jam";
    case "kar":
    case "mid":
    case "midi":
      return "audio/midi";
    case "la":
    case "lha":
      return "audio/x-nspaudio";
    case "lam":
      return "audio/x-liveaudio";
    case "m2a":
    case "mp2":
    case "mpa":
    case "mpga":
      return "audio/mpeg";
    case "m3u":
      return "audio/x-mpegurl";
    case "mp3":
      return "audio/mpeg3";
    case "mp4":
      return "audio/mp4";
    case "ogg":
      return "audio/ogg";
    case "ra":
    case "ram":
    case "rm":
    case "rmm":
    case "rmp":
      return "audio/x-pn-realaudio";
    case "rpm":
      return "audio/x-pn-realaudio-plugin";
    case "s3m":
      return "audio/s3m";
    case "sid":
      return "audio/x-psid";
    case "voc":
      return "audio/voc";
    case "wav":
      return "audio/wav";
    case "xm":
      return "audio/xm";
    
      
    //video extensions
    case "avi":
      return "video/avi";
    case "fli":
      return "video/fli";
    case "fla":
    case "flv":
      return "video/x-flv";
    case "m1v":
    case "m2v":
    case "mpe":
    case "mpeg":
    case "mpg":
      return "video/mpeg";
    case "mjpg":
      return "video/x-motion-jpeg";
    case "mkv":
      return "video/x-matroska";
    case "mov":
    case "moov":
    case "qt":
      return "video/quicktime";
    case "mv":
      return "video/x-sgi-movie";
    case "ogm":
      return "video/ogg";
    case "qtc":
      return "video/x-qtc";
    case "rv":
      return "video/vnd.rn-realvideo";
    case "vdo":
      return "video/vdo";
    case "viv":
    case "vivo":
      return "video/vivo";
    case "wmv":
      return "video/x-ms-wmv";
      
      
      
    //other extensions
    case "css":
      return "text/css";
    case "htm":
    case "html":
    case "shtm":
    case "shtml":
      return "text/html";
    case "json":
      return "text/json";
    case "mht":
    case "mhtml":
    case "mime":
      return "message/rfc822";
    case "rt":
    case "rtf":
    case "rtx":
      return "text/richtext";
    case "sgm":
    case "sgml":
      return "text/sgml";
    case "spc":
      return "text/x-speech";
    case "uni":
    case "unis":
      return "text/uri-list";
    case "wmf":
      return "windows/metafile";
    case "xhtm":
    case "xhtml":
      return "application/xhtml+xml";
    case "xml":
      return "text/xml";
      
  }
  
  return "text/plain";
}

