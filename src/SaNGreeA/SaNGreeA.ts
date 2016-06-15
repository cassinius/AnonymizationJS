/// <reference path="../../typings/tsd.d.ts" />

import fs 	= require('fs');
import path = require('path');
import * as $GH from '../core/GenHierarchies';

var $G = require('graphinius').$G;

console.log($G);


export interface ISaNGreeAOptions {
	nr_draws: number;
	edge_min:	number;
	edge_max: number;
}


export enum HierarchyType {
	CONTINUOUS,
	CATEGORICAL
}


/**
 *  at each turn, we need to know the nodes a cluster contains,
 *  at which levels it's attributes are (workclass, native-country),
 *  the range costs for it's numeric attributes
 */
export interface nodeCluster {
	nodes : {[id: string] : any};
	gen_feat : {[id: string] : string};
	gen_ranges : {[id: string] : number[]};
}


export interface ISaNGreeA {
	_name: string;
	_graph;
	_clusters : Array<nodeCluster>;
	
	getOptions() : ISaNGreeAOptions;
	
	getContHierarchy(name: string) : $GH.IContGenHierarchy;
	getCatHierarchy(name: string) : $GH.IStringGenHierarchy;
	
	getContHierarchies() : {[name: string] : $GH.IContGenHierarchy};
	getCatHierarchies() : {[name: string] : $GH.IStringGenHierarchy};
	
	setContHierarchy(name: string, genh: $GH.IContGenHierarchy);
	setCatHierarchy(name: string, genh: $GH.IStringGenHierarchy);
	
	instantiateGraph() : void;
	anonymizeGraph(k: number, alpha?: number, beta?: number) : void;
  
  outputPreprocCSV(outfile: string) : void;
	outputAnonymizedCSV(outfile: string) : void;
}


class SaNGreeA implements ISaNGreeA {
	/**
	 * TODO resolve ts files from graphinius in proper way
	 * - NO TYPE RESOLUTION YET -
	 */
	public _graph;
	public _clusters : Array<nodeCluster>;
	public _weights;	
	private _options : ISaNGreeAOptions;
	
	/**
	 * We're building everything in the algorithm around our hierarchies
	 * That means, we automatically consider all and only the columns in 
	 * the data file (as long as they exist) which are specified in a
	 * hierarchy given to the algorithm
	 * 
	 * This also means that any range-based hierarchies must be updated
   * on the fly with min/max range
	 */
	private _cont_hierarchies : {[name: string] : $GH.IContGenHierarchy} = {};
	private _cat_hierarchies : {[name: string] : $GH.IStringGenHierarchy} = {};
	
	
	constructor( public _name: string = "default", 
							 private _input_file : string,
							 opts? : ISaNGreeAOptions,
							 weights? : {})
	{
		// console.log("Given weights: " + weights);
		
		/** 
     * TODO make generic (hack!!)
     * TODO wait for all Hierarchies to be set, so - 
     * calculate only at beginning of actual anonymization run?
     */ 
		this._weights = weights || {
			'age': 1/6,
			'workclass': 1/6,
			'native-country': 1/6,
			'sex': 1/6,
			'race': 1/6,
			'marital-status': 1/6
		}
		
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
	
	getContHierarchies() : {[name: string] : $GH.IContGenHierarchy} {
		return this._cont_hierarchies;
	}
	
	getCatHierarchies() : {[name: string] : $GH.IStringGenHierarchy} {
		return this._cat_hierarchies;
	}
	
	getContHierarchy(name: string) : $GH.IContGenHierarchy {
		return this._cont_hierarchies[name];
	}
	
	getCatHierarchy(name: string) : $GH.IStringGenHierarchy {
		return this._cat_hierarchies[name];
	}
	
	setContHierarchy(name: string, genh: $GH.IContGenHierarchy) {
		this._cont_hierarchies[name] = genh;
	}
	
	setCatHierarchy(name: string, genh: $GH.IStringGenHierarchy) {
		this._cat_hierarchies[name] = genh;
	}	
	
	
	
	instantiateGraph(name: string = "default") : void {
		// var cols = Object.keys(this._hierarchies);
		this._graph = new $G.core.Graph("adults");
		// console.dir(this._graph);
		this.readCSV(this._input_file, this._graph);
		/**
     * add random edges to make dataset a graph
     * false means 'undirected'
     * @TODO needs separate test cases and an implementation 
     * of a network distance function (SIL) before use
     */		
		this._graph.createRandomEdgesSpan(this._options.edge_min, this._options.edge_max, false);
	}
	
	
	/**
	 * @ TODO Outsource to it's own class
	 * THIS IS VERY MUCH ADAPTED TO OUR TEST CASE,
	 * GENERALIZE FOR LATER USE.... 
	 * ... look at how we handle age !!!!!
	 */
	private readCSV(file: string, graph) {
		var str_input = fs.readFileSync(file).toString().split('\n');
		var str_cols = str_input.shift().replace(/\s+/g, '').split(',');
		var cont_hierarchies = Object.keys(this._cont_hierarchies);
		var cat_hierarchies = Object.keys(this._cat_hierarchies);
		
		/**
		 * @TODO make generic!
		 */
		var min_age = Number.POSITIVE_INFINITY;
		var max_age = Number.NEGATIVE_INFINITY;
		
		// console.log(cont_hierarchies);
		// console.log(cat_hierarchies);
		// console.log(str_cols);
		
		/**
		 * Construct the index array for feature selection
		 */
		var cont_feat_idx_select : {[idx: number] : string} = {};
		str_cols.forEach((col, idx) => {
			if ( cont_hierarchies.indexOf(col) !== -1 ) {
				cont_feat_idx_select[idx] = col;
			}
		});
		var cat_feat_idx_select : {[idx: number] : string} = {};
		str_cols.forEach((col, idx) => {
			if ( cat_hierarchies.indexOf(col) !== -1 ) {
				cat_feat_idx_select[idx] = col;
			}
		});
		
		// console.log(cont_feat_idx_select);
		
		// draw sample of size draw_sample from dataset file
		// var drawn_input = this.drawSample(str_input, feat_idx_select, this._options.nr_draws);
    
    
		/**
		 * FOR COMPARISON REASONS, we're just going through the first 300 entries
		 */
		var draw = 300;
		for ( var i = 0; i < draw; i++ ) { // drawn_input.length
			// check for empty lines at the end
			if ( !str_input[i] ) {
				continue;
			}
			var line = str_input[i].replace(/\s+/g, '').split(',');
			
			var line_valid = true;
			for (var idx in cat_feat_idx_select) {
				// console.log(line[idx]);
				var cat_hierarchy = this.getCatHierarchy(cat_feat_idx_select[idx]);
				if ( cat_hierarchy && !cat_hierarchy.getLevelEntry(line[idx])) {
					// we have found an entry unspecified in our gen hierarchy
					line_valid = false;
				}
			}
			for (var idx in cont_feat_idx_select) {
				var cont_hierarchy = this.getContHierarchy(cont_feat_idx_select[idx]);
				if ( +line[idx] !== +line[idx] ) {
					// we have a numeric value that's not a numeric value
					line_valid = false;
				}
			}
			if ( !line_valid ) {
				draw++;
				continue;
			}
			
			// add a node to the graph
			var node = this._graph.addNode(i);
			
			// add features (columns in the dataset) 
			for (var idx in cat_feat_idx_select) {
				node.setFeature(cat_feat_idx_select[idx], line[idx]);
			}
			for (var idx in cont_feat_idx_select) {
				node.setFeature(cont_feat_idx_select[idx], +line[idx]);
			}
			// TODO make generic
			var age = parseInt(line[0]);
			min_age = age < min_age ? age : min_age;
			max_age = age > max_age ? age : max_age;
			node.setFeature('age', parseInt(line[0]));
			
			// console.log(node.getFeatures());      
			// console.log(line);
			// console.log(parseInt(line[0]));
		}
		
		// instantiate age hierarcy
		var age_hierarchy = new $GH.ContGenHierarchy('age', min_age, max_age);
		this.setContHierarchy('age', age_hierarchy);
    
    /**
     * Just for sake of comparison 
     */
    
	}
  
  
  outputPreprocCSV(outfile: string) : void {
    var outstring = "",
        nodes = this._graph.getNodes(),
        node = null,
        feature = null;
    
    for ( var node_key in this._graph.getNodes() ) {
      node = nodes[node_key];
      
      // we have to keep order ;)
			outstring += node.getID() + ",";
      outstring += node.getFeature('age') + ",";
      outstring += node.getFeature('workclass') + ",";
      outstring += node.getFeature('native-country') + ",";
      outstring += node.getFeature('sex') + ",";
      outstring += node.getFeature('race') + ",";
      outstring += node.getFeature('marital-status');      
      outstring += "\n";      
    }
    
    var first_line = "nodeID, age, workclass, native-country, sex, race, marital-status \n";
		outstring = first_line + outstring;
		
		fs.writeFileSync("./test/io/test_output/" + outfile + ".csv", outstring);
  }
  
	
	
	/**
	 * On conditional request, we can also draw a random sample
	 */
	// private drawSample(array: any[], feat_idx_select: {}, size: number) : any[] {
	// 	var result = [],
	// 			seen = {},
	// 			feat_idx : string,
	// 			line_arr : any[],
	// 			entry: string,
	// 			entry_valid : boolean,
	// 			str_hierarchy : $GH.ContGenHierarchy | $GH.IStringGenHierarchy;
				
	// 	while ( size ) {
	// 		var rand_idx = (Math.random()*array.length)|0;
	// 		// sample already taken?
	// 		if ( seen[rand_idx] ) {
	// 			continue;
	// 		}
	// 		var line = array[rand_idx].replace(/\s+/g, '').split(',');
	// 		var line_valid = true;
	// 		for (var idx in feat_idx_select) {
	// 			// console.log(line[idx]);
	// 			var cat_hierarchy = this.getCatHierarchy(feat_idx_select[idx]);
	// 			if ( cat_hierarchy && !cat_hierarchy.getLevelEntry(line[idx])) {
	// 				// we have found an entry unspecified in our gen hierarchy
	// 				line_valid = false;
	// 			}
	// 			var cont_hierarchy = this.getContHierarchy(feat_idx_select[idx]);
	// 			if ( +line[idx] !== +line[idx] ) {
	// 				// we have a numeric value that's not a numeric value
	// 				line_valid = false;
	// 			}
	// 		}
			
	// 		if( line_valid ) {
	// 			result.push(line);
	// 			size--;
	// 		}
	// 	}		
		
	// 	return result;
	// }
  
  
  
	/**
	 * TODO better way to do this than manually 
	 * constructing the string ?!?!
	 */
	outputAnonymizedCSV(outfile: string) : void {		
		var outstring = "";
		// for (var hi in this._hierarchies) {
		// 	outstring += hi + ", ";
		// }
		// outstring = outstring.slice(0, -2) + "\n";
		
		for ( var cl_idx in this._clusters ) {
			var cluster = this._clusters[cl_idx];
					
			for ( var count in cluster.nodes ) {				
				// first, let's write out the age range
				var age_range = cluster.gen_ranges['age'];
				if ( age_range[0] === age_range[1] ) {
					outstring += age_range[0] + ", ";
				}
				else {
					outstring += "[" + age_range[0] + " - " + age_range[1] + "], ";
				}
				
				// now, all the categorical features
				for (var hi in this._cat_hierarchies) {
					var h = this._cat_hierarchies[hi];
					outstring += h.getName(cluster.gen_feat[hi]) + ", ";
				}
				outstring = outstring.slice(0, -2) + "\n";
			}

		}
		
		// TODO... here we go again...
		// var out_arr = outstring.split("\n");
		var first_line = "age, workclass, native-country, sex, race, marital-status \n";
		outstring = first_line + outstring;
		
		fs.writeFileSync("./test/io/test_output/" + outfile + ".csv", outstring);
	}
		
	

	anonymizeGraph(k: number, alpha: number = 1, beta: number = 0) : void {
		var S = [], // set of clusters
				N = this._graph.getNodes(),
				keys = Object.keys(N), // for length...
				current_node, // our current node ID
				candidate, // our candidate node ID
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
			current_node = N[keys[i]];
			// console.log(X.getFeatures());
			if ( added[current_node.getID()] ) {
				continue; // we've already seen this one
			}
			
			/**
       * NODE CLUSTER
       * this should become it's own class..
       * @TODO make generic
       * @TODO look up extendable TS interfaces 
       *       or enums (runtime add / delete)
       */			
			var Cl : nodeCluster = { 
				nodes : {},
				gen_feat : {
					'workclass': current_node.getFeature('workclass'),
					'native-country': current_node.getFeature('native-country'),
					'marital-status': current_node.getFeature('marital-status'),
					'sex': current_node.getFeature('sex'),
					'race': current_node.getFeature('race')
				},
				gen_ranges : {
					'age': [current_node.getFeature('age'), current_node.getFeature('age')]
				}
			};
			
			Cl.nodes[current_node.getID()] = current_node; // add node to cluster
			added[current_node.getID()] = true; // mark added
			
			/**
			 * SANGREEA INNER LOOP - GET NODE THAT MINIMIZES GIL
			 * and add node to this cluster;
			 * TODO fix loop
			 */
			while ( Object.keys(Cl.nodes).length < k && i < keys.length ) { // we haven't fulfilled k-anonymity yet...
				best_costs = Number.POSITIVE_INFINITY;
				
				for ( j = 0; j < keys.length; j++ ) {
					// get node and see if we've already added it
					candidate = N[keys[j]];
					if ( added[candidate.getID()] ) {
						continue;
					}
					
					// now calculate costs
					cat_costs = this.calculateCatCosts(Cl, candidate);
					cont_costs = this.calculateContCosts(Cl, candidate);
					// console.log(Y.getID() + " " + cont_costs);
					
					// TODO normalize costs
					// Only necessary when comparing to (N)SIL
					if ( (cat_costs + cont_costs) < best_costs ) {
						best_costs = (cat_costs + cont_costs);
						current_best = candidate;
					}
				}
				
				// console.log("Best costs: " + best_costs);
				// console.log("Best node: " + current_best.getID());				
				// console.log("Node to add: " + current_best);
        				
				// add best candidate and update costs
				Cl.nodes[current_best.getID()] = current_best;
				
				// TODO refactor the following methods
				this.updateRange(Cl.gen_ranges['age'], current_best.getFeature('age'));
				this.updateLevels(Cl, current_best);
				
				// mark current best added
				added[current_best.getID()] = true;				
			}
			
			// here we have finished our cluster
			// do we push it to the set of clusters
			// or do we have to disperse it?			
			// if (...)			
			S.push(Cl); // add cluster to clusters
		}
		
		// console.dir(S);
		console.log("Built " + S.length + " clusters.");
		this._clusters = S;
	}
	

	private updateLevels(Cl: nodeCluster, Y) : void {		
		for (var feat in this._cat_hierarchies) {
			var cat_gh = this.getCatHierarchy(feat);
			
			var Cl_feat = Cl.gen_feat[feat];
			var Y_feat = Y.getFeature(feat);
			var Cl_level = cat_gh.getLevelEntry(Cl_feat);
			var Y_level = cat_gh.getLevelEntry(Y_feat);
			// bark up the (right) tree (root should gen to itself)
			while( Cl_feat !== Y_feat ) {
				// console.log("Comparing features: " + Cl_feat + ", " + Y_feat);
				// console.log("Comparing levels: " + Cl_level + ", " + Y_level);
				
				Y_feat = cat_gh.getGeneralizationOf(Y_feat);
				Y_level = cat_gh.getLevelEntry(Y_feat);
				if ( Cl_level > Y_level ) {
					Cl_feat = cat_gh.getGeneralizationOf(Cl_feat);
					Cl_level = cat_gh.getLevelEntry(Cl_feat);
				}
			}
			// console.log("Should equal: " + Cl_feat + ", " + Y_feat);
			Cl.gen_feat[feat] = Cl_feat;			
		}
	}
	
	
	private calculateCatCosts(Cl: nodeCluster, Y) {
		var costs = 0;
		
		for (var feat in this._cat_hierarchies) {	
			var cat_gh = this.getCatHierarchy(feat);
					
			var Cl_feat = Cl.gen_feat[feat];
			var Y_feat = Y.getFeature(feat);
			var Cl_level = cat_gh.getLevelEntry(Cl_feat);
			var Y_level = cat_gh.getLevelEntry(Y_feat);
			// bark up the (right) tree (root should gen to itself)
			while( Cl_feat !== Y_feat ) {
				// console.log("Comparing features: " + Cl_feat + ", " + Y_feat);
				// console.log("Comparing levels: " + Cl_level + ", " + Y_level);
				
				Y_feat = cat_gh.getGeneralizationOf(Y_feat);
				Y_level = cat_gh.getLevelEntry(Y_feat);
				if ( Cl_level > Y_level ) {
					Cl_feat = cat_gh.getGeneralizationOf(Cl_feat);
					Cl_level = cat_gh.getLevelEntry(Cl_feat);
				}
			}
			costs += this._weights[feat] * ( ( cat_gh.nrLevels() - Cl_level ) / cat_gh.nrLevels() );			
		}	
		return costs / Object.keys(this._cat_hierarchies).length;
	}
	
	
	/**
	 * TODO MAKE GENERIC
	 */
	private calculateContCosts(Cl: nodeCluster, Y) {
		// TODO make generic
		var age_range = Cl.gen_ranges['age'];
		// expand range
		var new_range: number[] = this.expandRange(age_range, Y.getFeature('age'));
		// calculate cost
		var age_hierarchy = this.getContHierarchy('age');
		var cost = age_hierarchy instanceof $GH.ContGenHierarchy? age_hierarchy.genCostOfRange(new_range[0], new_range[1]) : 0;
		// console.log("Range cost: " + cost);
		return this._weights['age'] * cost;
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

	
export { SaNGreeA };