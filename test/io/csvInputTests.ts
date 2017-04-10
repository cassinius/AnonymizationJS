/// <reference path="../../typings/tsd.d.ts" />

import * as chai from 'chai';
import * as $GH from '../../src/core/GenHierarchies';
import * as $San from '../../src/SaNGreeA/SaNGreeA';
import * as $CSV from '../../src/io/CSVInput';
import * as $C from '../../src/config/SaNGreeAConfig_adult';

const CSV_500_LENGTH : number = 502;
let expect = chai.expect;
let remote_file = "http://berndmalle.com/anonymization/adults/education/original_data_500_rows.csv";

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


  describe('- ASYNC Input Tests', () => {

    csvInput = new $CSV.CSVInput(config);
    let csv_result = "";

    it('should remotely load a CSV file from a test server (berndmalle.com) via NodeJS', (done) => {
      csvInput.readCSVFromURL(remote_file, function(csv) {
        csv_result = csv;
        expect(Array.isArray(csv_result)).to.be.true;
        expect(csv_result.length).to.equal(CSV_500_LENGTH);
        done();
      });
    });

    it.skip('should successfully load the same CSV via a mock XHR object', (done) => {
      done();
    });

  });
  
});