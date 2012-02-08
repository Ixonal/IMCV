/*
The SubClassManager is a tool with which to make Javascript behave in a 
manor more similar to a class-based language. Multiple inheritance, polymorphism, 
and namespacing are supported, in addition to partial function overloading,
abstract class, and abstract function support.

Copyright (C) 2011 by Benjamin McGregor

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

if(typeof(COMOptions.global) !== "undefined") {
  global = COMOptions.global;
} else if(typeof(GLOBAL) !== "undefined") {
  global = GLOBAL;
} else if(typeof(window) !== "undefined") {
  global = window;
}

//Namespace type
//mainly just for readability
function Namespace(name) {
  this["__Namespace__"] = name;
}

//set up the Class Object Manager namespace
global["COM"] = global["COM"] || new Namespace("COM");

//set up the Sub-Class Manager namespace
global["COM"]["SCM"] = global["COM"]["SCM"] || new Namespace("SCM");

//creating reference to Namespace in COM namespace
COM.Namespace = Namespace;

//namespace (as opposed to Namespace) grabs references
//to everything in all given namespaces and loads them
//into a single hash, which is returned
COM.namespace = function() {
  var namespaceReferences = {},
      namespaceIndex,
      context,
      classIndex;

  //go through every namespace given
  for(namespaceIndex in arguments) {
    context = COM.ClassObject.obtainNamespace(arguments[namespaceIndex]);

    //grab everything that isn't a namespacce in that namespace and put it in a single variable
    for(classIndex in context) {
      if(!context[classIndex]["__Namespace__"] && classIndex !== "__Namespace__"){
        namespaceReferences[classIndex] = context[classIndex];
      }
    }
  }

  return namespaceReferences;
}

//the SubClassManager handles all inheritance and polymorphism concerns
//contains a list of inheritance trees and list of all classes involved
COM.SCM.SubClassManager = function() {
  return this.init();
}

COM.SCM.SubClassManager.prototype = {
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
        superClassNode = new COM.SCM.SubClassTreeNode(superClass),  //a new node for a given super class
        subClassNode = new COM.SCM.SubClassTreeNode(subClass),      //a new node for a given sub class
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
    newTree = new COM.SCM.SubClassTree(superClassNode);
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
}


//tree to keep sub classing in order
COM.SCM.SubClassTree = function(rootNode) {
  this.root = rootNode;

  return this;
}


COM.SCM.SubClassTree.prototype = {
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
    //for some reason, things sometimes went into subClass.prototype.prototype... kinda weird
    if(subClass.prototype.prototype) {
      prototype = COM.SCM.SubClassTree.extend({}, subClass.prototype.prototype);
    } else {
      prototype = COM.SCM.SubClassTree.extend({}, subClass.prototype);
    }

    //copy the prototype of the super class into this class's prototype (inheritance section)
    if(superClass.prototype.prototype) {
      COM.SCM.SubClassTree.extend(subClass.prototype, superClass.prototype.prototype);
    } else {
      COM.SCM.SubClassTree.extend(subClass.prototype, superClass.prototype);
    }

    //copy any overrides specific to this class (polymorphism section)
    COM.SCM.SubClassTree.extend(subClass.prototype, prototype);
  }
}

//static function used to add all the elements from one array (or hash) to another
COM.SCM.SubClassTree.extend = function() {
  var extendee = arguments[0],  //the array to be extended
      index,                    //index into an array
      extender,                 //the current array that will extend
                                //  the elements of the extendee
      key;                      //the current key

  //check throught the arguments for valid extenders
  for(index in arguments) {
    if(arguments[index] !== extendee &&
       typeof(arguments[index]) === "object") {
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
COM.SCM.SubClassTreeNode = function(givenClass) {
  return this.init(givenClass);
}

COM.SCM.SubClassTreeNode.prototype = {
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
COM.SCM.SUB_CLASS_MANAGER = new COM.SCM.SubClassManager();


//created for readability
COM.SCM.SubClassManager.subClass = function(subClass, superClass) {
  COM.SCM.SUB_CLASS_MANAGER.addSubClass(subClass, superClass);
}


//created for readability
COM.SCM.SubClassManager.finalizeSubClass = function() {
  COM.SCM.SUB_CLASS_MANAGER.initiateSubClassing();
  COM.SCM.SUB_CLASS_MANAGER.clean();
}

//created to allow for a more class-like interface
COM.ClassObject = function(classNamespace, className, isAbstract) {
  if(typeof(className) !== "string") {
    throw new Error("ClassObject needs a string class name");
  }

  var _this = this,
      context = COM.ClassObject.obtainNamespace(classNamespace);

  _this.classNamespace = classNamespace;
  _this.className = className;
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


//old method used eval to handle variable numbers of arguments
//      var statement = "this[this.__className__](",
//          index;
//
//      //gotta grab all the arguments to send
//      for(index = 0; index < arguments.length; index++) {
//        statement += "arguments[" + index + "]";
//        if(index + 1 < arguments.length) statement += ", ";
//      }
//
//      statement += ")";
//
//      //console.log(statement);
//      //eval("console.log(this)");
//
//      //have to eval this to actually get the arguments to work right
//      return eval(statement);
    }
  }

  //assign default constructor and destructor
  _this.classObj.prototype[className] = _this.defaultConstructor;
  _this.classObj.prototype["_" + className] = _this.defaultDestructor;

  _this.classObj.prototype.getClassName = function() { return _this.className; }
  _this.classObj.prototype.getClassNamespace = function() { return _this.classNamespace; }

  _this.classHierarchy = COM.ClassObject.classHierarchy[_this.className] = new COM.ClassHierarchy(_this.className);
  _this.classHierarchy.addClass(_this.classObj);

  //_this.classHierarchy = COM.ClassObject.classHierarchy[_this.className] = {};
  //_this.classHierarchy[_this.className] = _this.classObj;

  //**OLD**
  //assign the class name, needed to run the constructor
  //_this.classObj.prototype.__className__ = className;

  return _this;
}


COM.ClassObject.prototype = {
  classObj: null,       //the actual object for this class
  className: null,      //the name of this class
  classHierarchy: null, //
  classNamespace: "",

  //the default constructor and destructor take nothing and return nothing
  defaultConstructor: function() {},
  defaultDestructor: function() {},

  //provides for inheritance
  extend: function() {
    var currentArg, //the argument currently being examined
        index;      //index into an array


    //inherit from each given class
    for(index in arguments) {
      currentArg = arguments[index];
      currentArg = COM.ClassObject.obtainNamespace(currentArg);
      subClass(this.classObj, currentArg);

      this.classHierarchy.extendHierarchy(COM.ClassObject.classHierarchy[currentArg.prototype.getClassName()]);
    }

    //returns the class object to allow chaining
    return this;
  },

  //assigns prototype values to this class
  assign: function(proto) {
    //the prototype must be an object
    if(typeof(proto) !== "object") return null;

    //add the new prototype information to the old
    COM.SCM.SubClassTree.extend(this.classObj.prototype, proto);


    //returns the class object to allow chaining
    return this;
  },

  //puts this class in a given namespace
  namespace: function(namespace) {
    var classNamespace = COM.ClassObject.obtainNamespace(this.classNamespace),
        context = COM.ClassObject.obtainNamespace(namespace);         //the object context
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
  }
}


//class to handle concerns relating to a class's
//inheritance hierarchy (doesn't itself have an
//inheritance hierarchy)
COM.ClassHierarchy = function(className) {
  return this.ClassHierarchy(className);
}

COM.ClassHierarchy.prototype = {
  className: null,
  hierarchy: null,

  ClassHierarchy: function(className) {
    this.className = className;
    this.hierarchy = {};

    //every class is inherently an object
    //this.hierarchy["Object"] = Object;
    this.addClass(Object);


    return this;
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
    var className = COM.ClassHierarchy.getClassName(classType);

    //make sure we are working with a COM created object
    if(typeof(classType) !== "function" || !className) {
      throw new Error("A class hierarchy is only valid for objects");
    }

    this.hierarchy[className] = classType;
    
    return this;
  },

  extendHierarchy: function(otherHierarchy) {
    return COM.SCM.SubClassTree.extend(this.hierarchy, otherHierarchy.hierarchy);
  },

  get: function() {
    return this.hierarchy;
  }
}

COM.ClassHierarchy.isObject = function(obj) {
  return (typeof(obj) === "object" /*&& obj.constructor === Objec*/);
}

COM.ClassHierarchy.classIsObject = function(obj) {
  return (typeof(obj) === "function" && obj === Object);
}

COM.ClassHierarchy.isArray = function(obj) {
  return (typeof(obj) === "object" && obj.constructor === Array);
}

COM.ClassHierarchy.classIsArray = function(obj) {
  return (typeof(obj) === "function" && obj === Array);
}

COM.ClassHierarchy.isBoolean = function(obj) {
  return (typeof(obj) === "boolean");
}

COM.ClassHierarchy.classIsBoolean = function(obj) {
  return (typeof(obj) === "function" && obj === Boolean);
}

COM.ClassHierarchy.isNumber = function(obj) {
  return (typeof(obj) === "number");
}

COM.ClassHierarchy.classIsNumber = function(obj) {
  return (typeof(obj) === "function" && obj === Number);
}

COM.ClassHierarchy.isString = function(obj) {
  return (typeof(obj) === "string");
}

COM.ClassHierarchy.classIsString = function(obj) {
  return (typeof(obj) === "function" && obj === String);
}

COM.ClassHierarchy.getClassName = function(classType) {
  var className = undefined;


  if(typeof(classType) == "undefined") return "Undefined";
  if(classType == null) return "Null";

  if(classType.getClassName) {
    className = classType.getClassName();
  } else if(classType.prototype && classType.prototype.getClassName) {
    className = classType.prototype.getClassName();
  } else {
    if(COM.ClassHierarchy.classIsArray(classType) ||
       COM.ClassHierarchy.isArray(classType)) {
      className = "Array";
    } else if(COM.ClassHierarchy.classIsObject(classType) ||
              COM.ClassHierarchy.isObject(classType)) {
      className = "Object";
    } else if(COM.ClassHierarchy.isBoolean(classType) ||
              COM.ClassHierarchy.classIsBoolean(classType)) {
      className = "Boolean";
    } else if(COM.ClassHierarchy.isNumber(classType) ||
              COM.ClassHierarchy.classIsNumber(classType)) {
      className = "Number";
    } else if(COM.ClassHierarchy.isString(classType) ||
              COM.ClassHierarchy.classIsString(classType)) {
      className = "String";
    }
  }

  return className;
}

//Number.prototype.getClassName = function() { return "Number"; }
//String.prototype.getClassName = function() { return "String"; }
//Boolean.prototype.getClassName = function() { return "Boolean"; }

//static object containing references to all class hierarchies
COM.ClassObject.classHierarchy = {};

//adding hierarchies for default types
COM.ClassObject.classHierarchy["Object"] = new COM.ClassHierarchy("Object");
COM.ClassObject.classHierarchy["Array"] = new COM.ClassHierarchy("Array").addClass(Array);
COM.ClassObject.classHierarchy["Boolean"] = new COM.ClassHierarchy("Boolean").addClass(Boolean);
COM.ClassObject.classHierarchy["Number"] = new COM.ClassHierarchy("Number").addClass(Number);
COM.ClassObject.classHierarchy["String"] = new COM.ClassHierarchy("String").addClass(String);

//abstract functions are regular functions that just throw an error when run
COM.ClassObject.__abstractFunction__ = function() {
  throw new Error("Abstract functions cannot be run.");
}

//setting something as an abstract function sets it as the generic abstract function
COM.ClassObject.abstractFunction = function() {
  return COM.ClassObject.__abstractFunction__;
}


//support for function overloading
COM.ClassObject.overload = function() {
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
COM.ClassObject.overloadWithTypes = function() {
  var numEntries = arguments.length, //number of entries
      index,                         //index into an array
      index2,                        //another array index
      func,                          //the current function
      types,                         //the number or arguments for the function
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
        className,                //the name of a class
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
          //if(arguments[argIndex] == null) continue;
          currentParameter = currentTypes[argIndex];
          className = COM.ClassHierarchy.getClassName(arguments[argIndex]);
          currentHierarchy = COM.ClassObject.classHierarchy[className];

          if(!currentHierarchy.hasClass(currentParameter)) {
            validOverloadFound = false;
            break;
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

        return currentFunction.apply(_this, args);
      }
    }

    //we didn't find a valid overload for the given inputs
    if(!validOverloadFound) {
      errorMessage = "No overload for function(";
      for(index = 0; index < arguments.length; index++) {
        errorMessage += COM.ClassHierarchy.getClassName(arguments[index]);
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
    for(index2 in types) {
      types[index2] = COM.ClassObject.obtainNamespace(types[index2]);
      overloadIndex += ("_" + COM.ClassHierarchy.getClassName(types[index2]));
    }

    //assign the function
    overloadFunction.overloadFunctions[overloadIndex] = func;

    //create the type array
    overloadType = overloadFunction.overloadTypes[overloadIndex] = [];

    for(index2 in types) {
      className = COM.ClassHierarchy.getClassName(types[index2]);
      overloadType[overloadType.length] = className;
//      overloadType[overloadType.length] = COM.ClassObject.classHierarchy[className];
    }
  }

  return overloadFunction;
}


//support for destruction of classes
COM.ClassObject.destroy = function(obj) {
  var index; //index in an array

  //run this object's destructor
  obj["_" + obj.getClassName()]();

  //delete references to everything in this class
  for(index in obj) {
    delete obj[index];
  }
}


//namespace support (beta)
COM.ClassObject.obtainNamespace = function(namespace) {
  var nsParts,
      context,
      index,
      contextList,
      contextListIndex;

  //getClassName();

  //if they give us an object, that must
  //be what we were looking for
  if(typeof(namespace) === "object" ||
     typeof(namespace) === "function") return namespace;

  //if we get anything but a string at this point,
  //there's really nothing to do with it
  if(typeof(namespace) !== "string") {
    throw new Error("A namespace must be an object or string literal.");
  }

  if(namespace.length == 0) return global;

  //split the namespace into parts and initialize 
  //the context to the global namespace
  nsParts = nsParts = namespace.split(".");
  context = global;

  //set up the namespace path
  for(index in nsParts) {
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

COM.ClassObject.event = function(context) {
  var eventObj;

  eventObj = function() {
    var index,
        args = [];

    for(index in arguments) {
      args[index] = arguments[index];
    }

    for(index in eventObj.subscribedFunctions) {
      if(typeof(eventObj.subscribedFunctions[index]) == "function") {
        eventObj.subscribedFunctions[index].apply(context, args);
      }
    }
  }

  context = context || this;

  eventObj.subscribedFunctions = {};

  eventObj.subscribe = function(name, func) {
    if(typeof(name) == "string" && typeof(func) == "function") {
      eventObj.subscribedFunctions[name] = func;
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
COM.ClassObject.using = function(namespace) {
  var context,
      index;

  //locate the namespace in question
  context = COM.ClassObject.obtainNamespace(namespace)

  //Copy everything in that namespace to the global
  //namespace. Overwrite if it already exists
  for(index in context) {
    if(!context[index]["__Namespace__"] && index !== "__Namespace__") {
      global[index] = context[index];
    }
  }
}


//moves the cotents of a given namespace out of the global namespace
COM.ClassObject.unusing = function(namespace) {
  var context,
      index;

  context = COM.ClassObject.obtainNamespace(namespace);

  for(index in context) {
    if(!context[index]["__Namespace__"]) {
      delete global[index];
    }
  }
}


//function to create a new class object
COM.ClassObject.define = function(classDesignation, isAbstract) {
  if(typeof(classDesignation) !== "string") {
    throw new Error("use: define(String classDesignation, Boolean isAbstract)");
  }

  var hasNamespace = (classDesignation.lastIndexOf(".") !== -1),
      classNamespace = hasNamespace ? classDesignation.substring(0, classDesignation.lastIndexOf(".")) : "",
      className = hasNamespace ? classDesignation.substring(classDesignation.lastIndexOf(".") + 1, classDesignation.length) : classDesignation,
      context = COM.ClassObject.obtainNamespace(classNamespace),
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
  newClass = new COM.ClassObject(classNamespace, className, isAbstract);
  return newClass;
}


//moving important functions to the global namespace
global["namespace"] = COM.namespace;
global["using"] = COM.ClassObject.using;
global["unusing"] = COM.ClassObject.unusing;
global["define"] = COM.ClassObject.define;
global["destroy"] = COM.ClassObject.destroy;

global["event"] = COM.ClassObject.event;

//choose between two versions of overloading
if((COMOptions.overloadType = COMOptions.overloadType || "typed") === "typed") {
  global["overload"] = COM.ClassObject.overloadWithTypes
} else if(COMOptions.overloadType === "untyped") {
  global["overload"] = COM.ClassObject.overload;
}


global["abstractFunction"] = COM.ClassObject.abstractFunction;

//don't need people getting their hands on ClassObject that easy...
//global["ClassObject"] = COM.ClassObject;

global["finalizeSubClass"] = COM.SCM.SubClassManager.finalizeSubClass;
global["subClass"] = COM.SCM.SubClassManager.subClass;

//exports.define = COM.ClassObject.define;
//exports.destroy = COM.ClassObject.destroy;
