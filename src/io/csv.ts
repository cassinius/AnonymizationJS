/// <reference path="../../typings/tsd.d.ts" />

import _ 		= require('lodash');
import fs 	= require('fs');
import path = require('path');
import * as $GH from '../../src/core/GenHierarchies';

var Graphinius = require('../../node_modules/graphinius/index.js');
var $G = Graphinius.$G;

console.log($G);

export interface ICSV {
  _sep : string;
  
  readCSV() : any; // Nope, we need to specify graph object
}

class CSV implements ICSV {
  
  
  /**
   * 
   */
  constructor(public _sep = ",") {
    
  }
  
  
  readCSV() {
    
  }
  
}

export { CSV };