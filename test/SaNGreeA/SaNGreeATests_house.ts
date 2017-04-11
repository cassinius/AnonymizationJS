/// <reference path="../../typings/tsd.d.ts" /><

import * as chai from 'chai';
import * as $GH from '../../src/core/GenHierarchies';
import * as $San from '../../src/SaNGreeA/SaNGreeA';
import * as $C from '../../src/config/SaNGreeAConfig_house';
import * as $CSVIN from '../../src/io/CSVInput';

import * as $G from 'graphinius';
// console.dir($G);

let expect = chai.expect,
		assert = chai.assert,
    python_out = 'houses_output_for_python',
		san : $San.ISaNGreeA,
    config : $San.ISaNGreeAConfig = $C.CONFIG,
		csvIN : $CSVIN.ICSVInput = new $CSVIN.CSVInput($C.CONFIG);
    
		
describe('SANGREEA TESTS, HOUSE DATASET', () => {

  it('should output the cleaned input data source for python', () => {
    san = new $San.SaNGreeA("houses", config);                  
    san.instantiateGraph(csvIN.readCSVFromFile(config.INPUT_FILE), true);
    san.outputPreprocCSV(python_out);
    expect(san._graph.nrNodes()).to.equal(config.NR_DRAWS);
  });


  it('should anonymize a graph with equally distributed weights', () => {
      san = new $San.SaNGreeA("houses", config);               
      san.instantiateGraph(csvIN.readCSVFromFile(config.INPUT_FILE), true);
      san.anonymizeGraph();      
      var anonymizedOutfile = "houses_anonymized_k" + config.K_FACTOR + "_" + config.VECTOR;
      san.outputAnonymizedCSV(anonymizedOutfile);

			console.log(san._graph.nrNodes());
      
      expect(san._graph.nrNodes()).to.equal(config.NR_DRAWS);
    });

});
