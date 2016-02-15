/// <reference path="../../typings/tsd.d.ts" />

import * as chai from 'chai';
import * as $GH from '../../src/core/GenHierarchies';
import * as $San from '../../src/SaNGreeA/SaNGreeA';
import * as $CSV from '../../src/io/csv';

var CSV = $CSV.CSV,
    expect = chai.expect;

describe('CSV TESTS', () => {
  var csvInput : $CSV.ICSV,
      graph;
  
  
  describe('- Basic Instantiation Tests', () => {
    
    it('should correctly set comma as default separation character', () => {
      csvInput = new CSV();
      expect(csvInput._sep).to.equal(",");
    });
    
    it('should correctly set a given separation character', () => {
      csvInput = new CSV(" ");
      expect(csvInput._sep).to.equal(" ");
    });
    
  });
  
  
  describe('- Input Tests', () => {
    
    it('should offer a method "readCSV"', () => {
      csvInput = new CSV();
      expect(csvInput.readCSV).not.to.be.undefined;
    });
    
  });
  
});