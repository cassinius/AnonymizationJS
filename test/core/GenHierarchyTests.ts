/// <reference path="../../typings/tsd.d.ts" />

import * as chai from 'chai';
import * as $GH from '../../src/core/GenHierarchies';

var expect = chai.expect,
		assert = chai.assert,
		strgh : $GH.IStringGenHierarchy,
		contgh : $GH.IContGenHierarchy,
		zerolevellt1 = './test/input/test_data/InvalidGH0.json',
		zerolevelgt1 = './test/input/test_data/InvalidGH2.json',
		workclass_file = './test/input/test_data/WorkClassGH.json',
		native_country_file = './test/input/test_data/NativeCountryGH.json';


describe('String Generalization Hierarchies Tests: ', () => {
	
	describe('Basic instantiation tests', () => {
		
		it('should throw an error if level 0 has less than 1 entry', () => {
			assert.throw(function () {
				new $GH.StringGenHierarchy(zerolevellt1)
			}, 'JSON invalid. Level 0 must contain exactly 1 entry.');
		});
		
		
		it('should throw an error if level 0 has more than 1 entry', () => {
			assert.throw(function () {
				new $GH.StringGenHierarchy(zerolevelgt1)
			}, 'JSON invalid. Level 0 must contain exactly 1 entry.');
		});
		
		
		it('should correctly instantiate the workclass example', () => {
			strgh = new $GH.StringGenHierarchy(workclass_file);
			expect(strgh.nrLevels()).to.equal(2);
		});
		
		
		it('should return undefined as level of a non-existing entry', () => {
			strgh = new $GH.StringGenHierarchy(workclass_file);
			expect(strgh.getLevelEntry("menotexistsjabbajabba")).to.be.undefined;
		});
		
	});
	
	
	describe('String GH structural tests', () => {		
		
		it('should return the gen level of an entry', () => {
			strgh = new $GH.StringGenHierarchy(workclass_file);
			expect(strgh.getLevelEntry("all")).to.equal(0);
			expect(strgh.getLevelEntry("self")).to.equal(1);
			expect(strgh.getLevelEntry("gov")).to.equal(1);
			expect(strgh.getLevelEntry("other")).to.equal(1);
			expect(strgh.getLevelEntry("Private")).to.equal(2);
			expect(strgh.getLevelEntry("Self-emp-not-inc")).to.equal(2);
			expect(strgh.getLevelEntry("Self-emp-inc")).to.equal(2);
			expect(strgh.getLevelEntry("Federal-gov")).to.equal(2);
			expect(strgh.getLevelEntry("Local-gov")).to.equal(2);
			expect(strgh.getLevelEntry("State-gov")).to.equal(2);
			expect(strgh.getLevelEntry("Without-pay")).to.equal(2);
			expect(strgh.getLevelEntry("Never-worked")).to.equal(2);			
		});
		
		
		it('should generalize the root entry to itself', () => {
			strgh = new $GH.StringGenHierarchy(workclass_file);
			expect(strgh.getGeneralizationOf('all')).to.equal("all");
		});
		
		
		it('should return undefined when given a non-existing key', () => {
			strgh = new $GH.StringGenHierarchy(workclass_file);
			expect(strgh.getGeneralizationOf('menotexistsjabbajabba')).to.be.undefined;
		});
		
		
		it('should correctly return the generalization key of an entry', () => {
			strgh = new $GH.StringGenHierarchy(workclass_file);
			expect(strgh.getGeneralizationOf('self')).to.equal('all');
			expect(strgh.getGeneralizationOf('gov')).to.equal('all');
			expect(strgh.getGeneralizationOf('other')).to.equal('all');
			expect(strgh.getGeneralizationOf('Private')).to.equal('self');
			expect(strgh.getGeneralizationOf('Self-emp-not-inc')).to.equal('self');
			expect(strgh.getGeneralizationOf('Self-emp-inc')).to.equal('self');
			expect(strgh.getGeneralizationOf('Federal-gov')).to.equal('gov');
			expect(strgh.getGeneralizationOf('Local-gov')).to.equal('gov');
			expect(strgh.getGeneralizationOf('State-gov')).to.equal('gov');
			expect(strgh.getGeneralizationOf('Without-pay')).to.equal('other');
			expect(strgh.getGeneralizationOf('Never-worked')).to.equal('other');
		});
		
		
		/**
		 * Do the following for both the workclass and
		 * the native country files
		 */
		[workclass_file, native_country_file].forEach( (input_file) => {
			
			it('makes sure all gen entries (except the root) point to a valid entry', () => {
				strgh = new $GH.StringGenHierarchy(input_file);
				var entries = strgh.getEntries();
				for ( var entry_idx in entries ) {
					if ( entry_idx === 'all' ) {
						continue;
					}
					var entry = entries[entry_idx];
					expect(strgh.getGeneralizationOf(entry_idx)).not.to.be.undefined;
				}
			});
			
			
			it('makes sure all gen entries (except the root) are one level up', () => {
				strgh = new $GH.StringGenHierarchy(input_file);
				var entries = strgh.getEntries();
				for ( var entry_idx in entries ) {
					// console.log("Entry to gen: " + entry_idx);
					if ( entry_idx === 'all' ) {
						continue;
					}
					var entry = entries[entry_idx],
							level = entry.level,
							gen_entry = strgh.getGeneralizationOf(entry_idx);
					// console.log("Gen'd entry: " + entries[gen_entry]);
					expect(entries[gen_entry].level).to.equal(level-1);
				}
			});
		
		});
				
	});
	


	describe('Continuous Generalization Hierarchies Tests: ', () => {
	
		/**
		 * Is there more than basic stuff to test?
		 */
		describe('Basic tests', () => {
			
			it('should throw an error im min is greater than max', () => {
				assert.throw(function () {
				new $GH.ContGenHierarchy("invalid", 11, -99)
			}, 'Range invalid. Min greater than Max.');
			});
			
			
			it('should throw an error im min is equal to max', () => {
				assert.throw(function () {
				new $GH.ContGenHierarchy("invalid", 11, 11)
			}, 'Range invalid. Min equals Max.');
			});
			
			
			it('should correctly instantiate an object with name, min and max', () => {
				contgh = new $GH.ContGenHierarchy("test", 11, 99);
				expect(contgh._name).to.equal("test");
				expect(contgh._min).to.equal(11);
				expect(contgh._max).to.equal(99);
			});
			
			
			it('should throw an error if asked to generalize to negative span', () => {
				contgh = new $GH.ContGenHierarchy("test", 11, 99);
				expect(contgh.genCostOfRange.bind(contgh, 29, 25)).to.throw('Cannot generalize to negative range.');
			});
			
			
			it('should throw an error if gen span is out of range (from span < range min)', () => {
				contgh = new $GH.ContGenHierarchy("test", 11, 99);
				expect(contgh.genCostOfRange.bind(contgh, 8, 12)).to.throw('Cannot generalize span. From parameter less than range min.');
			});
			
			
			it('should throw an error if gen span is out of range (from span < range min)', () => {
				contgh = new $GH.ContGenHierarchy("test", 11, 99);
				expect(contgh.genCostOfRange.bind(contgh, 88, 112)).to.throw('Cannot generalize span. To parameter greater than range max.');
			});
			
			
			it('should correctly compute some generalization cost, all positive', () => {
				contgh = new $GH.ContGenHierarchy("test", 11, 99);
				expect(contgh.genCostOfRange(25, 29)).to.equal(1/22);
			});
			
			
			it('should correctly compute some generalization cost, all negative', () => {
				contgh = new $GH.ContGenHierarchy("test", -99, -11);
				expect(contgh.genCostOfRange(-20, -12)).to.equal(1/11);
			});
						
			
			it('should correctly compute some generalization cost, range mixed', () => {
				contgh = new $GH.ContGenHierarchy("test", -11, 99);
				expect(contgh.genCostOfRange(-2, 8)).to.equal(1/11);
			});
			
		});
		
	});
	
});