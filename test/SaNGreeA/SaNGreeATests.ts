/// <reference path="../../typings/tsd.d.ts" />

import * as chai from 'chai';
import * as $GH from '../../src/core/GenHierarchies';
import * as $San from '../../src/SaNGreeA/SaNGreeA';


var expect = chai.expect,
		assert = chai.assert,
		opts : $San.ISaNGreeAOptions,
		adults = './test/input/test_data/adult_data.csv',
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
				workclass_file = './test/input/test_data/WorkClassGH.json';
	
	
		it('should have no gen hierarchies after instantiation', () => {
			san = new $San.SaNGreeA("test", adults);
			expect(Object.keys(san.getHierarchies()).length).to.equal(0);
		});
	
		
		it('should correctly set a new string hierarchy', () => {
			strgh = new $GH.StringGenHierarchy(workclass_file);
			san = new $San.SaNGreeA("test", adults);
			san.setHierarchy("workclass", strgh);
			hierarchy = san.getHierarchy("workclass");
			expect(hierarchy).to.be.an.instanceof($GH.StringGenHierarchy);
			if ( hierarchy instanceof $GH.StringGenHierarchy ) {
				expect(hierarchy.nrLevels()).to.equal(2);
			}
		});
		
		
		it('should correctly set a new continuous hierarchy', () => {
			contgh = new $GH.ContGenHierarchy("age", 11, 99);
			san = new $San.SaNGreeA("test", adults);
			san.setHierarchy("age", contgh);
			hierarchy = san.getHierarchy("age");
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
				workclass_file = './test/input/test_data/WorkClassGH.json',
				nat_country_file = './test/input/test_data/NativeCountryGH.json';
				
				
		beforeEach(() => {
			san = new $San.SaNGreeA("adults", adults);
			[workclass_file, nat_country_file].forEach((file) => {
				strgh = new $GH.StringGenHierarchy(file);
				san.setHierarchy(strgh._name, strgh);
			});
			expect(san.getHierarchy('workclass')).not.to.be.undefined;
			expect(san.getHierarchy('workclass')).to.be.an.instanceof($GH.StringGenHierarchy);
			expect(san.getHierarchy('native-country')).not.to.be.undefined;
			expect(san.getHierarchy('workclass')).to.be.an.instanceof($GH.StringGenHierarchy);
			// contgh = new $GH.ContGenHierarchy()
		});
		
		
		it('should instantiate a graph with the expected nr. of nodes', () => {
			san.instantiateGraph();
			expect(san._graph.nrNodes()).to.equal(300);
		});
		
	});
	
});

