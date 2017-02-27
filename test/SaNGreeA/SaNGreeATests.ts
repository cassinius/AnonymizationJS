/// <reference path="../../typings/tsd.d.ts" /><

import * as chai from 'chai';
import * as $GH from '../../src/core/GenHierarchies';
import * as $San from '../../src/SaNGreeA/SaNGreeA';
import * as $C from '../../src/config/SaNGreeAConfig';

import * as $G from 'graphinius';
// console.dir($G);

var expect = chai.expect,
		assert = chai.assert,
		adults = './test/io/test_input/adult_data.csv',
		san : $San.ISaNGreeA;
    
		
describe('SANGREEA TESTS', () => {
	
	describe('Basic instantiation tests', () => {
    
    var config : $San.ISaNGreeAConfig;
    
    beforeEach(() => {
      // Copy the JSON from the file, resetting it to defaults...
      config = JSON.parse(JSON.stringify($C.CONFIG));
    });
    
		
		it('should correctly instantiate a Sangreea object with default params', () => {
			san = new $San.SaNGreeA();
			expect(san).not.to.be.undefined;
			expect(san._name).to.equal("default");
			expect(san.getConfig().NR_DRAWS).to.equal(config.NR_DRAWS);
		});
		
		
		it('should throw an error if input file is set to empty string', () => {
			config.INPUT_FILE = ""
      assert.throw(function () {
				new $San.SaNGreeA("test", config)
			}, 'Input file cannot be an empty string');
		});
		
		
		it('should throw an error if nr_draws is set to a negative value', () => {
			config.NR_DRAWS = -3;
      
			assert.throw(function () {
			san = new $San.SaNGreeA("adults", config);
			}, 'Options invalid. Nr_draws can not be negative.');
		});
		
		
		it('should throw an error if edge_min is set to a negative value', () => {
		  config.EDGE_MIN = -1;
      
			assert.throw(function () {
			san = new $San.SaNGreeA("adults", config);
			}, 'Options invalid. Edge_min can not be negative.');
		});
		
		
		it('should throw an error if edge_max is set to a negative value', () => {
			config.EDGE_MAX = -1;
      
			assert.throw(function () {
			san = new $San.SaNGreeA("adults", config);
			}, 'Options invalid. Edge_max can not be negative.');
		});
		
		
		it('should throw an error if edge_min is greater than edge_max', () => {
			config.EDGE_MIN = 10;
      config.EDGE_MAX = 1;
      
			assert.throw(function () {
			san = new $San.SaNGreeA("adults", config);
			}, 'Options invalid. Edge_min cannot exceed edge_max.');
		});
		
	});
	
	
	describe('Gen hierarchies getting and setting', () => {
		
		var strgh : $GH.IStringGenHierarchy,
				contgh : $GH.IContGenHierarchy,
				hierarchy : $GH.IStringGenHierarchy | $GH.IContGenHierarchy,
				workclass_file = './test/io/test_input/workclassGH.json';
	
	
		it('should have no gen hierarchies after instantiation', () => {
			san = new $San.SaNGreeA();
			expect(Object.keys(san.getCatHierarchies()).length).to.equal(0);
			expect(Object.keys(san.getContHierarchies()).length).to.equal(0);
		});
	
		
		it('should correctly set a new string hierarchy', () => {
			strgh = new $GH.StringGenHierarchy(workclass_file);
			san = new $San.SaNGreeA();
			san.setCatHierarchy("workclass", strgh);
			hierarchy = san.getCatHierarchy("workclass");
			expect(hierarchy).to.be.an.instanceof($GH.StringGenHierarchy);
			if ( hierarchy instanceof $GH.StringGenHierarchy ) {
				expect(hierarchy.nrLevels()).to.equal(2);
			}
		});
		
		
		it('should correctly set a new continuous hierarchy', () => {
			contgh = new $GH.ContGenHierarchy("age", 11, 99);
			san = new $San.SaNGreeA();
			san.setContHierarchy("age", contgh);
			hierarchy = san.getContHierarchy("age");
			expect(hierarchy).to.be.an.instanceof($GH.ContGenHierarchy);
			if ( hierarchy instanceof $GH.ContGenHierarchy ) {
				expect(hierarchy.genCostOfRange(30, 52)).to.equal(1/4);
			}
		});
		
	});
	
	
	describe('Read CSV and instantiate graph - ', () => {
		
		var strgh : $GH.IStringGenHierarchy,
				contgh : $GH.IContGenHierarchy,
				hierarchy : $GH.IStringGenHierarchy | $GH.IContGenHierarchy,
				workclass_file = './test/io/test_input/workclassGH.json',
				sex_file = './test/io/test_input/sexGH.json',
				race_file = './test/io/test_input/raceGH.json',
				marital_file = './test/io/test_input/marital-statusGH.json',
				nat_country_file = './test/io/test_input/native-countryGH.json',
				relationship_file = './test/io/test_input/relationshipGH.json',
        occupation_file = './test/io/test_input/occupationGH.json',
				income_file = './test/io/test_input/incomeGH.json';
	  var config : $San.ISaNGreeAConfig;
				
		beforeEach(() => {
      config = JSON.parse(JSON.stringify($C.CONFIG));
			san = new $San.SaNGreeA("adults", config);
      
			[workclass_file, nat_country_file, sex_file, race_file, 
       marital_file, relationship_file, occupation_file, income_file].forEach((file) => {
				strgh = new $GH.StringGenHierarchy(file);
				san.setCatHierarchy(strgh._name, strgh);
			});
      
			expect(san.getCatHierarchy('workclass')).not.to.be.undefined;
			expect(san.getCatHierarchy('workclass')).to.be.an.instanceof($GH.StringGenHierarchy);
			expect(san.getCatHierarchy('native-country')).not.to.be.undefined;
			expect(san.getCatHierarchy('native-country')).to.be.an.instanceof($GH.StringGenHierarchy);
			expect(san.getCatHierarchy('workclass')).not.to.be.undefined;
			expect(san.getCatHierarchy('workclass')).to.be.an.instanceof($GH.StringGenHierarchy);
			expect(san.getCatHierarchy('relationship')).not.to.be.undefined;
			expect(san.getCatHierarchy('relationship')).to.be.an.instanceof($GH.StringGenHierarchy);
			expect(san.getCatHierarchy('occupation')).not.to.be.undefined;
			expect(san.getCatHierarchy('occupation')).to.be.an.instanceof($GH.StringGenHierarchy);
			expect(san.getCatHierarchy('income')).not.to.be.undefined;
			expect(san.getCatHierarchy('income')).to.be.an.instanceof($GH.StringGenHierarchy);
		});
				
    
    it('should anonymize a graph with equally distributed weights', () => {
      san.instantiateGraph( false );
      
      // TODO MAKE IT AN OWN TEST CASE
      // var preprocOutfile = "input_sanitized";
      // san.outputPreprocCSV(preprocOutfile);
      
      san.anonymizeGraph();
      
      var anonymizedOutfile = "adults_anonymized_k" + config.K_FACTOR + "_" + config.VECTOR;
      san.outputAnonymizedCSV(anonymizedOutfile);

			console.log(san._graph.nrNodes());
      
      expect(san._graph.nrNodes()).to.equal(config.NR_DRAWS);
    });
    
    
    it('should compute an anonymization with higher weight for race', () => {
      config.VECTOR = 'emph_race';
      
      san = new $San.SaNGreeA("adults", config);
      
      [workclass_file, nat_country_file, sex_file, race_file, 
      marital_file, relationship_file, occupation_file, income_file].forEach((file) => {
        strgh = new $GH.StringGenHierarchy(file);
        san.setCatHierarchy(strgh._name, strgh);
      });
      
      san.instantiateGraph( false );
      san.anonymizeGraph();
      
      var anonymizedOutfile = "adults_anonymized_k" + config.K_FACTOR + "_" + config.VECTOR;
      san.outputAnonymizedCSV(anonymizedOutfile);
      
      expect(san._graph.nrNodes()).to.equal(config.NR_DRAWS);
    });
    
    
    it('should compute an anonymization with higher weight for age', () => {
      config.VECTOR = 'emph_age';
      
      san = new $San.SaNGreeA("adults", config);
      
      [workclass_file, nat_country_file, sex_file, race_file, 
      marital_file, relationship_file, occupation_file, income_file].forEach((file) => {
        strgh = new $GH.StringGenHierarchy(file);
        san.setCatHierarchy(strgh._name, strgh);
      });
      
      san.instantiateGraph( false );
      san.anonymizeGraph();
      
      var anonymizedOutfile = "adults_anonymized_k" + config.K_FACTOR + "_" + config.VECTOR;
      san.outputAnonymizedCSV(anonymizedOutfile);
      
      expect(san._graph.nrNodes()).to.equal(config.NR_DRAWS);
    });
    
    
    it('should write out the cleaned input data source for python', () => {
      // var config : $San.ISaNGreeAConfig = JSON.parse(JSON.stringify($C.CONFIG));
      // config.NR_DRAWS = 3000;
      // san = new $San.SaNGreeA("adults", config);
      
      // [workclass_file, nat_country_file, sex_file, race_file, 
      // marital_file, relationship_file, occupation_file].forEach((file) => {
      //   strgh = new $GH.StringGenHierarchy(file);
      //   san.setCatHierarchy(strgh._name, strgh);
      // });
      
      san.readCSV(adults, san._graph);
      var preprocOutfile = "input_for_python";
      san.outputPreprocCSV(preprocOutfile);
      expect(san._graph.nrNodes()).to.equal(config.NR_DRAWS);
    });
		
		
		[20, 40, 60, 80, 100].forEach(function(prob) {
			it.skip('should write out the cleaned input data source for python', () => {
				var config : $San.ISaNGreeAConfig = JSON.parse(JSON.stringify($C.CONFIG));
				config.NR_DRAWS = 30162;
				san = new $San.SaNGreeA("adults", config);
				
        // [workclass_file, nat_country_file, sex_file, race_file, 
        // marital_file, relationship_file, occupation_file, income_file].forEach((file) => {
        //   strgh = new $GH.StringGenHierarchy(file);
        //   san.setCatHierarchy(strgh._name, strgh);
        // });
				
				var skip = {
					'prob'  : prob / 100,
					'feat'  : 'education-num',
					'value' : 10
				};
				
				san.readCSV(adults, san._graph);
				var preprocOutfile = "adults_" + skip.feat + "_" + skip.value + "_" + skip.prob;
				san.outputPreprocCSV(preprocOutfile, skip);
				expect(san._graph.nrNodes()).to.equal(config.NR_DRAWS);
			});
		});
    
	});
  
  
  describe.skip('graph instantiation', () => {    
		
		it('should produce an adjacency list representing a drawn sample graph', () => {
			san.instantiateGraph();
			
			var outfile = "./test/io/test_output/adult_graph_adj_list.csv";
			var csvOut = new $G.output.CSVOutput(",", false, false);
			csvOut.writeToAdjacencyListFile(outfile, san._graph);
      
      expect("this test case").not.to.equal("being without pertinent expectation.");
		});
    
  });
	
});
