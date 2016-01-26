/// <reference path="../../typings/tsd.d.ts" />

import _ 		= require('lodash');
import fs 	= require('fs');
import path = require('path');
import * as $GH from '../../src/core/GenHierarchies';

var Graphinius = require('../../node_modules/graphinius/index.js');
var $G = Graphinius.$G;
var $Search = Graphinius.$Search;

console.log($G);
console.log($Search);

interface ISaNGreeAOptions {
	nr_draws: number;
	edge_min:	number;
	edge_max: number;
}

enum HierarchyType {
	CONTINUOUS,
	CATEGORICAL
}


/**
 *  at each turn, we need to know the nodes a cluster contains,
 *  at which levels it's attributes are (workclass, native-country),
 *  the range costs for it's numeric attributes
 */
interface nodeCluster {
	nodes : {[id: string] : any};
	levels : {[id: string] : number};
	rangeCost : {[id: string] : number[]};
	
}


interface ISaNGreeA {
	_name: string;
	_graph;
	
	getOptions() : ISaNGreeAOptions;
	getHierarchy(name: string) : $GH.IContGenHierarchy | $GH.IStringGenHierarchy;
	getHierarchies() : {[name: string] : $GH.IContGenHierarchy | $GH.IStringGenHierarchy};
	setHierarchy(name: string, genh: $GH.IContGenHierarchy | $GH.IStringGenHierarchy);
	// setHierarchies(files: {[name: string] : HierarchyType}) : void;
	
	instantiateGraph() : void;
	anonymizeGraph(k: number, alpha?: number, beta?: number) : void;
}


class SaNGreeA implements ISaNGreeA {
	/**
	 * TODO resolve ts files from graphinius in proper way
	 * - NO TYPE RESOLUTION YET -
	 */
	public _graph;
	
	private _options : ISaNGreeAOptions;
	private _hierarchies : {[name: string] : $GH.IContGenHierarchy | $GH.IStringGenHierarchy} = {};
	
	constructor( public _name: string = "default", 
							 private _input_file : string,
							 opts? : ISaNGreeAOptions)
	{
		if ( _input_file === "" ) {
			throw new Error('Input file cannot be an empty string');
		}
		this._options = opts || {
			nr_draws: 300,
			edge_min: 1,
			edge_max: 10
		}
		if ( this._options.nr_draws < 0 ) {
			throw new Error('Options invalid. Nr_draws can not be negative.');
		}
		if ( this._options.edge_min < 0 ) {
			throw new Error('Options invalid. Edge_min can not be negative.');
		}
		if ( this._options.edge_max < 0 ) {
			throw new Error('Options invalid. Edge_max can not be negative.');
		}
		if ( this._options.edge_max < this._options.edge_min ) {
			throw new Error('Options invalid. Edge_max cannot exceed edge_min.');
		}
	}
	
	getOptions() : ISaNGreeAOptions {
		return this._options;
	}
	
	getHierarchies() : {[name: string] : $GH.IContGenHierarchy | $GH.IStringGenHierarchy} {
		return this._hierarchies;
	}
	
	getHierarchy(name: string) : $GH.IContGenHierarchy | $GH.IStringGenHierarchy {
		return this._hierarchies[name];
	}
	
	setHierarchy(name: string, genh: $GH.IContGenHierarchy | $GH.IStringGenHierarchy) {
		this._hierarchies[name] = genh;
	}	
	
	/**
	 * !!! HIERARCHIES := COLUMNS !!!
	 * TODO test for empty string / non-existing files
	 */	
	// setHierarchies(files: {[name: string] : HierarchyType}) : void {
	// 	var gen_h : $GH.IContGenHierarchy | $GH.IStringGenHierarchy;
	// 	for ( var file in files ) {
	// 		if ( files[file] === HierarchyType.CATEGORICAL ) {
	// 			gen_h = new $GH.StringGenHierarchy(file);
	// 		}
	// 		else if ( files[file] === HierarchyType.CONTINUOUS ) {
	// 			// gen_h = new $GH.ContGenHierarchy(file);				
	// 		}
	// 	}
	// }
	
	instantiateGraph() : void {
		// var cols = Object.keys(this._hierarchies);
		this._graph = new $G.Graph("adults");
		// console.dir(this._graph);
		this.readCSV(this._input_file, this._graph);
	}
	
	
	/**
	 * THIS IS VERY MUCH ADAPTED TO OUR TEST CASE,
	 * GENERALIZE FOR LATER USE.... 
	 * ... look at how we handle age !!!!!
	 */
	private readCSV(file: string, graph) {
		var str_input = fs.readFileSync(file).toString().split('\n');
		var str_cols = str_input.shift().replace(/\s+/g, '').split(',');
		var hierarchies = Object.keys(this._hierarchies);
		
		// TODO make generic!
		var min_age = Number.POSITIVE_INFINITY;
		var max_age = Number.NEGATIVE_INFINITY;
		
		console.log(hierarchies);
		console.log(str_cols);
		
		// construct the index array for feature selection
		var feat_idx_select : {[idx: number] : string} = {};
		str_cols.forEach((col, idx) => {
			if (_.indexOf(hierarchies, col) >= 0) {
				feat_idx_select[idx] = col;
			}
		});
		console.log(feat_idx_select);
		
		// draw sample of size draw_sample from dataset file
		var drawn_input = this.drawSample(str_input, feat_idx_select, this._options.nr_draws);
		
		for ( var i = 0; i < drawn_input.length; i++ ) {
			// check for empty lines at the end
			if ( !str_input[i] ) {
				break;
			}
			var line = drawn_input[i];
			
			// add a node to the graph
			var node = this._graph.addNode(i);
			
			// add features (columns in the dataset) 
			for (var idx in feat_idx_select) {
				node.setFeature(feat_idx_select[idx], line[idx]);
			}
<<<<<<< HEAD
			// TODO make generic
			var age = parseInt(line[0]);
			min_age = age < min_age ? age : min_age;
			max_age = age > max_age ? age : max_age;
			node.setFeature('age', parseInt(line[0]));
			
			// console.log(node.getFeatures());
			// console.log(parseInt(line[0]));
=======
			node.setFeature('age', parseInt(line[0]));
			
			// console.log(node.getFeatures());
>>>>>>> 4d7437553550ee767284d768f1d9c04ca8599fc8
		}
		
		// instantiate age hierarcy
		var age_hierarchy = new $GH.ContGenHierarchy('age', min_age, max_age);
		this.setHierarchy('age', age_hierarchy);
		
		// add random edges to make dataset a graph
		// false means 'undirected'
		this._graph.createRandomEdgesSpan(this._options.edge_min, this._options.edge_max, false);
		
		// console.log(this._graph.getStats());
		// console.log(this.getHierarchies());
	}
	
	
<<<<<<< HEAD
	private drawSample(array: any[], feat_idx_select : {[idx: number] : string}, size: number) : any[] {
		var result = [];
		var seen = {};
=======
	
	private drawSample(array: any[], feat_idx_select: {}, size: number) : any[] {
		var result = [],
				seen = {},
				feat_idx : string,
				line_arr : any[],
				entry: string,
				entry_valid : boolean,
				str_hierarchy : $GH.ContGenHierarchy | $GH.IStringGenHierarchy;
				
>>>>>>> 4d7437553550ee767284d768f1d9c04ca8599fc8
		while ( size ) {
			var rand_idx = (Math.random()*array.length)|0;
			// sample already taken?
			if ( seen[rand_idx] ) {
				continue;
			}
<<<<<<< HEAD
			var line = array[rand_idx].replace(/\s+/g, '').split(',');
			var line_valid = true;
			for (var idx in feat_idx_select) {
				// console.log(line[idx]);
				
				var hierarchy = this.getHierarchy(feat_idx_select[idx]);
				if ( hierarchy instanceof $GH.StringGenHierarchy && !hierarchy.getLevelEntry(line[idx])) {
					line_valid = false;
				}
			}
			
			if( line_valid ) {
				result.push(line);
=======
			// check if relevant entries are 'normalized'
			// that is "contained in the relevant hierarchy"
			line_arr = array[rand_idx].replace(/\s+/g, '').split(',');
			entry_valid = true;
			for ( feat_idx in  feat_idx_select ) {				
				entry = line_arr[feat_idx];
				str_hierarchy = this.getHierarchy(feat_idx_select[feat_idx]);
				if ( str_hierarchy instanceof $GH.StringGenHierarchy && !str_hierarchy.getLevelEntry(entry) ) {
					entry_valid = false;
				}
			}
			
			if ( entry_valid ) {
				result.push(line_arr);
>>>>>>> 4d7437553550ee767284d768f1d9c04ca8599fc8
				size--;
			}
		}		
		
		return result;
	}
	

	
	

	anonymizeGraph(k: number, alpha: number = 1, beta: number = 0) : void {
		var S = [], // set of clusters
				N = this._graph.getNodes(),
				keys = Object.keys(N), // for length...
				X, // our current node ID
				// node_x, // our current node object
				Y, // our candidate node ID
				// node_y, // our candidate node object
				current_best, // the currently best node
				added = {}, // mark all nodes already added to clusters
				cont_costs, // continuous costs
				cat_costs, // categorical costs,
				best_costs, // sum of the above
				i, j;
		
		/**
		 * MAIN LOOP OF THE SANGRIA ALGORITHM
		 * every time this loop runs, we have
		 * to build a new cluster
		 */
		for ( i = 0; i < keys.length; i++) {
			X = N[i];
			// console.log(X.getFeatures());
			if ( added[X.getID()] ) {
				continue; // we've already seen this one
			}
			
			// cluster, has to be 'renewed' every cycle
			// we don't want to write over the old one..
			// TODO make generic
			// TODO stop union type nonsense
			
			var Cl : nodeCluster = { 
				nodes : {},
				levels : {
					'workclass': Number.POSITIVE_INFINITY,
					'native-country': Number.POSITIVE_INFINITY
				},
				rangeCost : {
					'age': [X.getFeature('age'), X.getFeature('age')]
				}
			};
			
			Cl.nodes[X.getID()] = X; // add node to cluster
			added[X.getID()] = true; // mark added
			
			/**
			 * SANGREEA INNER LOOP - GET NODE THAT MINIMIZES GIL
			 * and add node to this cluster;
			 * TODO fix loop
			 */
			while ( Object.keys(Cl.nodes).length < k && i < keys.length ) { // we haven't fulfilled k-anonymity yet...
				best_costs = Number.POSITIVE_INFINITY;
				
				for ( j = 0; j < keys.length; j++ ) {
					// get node and see if we've already added it
					Y = N[j];
					if ( added[Y.getID()] ) {
						continue;
					}
					
					// now calculate costs
					cat_costs = this.calculateCatCosts(Cl, Y);
					cont_costs = this.calculateContCosts(Cl, Y);
					// console.log(Y.getID() + " " + cont_costs);
					
					if ( (cat_costs + cont_costs) < best_costs ) {
						best_costs = (cat_costs + cont_costs);
						current_best = Y;
					}
				}
				
				// console.log("Best costs: " + best_costs);
				// console.log("Best node: " + current_best.getID());
				
				// console.log("Node to add: " + current_best);
				
				// add best candidate and update costs
				Cl.nodes[current_best.getID()] = current_best;
				this.updateRange(Cl.rangeCost['age'], current_best.getFeature('age'));
				
				// mark current best added
				added[current_best.getID()] = true;				
			}
			
			// here we have finished our cluster
			// do we push it to the set of clusters
			// or do we have to disperse it?			
			// if (...)			
			S.push(Cl); // add cluster to clusters
		}
		
		console.dir(S);
		console.log("Built " + S.length + " clusters.");
		
	}
	
	private calculateCatCosts(Cl: nodeCluster, Y) {
		var init_level = Number.POSITIVE_INFINITY
		return 0;
	}
	
	/**
	 * TODO MAKE GENERIC
	 */
	private calculateContCosts(Cl: nodeCluster, Y) {
		// TODO make generic
		var age_range = Cl.rangeCost['age'];
		// expand range
		var new_range: number[] = this.expandRange(age_range, Y.getFeature('age'));
		// calculate cost
		var age_hierarchy = this.getHierarchy('age');
		var cost = age_hierarchy instanceof $GH.ContGenHierarchy? age_hierarchy.genCostOfRange(new_range[0], new_range[1]) : 0;
		// console.log("Range cost: " + cost);
		return cost;
	}
	
	private expandRange(range: number[], nr: number) : number[] {
		var min = nr < range[0] ? nr : range[0];
		var max = nr > range[1] ? nr : range[1];
		// console.log([min, max]);
		return [min, max];
	}
	
	private updateRange(range: number[], nr: number) : void {
		range[0] < range[0] ? nr : range[0];
		range[1] = nr > range[1] ? nr : range[1];
	}
	
	
}

	
export { ISaNGreeA, SaNGreeA, ISaNGreeAOptions, HierarchyType };