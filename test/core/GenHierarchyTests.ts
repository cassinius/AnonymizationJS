/// <reference path="../../typings/tsd.d.ts" />

import * as chai from 'chai';
import * as $GH from '../../src/core/GenHierarchies';

var expect = chai.expect,
		assert = chai.assert,
		strgh : $GH.IStringGenHierarchy,
		zerolevellt1 = './test/input/test_data/InvalidGH0.json',
		zerolevelgt1 = './test/input/test_data/InvalidGH2.json',
		workclass_file = './test/input/test_data/WorkClassGH.json',
		levels;


describe('Generalization Hierarchies Tests: ', () => {
	
	describe('Basic instantiation tests', () => {
		
		it('should throw an error if level 0 does not have exactly 1 entry', () => {
			assert.throw(function () {
				new $GH.StringGenHierarchy(zerolevellt1)
			}, 'JSON invalid. Level 0 does not contain exactly 1 entry.');
		});
		
		
		it('should throw an error if level 0 does not have exactly 1 entry', () => {
			assert.throw(function () {
				new $GH.StringGenHierarchy(zerolevelgt1)
			}, 'JSON invalid. Level 0 does not contain exactly 1 entry.');
		});
		
		
		it('should correctly instantiate the workclass example', () => {
			strgh = new $GH.StringGenHierarchy(workclass_file);
			levels = strgh.getLevels();
			var length = levels.length;
			
			expect(length).to.equal(3);
			// console.dir(levels[0]);
			// console.dir(levels[1]);
			// console.dir(levels[2]);
			
			// Let's go through the levels and check the costs...
			for ( var i = 0; i < length; i++ ) {
				expect(levels[i].cost).to.equal(1-i/(length-1));
			}
			
			// Let's go through the levels and check the entries' length...
			expect(Object.keys(levels[0].entries).length).to.equal(1);
			expect(Object.keys(levels[1].entries).length).to.equal(3);
			expect(Object.keys(levels[2].entries).length).to.equal(8);
		});
		
		
		it('should return undefined as level of a non-existing entry', () => {
			strgh = new $GH.StringGenHierarchy(workclass_file);
			expect(strgh.getLevelEntry("menotexistsjabbajabba")).to.be.undefined;
		});
		
		
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
			// expect(strgh.getGeneralizationOf.bind(strgh, 'all')).to.throw('root cannot be generalized.');
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
				
	});
	
});