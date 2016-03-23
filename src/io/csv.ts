/// <reference path="../../typings/tsd.d.ts" />

import fs 	= require('fs');
import path = require('path');
import * as $GH from '../core/GenHierarchies';

// var Graphinius = require('graphinius');
// var $G = Graphinius.$G;

// console.log($G);

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