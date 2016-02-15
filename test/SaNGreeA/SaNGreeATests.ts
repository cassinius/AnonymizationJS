/// <reference path="../../typings/tsd.d.ts" />

import * as chai from 'chai';
import * as $GH from '../../src/core/GenHierarchies';
import * as $San from '../../src/SaNGreeA/SaNGreeA';


var expect = chai.expect,
		assert = chai.assert,
		opts : $San.ISaNGreeAOptions,
		adults = './test/io/test_input/adult_data.csv',
		san : $San.ISaNGreeA;
		
		
describe('SANGREEA TESTS', () => {
	
	describe('Basic instantiation tests', () => {
		
		it('should correctly instantiate a Sangreea object with default params', () => {
			san = new $San.SaNGreeA("test", adults);
			expect(san).not.to.be.undefined;
			expect(san._name).to.equal("test");
			expect(san.getOptions().nr_draws).to.equal(300);
		});
		
		
		it('should throw an error if input file is set to empty string', () => {
			assert.throw(function () {
				new $San.SaNGreeA("test", "", opts)
			}, 'Input file cannot be an empty string');
		});
		
		
		it('should throw an error if nr_draws is set to a negative value', () => {
			opts = {
				nr_draws: -3,
				edge_min: 0,
				edge_max: 10
			}
			assert.throw(function () {
				new $San.SaNGreeA("test", adults, opts)
			}, 'Options invalid. Nr_draws can not be negative.');
		});
		
		
		it('should throw an error if edge_min is set to a negative value', () => {
			opts = {
				nr_draws: 300,
				edge_min: -1,
				edge_max: 10
			}
			assert.throw(function () {
				new $San.SaNGreeA("test", adults, opts)
			}, 'Options invalid. Edge_min can not be negative.');
		});
		
		
		it('should throw an error if edge_max is set to a negative value', () => {
			opts = {
				nr_draws: 300,
				edge_min: 0,
				edge_max: -10
			}
			assert.throw(function () {
				new $San.SaNGreeA("test", adults, opts)
			}, 'Options invalid. Edge_max can not be negative.');
		});
		
		
		it('should throw an error if edge_min is greater than edge_max', () => {
			opts = {
				nr_draws: 300,
				edge_min: 5,
				edge_max: 2
			}
			assert.throw(function () {
				new $San.SaNGreeA("test", adults, opts)
			}, 'Options invalid. Edge_max cannot exceed edge_min.');
		});
		
	});
	
	
	describe('Gen hierarchies getting and setting', () => {
		
		var strgh : $GH.IStringGenHierarchy,
				contgh : $GH.IContGenHierarchy,
				hierarchy : $GH.IStringGenHierarchy | $GH.IContGenHierarchy,
				workclass_file = './test/io/test_input/WorkClassGH.json';
	
	
		it('should have no gen hierarchies after instantiation', () => {
			san = new $San.SaNGreeA("test", adults);
			expect(Object.keys(san.getCatHierarchies()).length).to.equal(0);
			expect(Object.keys(san.getContHierarchies()).length).to.equal(0);
		});
	
		
		it('should correctly set a new string hierarchy', () => {
			strgh = new $GH.StringGenHierarchy(workclass_file);
			san = new $San.SaNGreeA("test", adults);
			san.setCatHierarchy("workclass", strgh);
			hierarchy = san.getCatHierarchy("workclass");
			expect(hierarchy).to.be.an.instanceof($GH.StringGenHierarchy);
			if ( hierarchy instanceof $GH.StringGenHierarchy ) {
				expect(hierarchy.nrLevels()).to.equal(2);
			}
		});
		
		
		it('should correctly set a new continuous hierarchy', () => {
			contgh = new $GH.ContGenHierarchy("age", 11, 99);
			san = new $San.SaNGreeA("test", adults);
			san.setContHierarchy("age", contgh);
			hierarchy = san.getContHierarchy("age");
			expect(hierarchy).to.be.an.instanceof($GH.ContGenHierarchy);
			if ( hierarchy instanceof $GH.ContGenHierarchy ) {
				expect(hierarchy.genCostOfRange(30, 52)).to.equal(1/4);
			}
		});
		
	});
	
	
	describe('Read CSV and instantiate graph', () => {
		
		var strgh : $GH.IStringGenHierarchy,
				contgh : $GH.IContGenHierarchy,
				hierarchy : $GH.IStringGenHierarchy | $GH.IContGenHierarchy,
				workclass_file = './test/io/test_input/WorkClassGH.json',
				sex_file = './test/io/test_input/SexGH.json',
				race_file = './test/io/test_input/RaceGH.json',
				marital_file = './test/io/test_input/MaritalStatusGH.json',
				nat_country_file = './test/io/test_input/NativeCountryGH.json';
				
				
		beforeEach(() => {
			san = new $San.SaNGreeA("adults", adults);
			[workclass_file, nat_country_file, sex_file, race_file, marital_file].forEach((file) => {
				strgh = new $GH.StringGenHierarchy(file);
				san.setCatHierarchy(strgh._name, strgh);
			});
			expect(san.getCatHierarchy('workclass')).not.to.be.undefined;
			expect(san.getCatHierarchy('workclass')).to.be.an.instanceof($GH.StringGenHierarchy);
			expect(san.getCatHierarchy('native-country')).not.to.be.undefined;
			expect(san.getCatHierarchy('workclass')).to.be.an.instanceof($GH.StringGenHierarchy);
		});
		
		
		it('should instantiate a graph with the expected nr. of nodes', () => {
			san.instantiateGraph();
			san.anonymizeGraph(10);
			
			var outfile = (+new Date()).toString();
			san.outputAnonymizedCSV(outfile);
			// expect(san._graph.nrNodes()).to.equal(300);
		});
		
		
		it('should compute an anonymization with higher weight for race', () => {
			var weights = {
				'age': 0.1,
				'workclass': 0.1,
				'native-country': 0.1,
				'sex': 0.1,
				'race': 0.5,
				'marital-status': 0.1 
			}
			
			san = new $San.SaNGreeA("adults", adults, undefined, weights);
			[workclass_file, nat_country_file, sex_file, race_file, marital_file].forEach((file) => {
				strgh = new $GH.StringGenHierarchy(file);
				san.setCatHierarchy(strgh._name, strgh);
			});
			
			san.instantiateGraph();
			san.anonymizeGraph(10);
			
			var outfile = (+new Date()).toString();
			san.outputAnonymizedCSV(outfile);
			// expect(san._graph.nrNodes()).to.equal(300);
		});
		
		
		it('should compute an anonymization with higher weight for marital status', () => {
			var weights = {
				'age': 0.95,
				'workclass': 0.01,
				'native-country': 0.01,
				'sex': 0.01,
				'race': 0.01,
				'marital-status': 0.1 
			}
			
			san = new $San.SaNGreeA("adults", adults, undefined, weights);
			[workclass_file, nat_country_file, sex_file, race_file, marital_file].forEach((file) => {
				strgh = new $GH.StringGenHierarchy(file);
				san.setCatHierarchy(strgh._name, strgh);
			});
			
			san.instantiateGraph();
			san.anonymizeGraph(10);
			
			var outfile = (+new Date()).toString();
			san.outputAnonymizedCSV(outfile);
      
			// expect(san._graph.nrNodes()).to.equal(300);
		});
		
	});
	
});

