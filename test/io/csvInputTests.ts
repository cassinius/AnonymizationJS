/// <reference path="../../typings/tsd.d.ts" />

import * as chai from 'chai';
import * as $GH from '../../src/core/GenHierarchies';
import * as $San from '../../src/SaNGreeA/SaNGreeA';
import * as $CSV from '../../src/io/CSVInput';
import * as $C from '../../src/config/SaNGreeAConfig_adult';


let expect = chai.expect;

describe('CSV TESTS', () => {

  let csvInput : $CSV.ICSVInput;
  let config = $C.CONFIG;
  
  
  describe('- Basic Instantiation Tests', () => {
    
    it('should correctly set comma as default separation character', () => {
      csvInput = new $CSV.CSVInput(config);
      expect(csvInput._SEP).to.be.instanceof(RegExp);
      expect(csvInput._SEP.toString()).to.equal("/,/");
    });

    
    it('should correctly set a given separation character', () => {
      config.SEPARATOR = " ";
      csvInput = new $CSV.CSVInput(config);
      expect(csvInput._SEP).to.be.instanceof(RegExp);
      expect(csvInput._SEP.toString()).to.equal("/ /");
    });


    it('should correctly set Whitespace as default trimming character', () => {
      csvInput = new $CSV.CSVInput(config);
      expect(csvInput._TRIM).to.be.instanceof(RegExp);
      expect(csvInput._TRIM.toString()).to.equal("/\\s+/g");
    });

    
    it('should correctly set a given trimming character', () => {
      config.TRIM = "blah";
      csvInput = new $CSV.CSVInput(config);
      expect(csvInput._TRIM).to.be.instanceof(RegExp);
      expect(csvInput._TRIM.toString()).to.equal("/blah/g");
    });
    
  });
  
  
  describe('- Input Tests', () => {
    
    it('should offer a method "readCSVFromFile"', () => {
      csvInput = new $CSV.CSVInput(config);
      expect(csvInput.readCSVFromFile).not.to.be.undefined;
    });


    it('should offer a method "readCSVFromURL"', () => {
      csvInput = new $CSV.CSVInput(config);
      expect(csvInput.readCSVFromURL).not.to.be.undefined;
    });
    
  });
  
});