/*
The SubClassManager is a tool with which to make Javascript behave in a 
manor more similar to a class-based language. Multiple inheritance, polymorphism, 
and namespacing are supported, in addition to type based function overloading,
abstract classes and functions, and events.

Copyright (C) 2011-2012 by Benjamin McGregor

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

//set up options if they weren't previously defined
//and global context
var COMOptions = COMOptions || {};


//normalizing all known global objects into "global"
if(!global) {
  var global;
}

if(typeof(GLOBAL) !== "undefined") {
  global = GLOBAL;
} else if(typeof(window) !== "undefined") {
  global = window;
} else if(typeof(COMOptions.global) !== "undefined") {
  global = COMOptions.global;
}

global.global = global;

(function(global) {
  
  //all types will be of type Type
  function Type() {  }
  Type.getType = Type.prototype.getType = function() { return Type; }
  Type.getClassName = Type.prototype.getClassName = function() { return "Type"; }
  Type.getClassPath = Type.prototype.getClassPath = function() { return "Type"; }
  global.Type = Type;
  
  
  //Namespace type
  //mainly just for readability
  function Namespace(name) {
    this["__Namespace__"] = name;
  };
  
  Namespace.getType = function() { return Type; }
  Namespace.prototype.getType = function() { return Namespace; }
  
  //set up the Class Object Manager namespace
  global["COM"] = global["COM"] || new Namespace("COM");
  
  //set up the Sub-Class Manager namespace
  //global["COM"]["SCM"] = global["COM"]["SCM"] || new Namespace("SCM");
  
  //creating reference to Namespace in COM namespace
  //COM.Namespace = Namespace;
  
  
  //the SubClassManager handles all inheritance and polymorphism concerns
  //contains a list of inheritance trees and list of all classes involved
  function SubClassManager() {
  //COM.SCM.SubClassManager = function() {
    return this.init();
  };
  
  SubClassManager.prototype = {
    trees: null,
    nodes: null,
  
  
    //initialize the manager (constructor)
    init: function() {
      this.trees = [];
      this.nodes = [];
  
      return this;
    },
  
  
    //adds a class that needs to be subclassed to a tree
    addSubClass: function(subClass, superClass) {
      var _this = this,                                           //smaller after minification
          superClassNode = new SubClassTreeNode(superClass),  //a new node for a given super class
          subClassNode = new SubClassTreeNode(subClass),      //a new node for a given sub class
          newTree,                                                //a new subClassTree if needed
          index,                                                  //index into an array
          currentTree,                                            //the subClassTree currently being examined
          superNode,                                              //an existing node for a given super class
          subNode,                                                //an existing node for a given sub class
          isFound = false;                                        //whether or not a given link is found
  
  //    console.log("-------------------------------------------------");
  //    console.log("setting " + subClass.name + " to be a subclass of " + superClass.name);
  
      //checking each tree for existance of given nodes
      for(index in _this.trees) {
        currentTree = _this.trees[index];
        superNode = currentTree.hasNode(superClassNode);
        subNode = currentTree.hasNode(subClassNode);
  
  
        if(superNode !== null) {     //super class node exists somewhere in a tree, add subclassing there
          if(subNode !== null) {     //subclass already exists as well, just link to it
  //          console.log("both exist, linking");
            superNode.linkSub(subNode);
            subNode.linkSuper(superNode);
            isFound = true;
          } else {                   //super class exists, but sub class doesn't
  //          console.log(superClass.name + " exists, linking subclass to it");
            superNode.linkSub(subClassNode);
            subClassNode.linkSuper(superNode);
            _this.nodes.push(subClassNode);
            isFound = true;
          }
        }else if(subNode !== null) { //super class is not there, but sub class is
          if(superNode === null) {   // <----------------- yeah, what I just said
  //          console.log(subClass.name + "exists, linking superclass to it");
            subNode.linkSuper(superClassNode);
            superClassNode.linkSub(subNode);
            _this.nodes.push(superClassNode);
            isFound = true;
          } else {                   //the node was not found at all, mark the need to create a new tree
  //          console.log("neither class found in tree " + index);
            isFound = false;
          }
        }
      }
  
  
      //if we've done what we came to do, leave
      if(isFound && _this.trees.length > 0) return;
  
      //wasn't in any current tree, so adding a new one
  //    console.log("neither class found in either tree, constructing new tree");
      newTree = new SubClassTree(superClassNode);
      newTree.manager = _this;
      superClassNode.linkSub(subClassNode);
      subClassNode.linkSuper(superClassNode);
      _this.nodes.splice(0, 0, superClassNode, subClassNode);
      _this.trees.splice(_this.trees.length, 0, newTree);
    },
  
  
    //deletes all related structures and re-initializes the manager
    clean: function() {
      var index;
  
      //removing all links to all nodes
      for(index in this.nodes) {
        delete this.nodes[index];
      }
  
      //destoy all trees
      for(index in this.trees) {
        this.trees[index].destroy();
      }
  
      //remove references to node and tree lists
      delete this.nodes;
      delete this.trees;
  
      //re-initialize
      return this.init();
    },
  
  
    //starts the sub classing routine on each tree
    initiateSubClassing: function() {
      var index;
  
      for(index in this.trees) {
        this.trees[index].initiateSubClassing(this.trees[index].root);
      }
    }
  };
  
  
  //tree to keep sub classing in order
  function SubClassTree(rootNode) {
  //COM.SCM.SubClassTree = function(rootNode) {
    this.root = rootNode;
  
    return this;
  };
  
  
  SubClassTree.prototype = {
    root: null,        //root node of this tree
    manager: null,     //link back to the subClassManager
  
    //destructor for this tree
    destroy: function() {
      //errm, will add later... (for now gc should still happen alright
    },
  
    //inserts a node that is listed as a sub class of another class
    insertSubNode: function(newNode, targetNode) {
      targetNode.subClasses.push(newNode);
    },
  
    //inserts a node that is listed as a super class of another node
    insertSuperNode: function(newNode, targetNode) {
      targetNode.superClasses.push(newNode);
    },
  
    //checks to see if this tree has a given node, starting at the root
    hasNode: function(givenNode) {
      //definitely doesn't have it if the root is null
      if(this.root === null) return null;
  
      //find the node, starting from the root
      var returnVal = this.findNode(givenNode, this.root);
      this.root.searched = false;
  
      return returnVal;
    },
  
    //checks to see if this tree has a given node, starting at a given node
    findNode: function(searchNode, currentNode) {
      var index,     //index into an array
          returnVal; //the value to be returned
  
      //these ARE the droids you're looking for
      if(searchNode.equals(currentNode)) {
        return currentNode;
      }
  
      //already looked here, move along
      if(currentNode.searched === true) {
        return null;
      }
  
      //note that we have searched here
      currentNode.searched = true;
  
      //check to see if the requested node is any of this node's sub classes
      for(index in currentNode.subClasses) {
        returnVal = this.findNode(searchNode, currentNode.subClasses[index]);
        if(returnVal !== null) {
          currentNode.searched = false;
          return returnVal;
        }
      }
  
      //check to see if the requested node is any of this node's super classes
      for(index in currentNode.superClasses) {
        returnVal = this.findNode(searchNode, currentNode.superClasses[index]);
        if(returnVal !== null) {
          currentNode.searched = false;
          return returnVal;
        }
      }
  
      //we have no longer searched this node
      currentNode.searched = false;
  
      //didn't find it, send back null
      return null;
    },
  
    //traverses this tree,
    //starting from a given node (usually root),
    //subclassing where neccessary
    initiateSubClassing: function(currentNode) {
      var index,      //index into an array
          superNode,  //the current super node
          subNode;    //the current sub node
  
      //can't traverse a null node
      if(currentNode === null) return;
  
      //mark this node as seen
      currentNode.searched = true;
  
      //make sure all super classes are set up first
      if(!currentNode.checkSuperReady()) {
        for(index in currentNode.superClasses) {
          superNode = currentNode.superClasses[index];
          this.initiateSubClassing(superNode);
        }
        currentNode.ready = true;
      }
  
      //actually initiate sub classing on this node
      for(index in currentNode.superClasses) {
        superNode = currentNode.superClasses[index];
        this.subClass(currentNode.getClass(), superNode.getClass());
      }
  
      //start the process on sub classes
      for(index in currentNode.subClasses) {
        subNode = currentNode.subClasses[index];
        if(!subNode.searched) {
          this.initiateSubClassing(subNode);
        }
      }
    },
  
  
    //sub classes by copying prototype values
    subClass: function(subClass, superClass) {
      var prototype;  //the prototype of a given class
  
      //get a copy of the original prototype
      prototype = SubClassTree.extend({}, subClass.prototype);
  
      //copy the prototype of the super class into this class's prototype (inheritance section)
      SubClassTree.extend(subClass.prototype, superClass.prototype);
  
      //copy any overrides specific to this class (polymorphism section)
      SubClassTree.extend(subClass.prototype, prototype);
      
      //do the same with static values
      var statics;
      
      statics = SubClassTree.extend({}, subClass);
      SubClassTree.extend(subClass, superClass);
      SubClassTree.extend(subClass, statics);
      
      //adding a 'base' object
      if(!subClass.__instanceBase) {
        if(Object.defineProperty) {
          Object.defineProperty(subClass, "__instanceBase", {
            value: {},
            writable: false,
            enumerable: false,
            configurable: false
          });
        } else {
          subClass.__instanceBase = {}
        }
      }
      
      if(!subClass.__staticBase) {
        if(Object.defineProperty) {
          Object.defineProperty(subClass, "__staticBase", {
            value: {},
            writable: false,
            enumerable: false,
            configurable: false
          });
        } else {
          subClass.__staticBase = {}
        }
      }
      
      SubClassTree.extend(subClass.__instanceBase, superClass.prototype);
      SubClassTree.extend(subClass.__staticBase, superClass);
      delete subClass.__staticBase.prototype;
      delete subClass.__staticBase.constructor;
//      delete subClass.__instanceBase[superClass.getClassName()];
//      delete subClass.__instanceBase["_" + superClass.getClassName()];
    }
  };
  
  //static function used to add all the elements from one array (or hash) to another
  SubClassTree.extend = function() {
    var extendee = arguments[0],  //the array to be extended
        index,                    //index into an array
        extender,                 //the current array that will extend
                                  //  the elements of the extendee
        key;                      //the current key
  
    //check throught the arguments for valid extenders
    for(index in arguments) {
      if(arguments[index] !== extendee &&
         (typeof(arguments[index]) === "object" || 
          typeof(arguments[index]) === "function")) {
        extender = arguments[index];
  
        //traverse the extender and add the keys/values to the extendee
        for(key in extender) {
          extendee[key] = extender[key];
        }
      }
    }
  
    //returns the array that has been extended
    return extendee;
  }
  
  //an individual node of the subclass tree
  function SubClassTreeNode(givenClass) {
  //COM.SCM.SubClassTreeNode = function(givenClass) {
    return this.init(givenClass);
  }
  
  SubClassTreeNode.prototype = {
    givenClass: null,    //this particular class
    subClasses: null,    //all classes that inherit this class
    superClasses: null,  //all classes that this class inherits from
    ready: false,        //whether or not this class has finished its inheritance
    searched: false,     //whether or not this node has been searched
  
    //initializes the node (constructor)
    init: function(givenClass) {
      this.givenClass = givenClass;
      this.subClasses = [];
      this.superClasses = [];
  
      return this;
    },
  
  
    //checks to see if one node is equal to another
    equals: function(node) {
      return this.givenClass === node.givenClass;
    },
  
    //links another node to this one as a superclass
    linkSuper: function(superClassNode) {
      this.superClasses.push(superClassNode);
    },
  
    //links another node to this one as a subclass
    linkSub: function(subClassNode) {
      this.subClasses.push(subClassNode);
    },
  
    //checks to see if the super classes are ready to be sub classed
    checkSuperReady: function() {
      var index,           //index into an array
          isReady = true;  //whether or not this node is ready
  
      //check to see if each super class is ready
      for(index in this.superClasses) {
        if(!this.superClasses[index].ready) {
          isReady = false;
          break;
        }
      }
  
      //set this node's ready state
      this.ready = isReady;
  
      //return this node's ready state
      return isReady;
    },
  
    //returns the class contained by this node
    getClass: function() {
      return this.givenClass;
    }
  }
  
  //only one manager is needed
  var SUB_CLASS_MANAGER = new SubClassManager();
  
  
  //created for readability
  SubClassManager.subClass = function(subClass, superClass) {
    SUB_CLASS_MANAGER.addSubClass(subClass, superClass);
  }
  
  
  //created for readability
  SubClassManager.finalizeSubClass = function() {
    SUB_CLASS_MANAGER.initiateSubClassing();
    SUB_CLASS_MANAGER.clean();
  }
  
  
  //class to handle concerns relating to a class's
  //inheritance hierarchy (doesn't itself have an
  //inheritance hierarchy)
  function ClassHierarchy(classType) {
    return this.ClassHierarchy(classType);
  }
  
  ClassHierarchy.prototype = {
    classType: null,
    className: null,
    classNamespace: null,
    classPath: null,
    hierarchy: null,
  
    ClassHierarchy: function(classType) {
      this.classType = ClassObject.obtainNamespace(classType);
      this.className = classType.getClassName();
      this.classNamespace = classType.getClassNamespace();
      this.classPath = (this.classNamespace.length === 0)?(this.className):(this.classNamespace + "." + this.className);
      this.hierarchy = {};
  
      //every class is inherently an object
      //this.hierarchy["Object"] = Object;
      this.addClass(Object);
      this.addClass(classType);
  
      return this;
    },
    
    getClassName: function() {
      return this.className;
    },
    
    getClassPath: function() {
      return this.classPath;
    },
    
    getClassType: function() {
      return this.hierarchy[this.classPath];
    },
  
    hasClass: function(classObject) {
      if(typeof(classObject) === "string") return this.hasClassName(classObject);
      else                                 return this.hasClassType(classObject);
    },
  
    hasClassName: function(className) {
      var index;
  
      for(index in this.hierarchy) {
        if(index === className) {
          return true;
        }
      }
  
      return false;
    },
  
    hasClassType: function(classType) {
      var index;
  
      for(index in this.hierarchy) {
        if(this.hierarchy[index] === classType) return true;
      }
  
      return false;
    },
  
    addClass: function(classType) {
      var className = classType.getClassName(),
          classNamespace = classType.getClassNamespace(),
          classPath = (classNamespace === "")?(className):(classNamespace + "." + className);
  
      //make sure we are working with a COM created object
      if(typeof(classType) !== "function" || !className) {
        throw new Error("A class hierarchy is only valid for objects");
      }
  
      this.hierarchy[classPath] = classType;
      
      return this;
    },
  
    extendHierarchy: function(otherHierarchy) {
      return SubClassTree.extend(this.hierarchy, otherHierarchy.hierarchy);
    },
  
    get: function() {
      return this.hierarchy;
    }
  }
  
  ClassHierarchy.isObject = function(obj) {
    return (typeof(obj) === "object" /*&& obj.constructor === Objec*/);
  }
  
  ClassHierarchy.classIsObject = function(obj) {
    return (typeof(obj) === "function" && obj === Object);
  }
  
  ClassHierarchy.isFunction = function(obj) {
    return (typeof(obj) === "function" && obj.constructor === Function);
  }
  
  ClassHierarchy.classIsFunction = function(obj) {
    return (typeof(obj) === "function" && obj === Function);
  }
  
  ClassHierarchy.isArray = function(obj) {
    return (typeof(obj) === "object" && obj.constructor === Array);
  }
  
  ClassHierarchy.classIsArray = function(obj) {
    return (typeof(obj) === "function" && obj === Array);
  }
  
  ClassHierarchy.isBoolean = function(obj) {
    return (typeof(obj) === "boolean");
  }
  
  ClassHierarchy.classIsBoolean = function(obj) {
    return (typeof(obj) === "function" && obj === Boolean);
  }
  
  ClassHierarchy.isNumber = function(obj) {
    return (typeof(obj) === "number");
  }
  
  ClassHierarchy.classIsNumber = function(obj) {
    return (typeof(obj) === "function" && obj === Number);
  }
  
  ClassHierarchy.isString = function(obj) {
    return (typeof(obj) === "string");
  }
  
  ClassHierarchy.classIsString = function(obj) {
    return (typeof(obj) === "function" && obj === String);
  }
  
  ClassHierarchy.isDate = function(obj) {
    return (typeof(obj) === "object" && obj.constructor === Date);
  }
  
  ClassHierarchy.classIsDate = function(obj) {
    return (typeof(obj) === "function" && obj === Date);
  }
  
  ClassHierarchy.isRegExp = function(obj) {
    return (typeof(obj) === "object" && obj.constructor === RegExp);
  }
  
  ClassHierarchy.classIsRegExp = function(obj) {
    return (typeof(obj) === "function" && obj === RegExp);
  }
  
  ClassHierarchy.isError = function(obj) {
    return (typeof(obj) === "object" && obj.constructor === Error);
  }
  
  ClassHierarchy.classIsError = function(obj) {
    return (typeof(obj) === "function" && obj === Error);
  }
  
  ClassHierarchy.getClassPath = function(classType) {
    var classPath = undefined;
  
  
    if(typeof(classType) == "undefined") return "Undefined";
    if(classType == null) return "Null";
  
    if(classType.getClassPath) {
      classPath = classType.getClassPath();
    } else if(classType.prototype && classType.prototype.getClassPath) {
      classPath = classType.prototype.getClassPath();
    } else {
      if(ClassHierarchy.classIsArray(classType) ||
         ClassHierarchy.isArray(classType)) {
        classPath = Array.getClassPath();
      } else if(ClassHierarchy.classIsObject(classType) ||
                ClassHierarchy.isObject(classType)) {
        classPath = Object.getClassPath();
      } else if(ClassHierarchy.isBoolean(classType) ||
                ClassHierarchy.classIsBoolean(classType)) {
        classPath = Boolean.getClassPath();
      } else if(ClassHierarchy.isNumber(classType) ||
                ClassHierarchy.classIsNumber(classType)) {
        classPath = Number.getClassPath();
      } else if(ClassHierarchy.isString(classType) ||
                ClassHierarchy.classIsString(classType)) {
        classPath = String.getClassPath();
      } else if(ClassHierarchy.isDate(classType) ||
                ClassHierarchy.classIsDate(classType)) {
        classPath = Date.getClassPath();
      } else if(ClassHierarchy.isRegExp(classType) ||
                ClassHierarchy.classIsRegExp(classType)) {
        classPath = RegExp.getClassPath();
      } else if(ClassHierarchy.isError(classType) || 
                ClassHierarchy.classIsError(classType)) {
        classPath = Error.getClassPath();
      } else if(ClassHierarchy.isFunction(classType) ||
                ClassHierarchy.classIsFunction(classType)) {
        classPath = Function.getClassPath();
      }
    }
  
    return classPath;
  }
  
  

  ClassHierarchy.getClassNamespace = function(classObj) {
    if(classObj.getNamespace) {
      return classObj.getNamespace();
    } else {
      return "";
    }
  }
  

  //static object containing references to all class hierarchies
  var classHierarchy = {};
  
  
  var instanceBase = function(propertyName) {
    var index, args = [];
    
    if(typeof(propertyName) !== "string") throw new Error("propertyName must be defined.");
    
    for(index = 1; index < arguments.length; index++) {
      args[index - 1] = arguments[index];
    }
    
    if(this.getType().__instanceBase && this.getType().__instanceBase[propertyName]) {
      this.getType().__instanceBase[propertyName].apply(this, args);
    }  else {
      throw new Error("No base property with the given name exists.");
    }
  }
  
  var staticBase = function(propertyName) {
    var index, args = [];
    
    if(typeof(propertyName) !== "string") throw new Error("propertyName must be defined.");
    
    for(index = 1; index < arguments.length; index++) {
      args[index - 1] = arguments[index];
    }
    
    if(this.getType().__staticBase && this.getType().__staticBase[propertyName]) {
      this.getType().__staticBase[propertyName].apply(this, args);
    }  else {
      throw new Error("No base property with the given name exists.");
    }
  }
  
  
  

  //created to allow for a more class-like interface
  function ClassObject(classNamespace, className, isAbstract) {
    if(typeof(className) !== "string") {
      throw new Error("ClassObject needs a string class name");
    }
  
    var _this = this,
        context = ClassObject.obtainNamespace(classNamespace);
  
    _this.classNamespace = classNamespace;
    _this.className = className;
    _this.classPath = (classNamespace === "")?(className):(classNamespace + "." + className);
    _this.classHierarchy = {};
  
    if(isAbstract) {
      //cannot create an instance of an abstract class
      //so an error is thrown indicating such
      _this.classObj = context[className] = function() {
        throw new Error("Abstract classes cannot be instantiated.");
      }
    } else {
      //the actual javascript constructor will just call the
      //class's constructor with all the same arguments
      _this.classObj = context[className] = function() {
        var _this = this,
            _that = _this[className],
            args = [],
            index;
  
        for(index in _this) {
          if(typeof(_this[index]) == "function") {
            this[index].parentObject = _this;
          }
        }
  
        for(index in arguments) {
          args.push(arguments[index]);
        }
  
        return _that.apply(_this, args);
      }
    }
  
    //assign default constructor and destructor
    _this.classObj.prototype[className] = _this.defaultConstructor;
    _this.classObj.prototype["_" + className] = _this.defaultDestructor;
  


    //class related utility functions
    var getType = function() { return _this.classObj; },
        getTypeClass = function() { return Type; },
        getClassName = function() { return _this.className; },
        getClassNamespace = function() { return _this.classNamespace; },
        getClassPath = function() { return _this.classPath; };
        
    
    
    var getConstructors = function() {
      var constructors = {}, index, functionName;
      
      for(index in _this.classHierarchy.hierarchy) {
        functionName = _this.classHierarchy.hierarchy[index].getClassName();
        if(_this.classObj.prototype[functionName]) {
          constructors[functionName] = _this.classObj.prototype[functionName];
        }
      }
      
      return constructors;
    }
    
    var getDestructors = function() {
      var destructors = {}, index, functionName;
      
      for(index in _this.classHierarchy.hierarchy) {
        functionName = "_" + _this.classHierarchy.hierarchy[index].getClassName();
        if(_this.classObj.prototype[functionName]) {
          destructors[functionName] = _this.classObj.prototype[functionName];
        }
      }
      
      return destructors;
    }
    
    var getMethods = function() {
      var constructors = _this.classObj.getConstructors(),
          destructors = _this.classObj.getDestructors(),
          index1, index2,
          element,
          isValid,
          functions = {};
      
      for(index1 in _this.classObj.prototype) {
        element = _this.classObj.prototype[index1];
        if(typeof(element) === "function") {
          isValid = true;
          for(index2 in constructors) {
            if(element === constructors[index2]) {
              isValid = false;
              break;
            }
          }
          for(index2 in destructors) {
            if(element === destructors[index2]) {
              isValid = false;
              break;
            }
          }
          if(isValid) {
            functions[index1] = element;
          }
        }
      }
      return functions;
    }
    
    var getInheritingTypes = function() {
      var hierarchyIndex,
          currentHierarchy,
          inheritingTypes = {};
      
      for(hierarchyIndex in classHierarchy) {
        if(hierarchyIndex != _this.classObj.getClassPath()) {
          currentHierarchy = classHierarchy[hierarchyIndex];
          if(currentHierarchy.hasClass(_this.classObj)) {
            inheritingTypes[currentHierarchy.getClassPath()] = currentHierarchy.getClassType();
          }
        }
      }
      
      return inheritingTypes;
    }
    
    if(Object.defineProperty) {
      
      Object.defineProperty(_this.classObj.prototype, "base", {
        value: instanceBase,
        writable: false,
        enumerable: false,
        configurable: false
      });
      Object.defineProperty(_this.classObj, "base", {
        value: staticBase,
        writable: false,
        enumerable: false,
        configurable: false
      });
      Object.defineProperty(_this.classObj.prototype, "getType", {
        value: getType,
        writable: false,
        enumerable: false,
        configurable: false
      });
      Object.defineProperty(_this.classObj, "getType", {
        value: getTypeClass,
        writable: false,
        enumerable: false,
        configurable: false
      });
      Object.defineProperty(_this.classObj, "getClassName", {
        value: getClassName,
        writable: false,
        enumerable: false,
        configurable: false
      });
      Object.defineProperty(_this.classObj, "getClassNamespace", {
        value: getClassNamespace,
        writable: false,
        enumerable: false,
        configurable: false
      });
      Object.defineProperty(_this.classObj, "getClassPath", {
        value: getClassPath,
        writable: false,
        enumerable: false,
        configurable: false
      });
      Object.defineProperty(_this.classObj, "is", {
        value: ClassObject.is,
        writable: false,
        enumerable: false,
        configurable: false
      });
      Object.defineProperty(_this.classObj.prototype, "is", {
        value: ClassObject.is,
        writable: false,
        enumerable: false,
        configurable: false
      });
      Object.defineProperty(_this.classObj, "getConstructors", {
        value: getConstructors,
        writable: false,
        enumerable: false,
        configurable: false
      });
      Object.defineProperty(_this.classObj, "getDestructors", {
        value: getDestructors,
        writable: false,
        enumerable: false,
        configurable: false
      });
      Object.defineProperty(_this.classObj, "getMethods", {
        value: getMethods,
        writable: false,
        enumerable: false,
        configurable: false
      });
      Object.defineProperty(_this.classObj, "getInheritingTypes", {
        value: getInheritingTypes,
        writable: false,
        enumerable: false,
        configurable: false
      });
      
    } else {
    
      _this.classObj.base = staticBase;
      _this.classObj.prototype.base = instanceBase;
      _this.classObj.prototype.getType = getType;
      _this.classObj.getType = getTypeClass;
      _this.classObj.getClassName = getClassName;
      _this.classObj.getClassNamespace = getClassNamespace
      _this.classObj.getClassPath = getClassPath;
      _this.classObj.is = _this.classObj.prototype.is = ClassObject.is;
      _this.classObj.getConstructors = getConstructors;
      _this.classObj.getDestructors = getDestructors;
      _this.classObj.getMethods = getMethods;
      _this.classObj.getInheritingTypes = getInheritingTypes;
    }
    

    _this.classHierarchy = classHierarchy[_this.classPath] = new ClassHierarchy(_this.classObj);
    
  
    return _this;
  }
  
  
  ClassObject.prototype = {
    classObj: null,       //the actual object for this class
    className: "",        //the name of this class
    classPath: "",
    classHierarchy: null, //
    classNamespace: "",
  
    //the default constructor and destructor take nothing and return nothing
    defaultConstructor: function() {},
    defaultDestructor: function() {},
  
    //provides for inheritance
    extend: function() {
      var currentArg, //the argument currently being examined
          currentClassPath,
          index;      //index into an array
  
  
      //inherit from each given class
      for(index in arguments) {
        currentArg = arguments[index];
        currentArg = ClassObject.obtainNamespace(currentArg);
        SubClassManager.subClass(this.classObj, currentArg);
        

        currentClassPath = (currentArg.getClassNamespace().length === 0)?(currentArg.getClassName()):(currentArg.getClassNamespace() + "." + currentArg.getClassName())
  
  
        this.classHierarchy.extendHierarchy(classHierarchy[currentClassPath]);
      }
  
      //returns the class object to allow chaining
      return this;
    },
  
    //assigns prototype values to this class
    assign: function(proto) {
      //the prototype must be an object
      if(typeof(proto) !== "object") return null;
  
      //add the new prototype information to the old
      SubClassTree.extend(this.classObj.prototype, proto);
  
  
      //returns the class object to allow chaining
      return this;
    },
  
    //puts this class in a given namespace
    namespace: function(namespace) {
      var classNamespace = ClassObject.obtainNamespace(this.classNamespace),
          context = ClassObject.obtainNamespace(namespace);             //the object context
                                                                        //of the given namespace
  
      //add the class to this namespace
      context[this.className] = this.classObj;
  
      //remove the class from the global namespace
      delete classNamespace[this.className];
  
      this.classNamespace = namespace;
  
      //returns the class object to allow chaining
      return this;
    },
  
    statics: function(staticFields) {
      var index;
  
      if(typeof(staticFields) !== "object") {
        throw new Error("Statics requires an Object, got " + staticFields);
      }
  
      for(index in staticFields) {
        this.classObj[index] = this.classObj[index] || staticFields[index];
      }
      
      return this;
    }
  }
  
  ClassObject.getType = function(classObj) {
    if(classObj.getType) {
      return classObj.getType();
    } else {
      return classObj.constructor;
    }
  }
  
  
  
  //abstract functions are regular functions that just throw an error when run
  ClassObject.__abstractFunction__ = function() {
    throw new Error("Abstract functions cannot be run.");
  }
  
  //setting something as an abstract function sets it as the generic abstract function
  ClassObject.abstractFunction = function() {
    return ClassObject.__abstractFunction__;
  }
  
  


  //namespace support (beta)
  ClassObject.obtainNamespace = function(namespace) {
    var nsParts,
        context,
        index,
        contextList,
        contextListIndex;
  
    //getClassName();
  
    //if they give us an object, that must
    //be what we were looking for
    if(namespace.constructor === Object || namespace.constructor === Function) return namespace;
  
    //if we get anything but a string at this point,
    //there's really nothing to do with it
    if(typeof(namespace) !== "string") {
      throw new Error("The input parameter must be an Object or String.");
    }
  
    if(namespace.length == 0) return global;
  
    //split the namespace into parts and initialize 
    //the context to the global namespace
    nsParts = namespace.split(".");
    context = global;
  
    //set up the namespace path
    for(index = 0; index < nsParts.length; index++) {
      if(nsParts[index] === "*") {  //grabbing everything in a namespace
        contextList = {};
          for(contextListIndex in context) {
            contextList[contextListIndex] = context[contextListIndex];
          }
  
          contextList.__NamespaceList__ = true;
  
          return contextList;
      } else {                      //handling a single thing in a namespace
        context[nsParts[index]] = context[nsParts[index]] || new Namespace(nsParts[index]);
        context = context[nsParts[index]];
      }
    }
  
    return context;
  }
  
  

  var defaultTypes = {
    Object: Object, 
    Array: Array, 
    String: String, 
    Number: Number, 
    RegExp: RegExp, 
    Error: Error, 
    Boolean: Boolean, 
    Date: Date, 
    Function: Function,
    Type: Type
  },
  index;
  
  var objGetType = function(obj) {
    if(arguments.length > 0 && obj === undefined) return undefined;
    if(arguments.length > 0 && obj === null) return null;
    if(arguments.length > 0) return obj.getType();
    return Type.getType();
  }
  
  if(Object.defineProperty) {
    Object.defineProperty(Object, "getType", {
      value: objGetType,
      writable: false,
      enumerable: false,
      configurable: false
    });
    
    Object.defineProperty(Object.prototype, "getType", {
      value: function() { return this.constructor; },
      writable: false,
      enumerable: false,
      configurable: false
    });
  } else {
    Object.getType = objGetType;
    Object.prototype.getType = function() { return this.constructor; }
  }
  
  for(index in defaultTypes) {
    (function() {
      var typeIndex = index;
      if(defaultTypes[typeIndex] !== Object) defaultTypes[typeIndex].getType = Type.getType;
      defaultTypes[typeIndex].getClassName = function() { return typeIndex; }
      defaultTypes[typeIndex].getClassNamespace = function() { return ""; }
      defaultTypes[typeIndex].getClassPath = function() { return typeIndex; }
      classHierarchy[index] = new ClassHierarchy(defaultTypes[typeIndex]);
    })();
  }
  
  //support for function overloading
  ClassObject.overload = function() {
    var numEntries = arguments.length, //number of entries
        index,                         //index into an array
        func,                          //the current function
        numArgs,                       //the number or arguments for the function
        overloadFunction;              //the function that handles overloading 
                                       //  for this instance
  
    //create the function that will determine which function to run
    overloadFunction = function() {
      var _this = overloadFunction,                             //setting the _this context
          _that = _this[arguments.length + "ArgumentOverload"], //the specific override
                                                                //  to use
          args = [],                                            //arguments to be sent
                                                                //  to the overridden
                                                                //  function
          index;                                                //index into an array
  
      //no override was given for the specified number of arguments
      if(!_that) {
        throw new Error("No override exists for " + arguments.length + " arguments.");
      }
  
      //add the arguments
      for(index in arguments) {
        args[index] = arguments[index];
      }
  
      //run the proper function
      return _that.apply(_that, args);
    }
  
    //add each function given and the number of arguments to this override
    for(index = 0; index < numEntries; index += 2) {
      func = arguments[index];
      numArgs = arguments[index + 1];
      if(typeof(func) === "function" && typeof(numArgs) === "number") {
        overloadFunction[numArgs + "ArgumentOverload"] = func;
      }
    }
  
    //send back the function that determines which function to run
    return overloadFunction;
  }
  
  
  //function overloading with types
  ClassObject.overloadWithTypes = function() {
    var numEntries = arguments.length, //number of entries
        index,                         //index into an array
        index2,                        //another array index
        func,                          //the current function
        types,                         //the number or arguments for the function
//        className,
//        classNamespace,
        overloadIndex,                 //the index into the overload functions
        overloadType,
        overloadFunction;              //the function that handles overloading
                                       //  for this instance
  
    overloadFunction = function() {
      var _this = overloadFunction, //the function that handles overloading
          currentFunction,          //the overload function currently being looked at
          currentTypes,             //the overload types currently being looked at
          currentHierarchy,         //the class hierarchy currently being looked at
          currentParameter,         //the parameter type currently being looked at
          args,                     //arguments to pass to the overload function
          index,                    //index into an array
          argIndex,                 //index into arguments
          errorMessage,             //the error message to display
          currentType,              //the type currently in question
//          className,                //the name of a class
//          classNamespace,           //the namespace of a class
          validOverloadFound;       //whether or not the current arguments are valid
                                    //  for a given overload
  
      //checking all overload functions
      for(index in _this.overloadFunctions) {
        validOverloadFound = true;
        currentFunction = _this.overloadFunctions[index];
        currentTypes = _this.overloadTypes[index];
        
  
        //checking to see if all arguments match for this overload
        if(arguments.length > 0) {
          for(argIndex in arguments) {
            currentType = Object.getType(arguments[argIndex]);
            currentParameter = currentTypes[argIndex];
            
            if(currentType === null || currentType === undefined) {
              //this argument is null or undefined, they count for anything
              
            } else {
              
              if(currentType === Type) {
                //this argument is a Type, make sure it's supposed to be a type
                if(!currentParameter || Object.getType(currentParameter) !== Type) {
                  validOverloadFound = false;
                  break;
                }
              } else {
                //everything else should be an instantiated object
                currentHierarchy = classHierarchy[currentType.getClassPath()];
                if(!currentHierarchy || !currentHierarchy.hasClass(currentParameter)) {
                  validOverloadFound = false;
                  break;
                }
              }
            }              
          }
        } else {
          if(currentTypes.length !== 0) {
            validOverloadFound = false;
          }
        }
  
        //the given types match this overload
        if(validOverloadFound) {
          args = [];
          for(argIndex in arguments) {
            args[argIndex] = arguments[argIndex];
          }

          return currentFunction.apply(this, args);
        }
      }
  
      //we didn't find a valid overload for the given inputs
      if(!validOverloadFound) {
        
        //there is a default overload (IE, takes any arguments)
        currentFunction = _this.overloadFunctions["overload__default_"];
        if(currentFunction) {
          args = [];
          for(argIndex in arguments) {
            args[argIndex] = arguments[argIndex];
            
            return currentFunction.apply(this, args);
          }
        }
        
        errorMessage = "No overload for function(";
        for(index = 0; index < arguments.length; index++) {
          errorMessage += ClassHierarchy.getClassPath(ClassObject.getType(arguments[index]));
          if(index < arguments.length - 1) {
            errorMessage += ", ";
          }
        }
        errorMessage += ")";
        throw new Error(errorMessage);
      }
      return null;
    }
  
    //set up structures to hold the functions and their types
    overloadFunction.overloadTypes = {};
    overloadFunction.overloadFunctions = {};
  
    //iterate through each type/function pair
    for(index = 0; index < numEntries; index += 2) {
      types = arguments[index];
      func = arguments[index + 1];
  
      //construct an index for the overload
      overloadIndex = "overload";
      if(types == null) {
        overloadIndex += "__default_";
      } else {
        for(index2 in types) {
          types[index2] = ClassObject.obtainNamespace(types[index2]);
          
          overloadIndex += ("_" + ClassHierarchy.getClassPath(types[index2]));
          
        }
      }
  
      //assign the function
      overloadFunction.overloadFunctions[overloadIndex] = func;
  
      //create the type array
      overloadType = overloadFunction.overloadTypes[overloadIndex] = [];
  
      for(index2 in types) {
//        className = ClassHierarchy.getClassPath(types[index2]);
//        classNamespace = ClassHierarchy.getClassNamespace(types[index2]);
        
        overloadType[overloadType.length] = types[index2];
        
  //      overloadType[overloadType.length] = COM.ClassObject.classHierarchy[className];
      }
    }
  
    return overloadFunction;
  }
  
  
  ClassObject.is = ClassObject.overloadWithTypes(
    [Type],
    function(otherType) {
      if(this.getType() === Type) {
        if(otherType === Type) return true;
        else {
          return classHierarchy[this.getClassPath()].hasClass(otherType);
        }
      }
      //if(otherType === Type && this.getType() === Type) return true;
      return classHierarchy[this.getType().getClassPath()].hasClass(otherType);
      //return _this.classHierarchy.hasClass(otherType);
    },
      
    [String],
    function(otherObject) {
      otherObject = ClassObject.obtainNamespace(otherObject)
      return this.is(otherObject);
    }
  );
  
  if(Object.defineProperty) {
    Object.defineProperty(Object.prototype, "is", {
      value: ClassObject.is,
      writable: false,
      enumerable: false,
      configurable: false
    });
  } else {
    Object.prototype.is = ClassObject.is;
  }
  
  for(index in defaultTypes) {
    (function() {
      var typeIndex = index;
      if(typeIndex !== "Object") defaultTypes[typeIndex].is = ClassObject.is;
    })();
  }
  
  //Object has a special version of is to handle two parameters
  var objIs = ClassObject.overloadWithTypes(
    [Type],
    function(obj) {
      return ClassObject.is.call(this, obj);
    },
    
    [String],
    function(obj) {
      return ClassObject.is.call(this, obj);
    },
      
    [Object, Object], 
    function(obj1, obj2) {
      if(obj1 === undefined) {
        if(obj2 === undefined) return true;
        else                   return false;
      }
      
      if(obj1 === null) {
        if(obj2 === null) return true;
        else              return false;
      }
      
      if(obj2 === undefined) return false;
      if(obj2 === null) return false;
      
      return obj1.is(obj2);
    }
  );
  
  if(Object.defineProperty) {
    Object.defineProperty(Object, "is", {
      value: objIs,
      writable: false,
      enumerable: false,
      configurable: false
    });
  } else {
    Object.is = objIs; 
  }
  
  //String.prototype.is = ClassObject.is;
  
  
  //support for destruction of classes
  ClassObject.destroy = function(obj) {
    var index; //index in an array
  
    //run this object's destructor
    obj["_" + obj.getType().getClassName()]();
  
    //delete references to everything in this class
    for(index in obj) {
      delete obj[index];
    }
  }
  
  

  //namespace (as opposed to Namespace) grabs references
  //to everything in all given namespaces and loads them
  //into a single hash, which is returned
  function namespace() {
    var namespaceReferences = {},
        namespaceIndex,
        context,
        classIndex;
  
    //go through every namespace given
    for(namespaceIndex in arguments) {
      context = ClassObject.obtainNamespace(arguments[namespaceIndex]);
  
      //grab everything that isn't a namespacce in that namespace and put it in a single variable
      for(classIndex in context) {
        if(!context[classIndex]["__Namespace__"] && classIndex !== "__Namespace__"){
          namespaceReferences[classIndex] = context[classIndex];
        }
      }
    }
  
    return namespaceReferences;
  };
  
  

  
  ClassObject.event = function(context) {
    var eventObj,
        subscribeIndex = 0;
  
    eventObj = function() {
      var index,
          args = [];
  
      for(index in arguments) {
        args[index] = arguments[index];
      }

      for(index in eventObj.subscribedFunctions) {
        if(typeof(eventObj.subscribedFunctions[index]) == "function") {
        //if(event.subscribedFunctions[index].is(Function)) {
          eventObj.subscribedFunctions[index].apply(context || this, args);
        }
      }
    }
  
    context = context || this;
  
    eventObj.subscribedFunctions = {};
  
    eventObj.subscribe = function(name, func) {
      if(typeof(name) === "string" && typeof(func) === "function") {
        eventObj.subscribedFunctions[name] = func;
        return func;
      } else if(typeof(name) === "function") {
        eventObj.subscribedFunctions["__unnamed_function_" + subscribeIndex] = name;
        subscribeIndex++;
        return name;
      } else {
        throw new Error("Cannot subscribe with the given inputs.");
      }
    }
  
    eventObj.unsubscribe = function(name) {
      if(typeof(name) == "string") {
        delete eventObj.subscribedFunctions[name];
      }
    }
  
    return eventObj;
  }
  
  
  //moves the contents of a given namespace to the global namespace
  ClassObject.using = function(namespace) {
    var context,
        index;
  
    //locate the namespace in question
    context = ClassObject.obtainNamespace(namespace)
  
    //Copy everything in that namespace to the global
    //namespace. Overwrite if it already exists
    for(index in context) {
      if(!context[index]["__Namespace__"] && index !== "__Namespace__") {
        global[index] = context[index];
      }
    }
  }
  
  
  //moves the cotents of a given namespace out of the global namespace
  ClassObject.unusing = function(namespace) {
    var context,
        index;
  
    context = ClassObject.obtainNamespace(namespace);
  
    for(index in context) {
      if(!context[index]["__Namespace__"]) {
        delete global[index];
      }
    }
  }
  

  
  //function to create a new class object
  ClassObject.define = function(classDesignation, isAbstract) {
    if(typeof(classDesignation) !== "string") {
      throw new Error("use: define(String classDesignation, Boolean isAbstract)");
    }
  
    var hasNamespace = (classDesignation.lastIndexOf(".") !== -1),
        classNamespace = hasNamespace ? classDesignation.substring(0, classDesignation.lastIndexOf(".")) : "",
        className = hasNamespace ? classDesignation.substring(classDesignation.lastIndexOf(".") + 1, classDesignation.length) : classDesignation,
        context = ClassObject.obtainNamespace(classNamespace),
        newClass;
        
  
    //disallow overwriting a class
    if(hasNamespace) {
      if(context[className]) {
        throw new Error(classDesignation + " is previously defined.");
      }
    } else {
      if(global[className]) {
        throw new Error(className + " is previously defined.");
      }
    }
  
    //determining of the class is abstract
    if(typeof(isAbstract) === "string") {
      isAbstract = isAbstract.toLowerCase()==="abstract"?true:false;
    } else {
      isAbstract = isAbstract?true:false;
    }
  
    //create the new class object
    newClass = new ClassObject(classNamespace, className, isAbstract);
    return newClass;
  }
  
  COM.Namespace = Namespace;
  COM.namespace = namespace;
  COM.obtainNamespace = ClassObject.obtainNamespace;
  COM.extend = SubClassTree.extend;
  COM.using = ClassObject.using;
  COM.unusing = ClassObject.unusing;
  COM.define = ClassObject.define;
  COM.destroy = ClassObject.destroy;
  COM.event = ClassObject.event;
  COM.overload = ClassObject.overload;
  COM.overloadWithTypes = ClassObject.overloadWithTypes;
  COM.abstractFunction = ClassObject.abstractFunction;
  COM.subClass = SubClassManager.subClass;
  COM.finalizeSubClass = SubClassManager.finalizeSubClass;
  
  COM.define("COM.Hash").assign({
    Hash: function(obj) {
      if(obj.constructor !== Object) return;
      
      for(var index in obj) {
        this[index] = obj[index];
      }
    }
  });
  
  if(!COMOptions.compatibility) {
    //moving important functions to the global namespace
    global["namespace"] = COM.namespace;
    global["using"] = COM.using;
    global["unusing"] = COM.unusing;
    global["define"] = COM.define;
    global["destroy"] = COM.destroy;
    
    global["event"] = COM.event;
    
    //choose between two versions of overloading
    if((COMOptions.overloadType = COMOptions.overloadType || "typed") === "typed") {
      global["overload"] = COM.overloadWithTypes
    } else if(COMOptions.overloadType === "untyped") {
      global["overload"] = COM.overload;
    }
    
    global["abstractFunction"] = COM.abstractFunction;
    
    global["finalizeSubClass"] = COM.finalizeSubClass;
    global["subClass"] = COM.subClass;
    
    global["Hash"] = COM.Hash;
    
  }
})(global);
