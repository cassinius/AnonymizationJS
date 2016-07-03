/// <reference path="../../typings/tsd.d.ts" />

import fs 	= require('fs');
import path = require('path');
import * as $GH from '../core/GenHierarchies';
import * as $C from '../config/SaNGreeAConfig';

var $G = require('graphinius').$G;

export interface ISaNGreeAConfig {
  INPUT_FILE            : string;
  TARGET_COLUMNS        : Array<string>;
  AVERAGE_OUTPUT_RANGES : boolean;
	NR_DRAWS              : number;
	EDGE_MIN              :	number;
	EDGE_MAX              : number;
  K_FACTOR              : number;
  ALPHA                 : number;
  BETA                  : number;
  GEN_WEIGHT_VECTORS    : {};
  VECTOR                : string;
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
	
  getConfig(): ISaNGreeAConfig;
  
	getContHierarchy(name: string) : $GH.IContGenHierarchy;
	getCatHierarchy(name: string) : $GH.IStringGenHierarchy;
	
	getContHierarchies() : {[name: string] : $GH.IContGenHierarchy};
	getCatHierarchies() : {[name: string] : $GH.IStringGenHierarchy};
	
	setContHierarchy(name: string, genh: $GH.IContGenHierarchy);
	setCatHierarchy(name: string, genh: $GH.IStringGenHierarchy);
	
  readCSV(file: string, graph) : void;
	instantiateGraph(createEdges?: boolean) : void;
	anonymizeGraph() : void;
  
  outputPreprocCSV(outfile: string, skip?: {}) : void;
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
  public _alpha : number;
  public _beta : number;
  public _k_factor : number;
  public _config : ISaNGreeAConfig;
	
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
							 public config? : ISaNGreeAConfig)
	{		
		this._config = config || $C.CONFIG;
    
		
		if ( this._config.INPUT_FILE === "" ) {
			throw new Error('Input file cannot be an empty string');
		}
		if ( this._config.NR_DRAWS < 0 ) {
			throw new Error('Options invalid. Nr_draws can not be negative.');
		}
		if ( this._config.EDGE_MIN < 0 ) {
			throw new Error('Options invalid. Edge_min can not be negative.');
		}
		if ( this._config.EDGE_MAX < 0 ) {
			throw new Error('Options invalid. Edge_max can not be negative.');
		}
		if ( this._config.EDGE_MAX < this._config.EDGE_MIN ) {
			throw new Error('Options invalid. Edge_min cannot exceed edge_max.');
		}
        
		this._graph = new $G.core.Graph(this._name);
	}
  
  getConfig(): ISaNGreeAConfig {
    return this._config;
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
	
	
	
	instantiateGraph(createEdges = true ) : void {    
		this.readCSV(this._config.INPUT_FILE, this._graph);
		
    if( createEdges === true ) {
		  this._graph.createRandomEdgesSpan(this._config.EDGE_MIN, this._config.EDGE_MAX, false);
    }
	}
	
  
  instantiateCategoricalHierarchies() {
    
  }
  
  instantiateRangeHierarchies() {
    
    // var age = parseInt(line[0]);
    // min_age = age < min_age ? age : min_age;
    // max_age = age > max_age ? age : max_age;
    // node.setFeature('age', parseInt(line[0]));
  
		
		// // instantiate age hierarcy
		// var age_hierarchy = new $GH.ContGenHierarchy('age', min_age, max_age);
		// this.setContHierarchy('age', age_hierarchy);
  }
  
	
	/**
	 * @ TODO Outsource to it's own class
	 * THIS IS VERY MUCH ADAPTED TO OUR TEST CASE,
	 * GENERALIZE FOR LATER USE.... 
	 * ... look at how we handle age !!!!!
	 */
	readCSV(file: string, graph) {
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
		
		// console.log(cont_hierarchies);
		// console.log(cat_feat_idx_select);
		
		// draw sample of size draw_sample from dataset file
		// var drawn_input = this.drawSample(str_input, feat_idx_select, this._options.nr_draws);
    
    
		/**
		 * FOR COMPARISON REASONS, we're just going through the first 300 entries
		 */
    var draw = this._config.NR_DRAWS;
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
      
      node.setFeature("income", line[line.length-1]);
      
			// TODO make generic
			var age = parseInt(line[0]);
			min_age = age < min_age ? age : min_age;
			max_age = age > max_age ? age : max_age;
			node.setFeature('age', parseInt(line[0]));
		}
		
		// instantiate age hierarcy
		var age_hierarchy = new $GH.ContGenHierarchy('age', min_age, max_age);
		this.setContHierarchy('age', age_hierarchy);
	}
  
  
	/**
	 * TODO replace with array-based version that is
	 * subsequently given to the CSV class which implements
	 * a generic array-to-csv-output method
	 */
  outputPreprocCSV(outfile: string, skip?: {}) : void {
    var outstring = "",
        nodes = this._graph.getNodes(),
        node = null,
        feature = null;
		
		var rows_eliminated = 0;
    
    for ( var node_key in this._graph.getNodes() ) {
      node = nodes[node_key];
			
			/**
			 * Eliminate rows with specific 
			 * TODO just for right-to-forget, take out again,
			 * or generalize out to distinct function
			 */
			skip = skip || {};
			var prob = parseFloat(skip['prob']),
					feat = skip['feat'],
					value = skip['value'];
					
			if (prob != null && feat != null && value != null ) {
				if ( Math.random() < prob && node.getFeature(feat) === value ) {
					rows_eliminated++;
					continue;
				}
			}
      
      // we have to keep order ;)
			outstring += node.getID() + ",";
      outstring += node.getFeature('age') + ",";
      outstring += node.getFeature('workclass') + ",";
      outstring += node.getFeature('native-country') + ",";
      outstring += node.getFeature('sex') + ",";
      outstring += node.getFeature('race') + ",";
      outstring += node.getFeature('marital-status') + ",";
			outstring += node.getFeature('relationship') + ",";
			outstring += node.getFeature('occupation') + ",";
      outstring += node.getFeature('income');
      outstring += "\n";
    }
    
    var first_line = "nodeID, age, workclass, native-country, sex, race, marital-status, relationship, occupation, income \n";
		outstring = first_line + outstring;
		
		console.log("Eliminated " + rows_eliminated + " rows from a DS of " + this._graph.nrNodes() + " rows.");
		
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
		
		for ( var cl_idx in this._clusters ) {
			var cluster = this._clusters[cl_idx],
          nodes = cluster.nodes;
			
			for ( var node_id in nodes ) {
                			
				// first, let's write out the age range
				var age_range = cluster.gen_ranges['age'];
				if ( age_range[0] === age_range[1] ) {
					outstring += age_range[0] + ", ";
				}
				else if ( this._config.AVERAGE_OUTPUT_RANGES ) {
          var avg_age = ( age_range[0] + age_range[1] ) / 2.0;
          outstring += avg_age + ", ";
        }
        else {
					outstring += "[" + age_range[0] + " - " + age_range[1] + "], ";
				}
				
				// now, all the categorical features
				for (var hi in this._cat_hierarchies) {
					var h = this._cat_hierarchies[hi];
					outstring += h.getName(cluster.gen_feat[hi]) + ", ";
				}
        
        // again, generalize for all target columns
        outstring += nodes[node_id].getFeature('income');        
				outstring += "\n";
			}

		}
		
		// TODO... here we go again...
		// var out_arr = outstring.split("\n");
		var first_line = "age, workclass, native-country, sex, race, marital-status, relationship, occupation, income \n";
		outstring = first_line + outstring;
		
		fs.writeFileSync("./test/io/test_output/" + outfile + ".csv", outstring);
	}
	

	anonymizeGraph() : void {
		var S = [], // set of clusters
				nodes = this._graph.getNodes(),
				keys = Object.keys(nodes), // for length...
				current_node, // our current node ID
				candidate, // our candidate node ID
				current_best, // the currently best node
				added = {}, // mark all nodes already added to clusters
				nr_open = Object.keys(nodes).length,
				cont_costs, // continuous costs
				cat_costs, // categorical costs,
        GIL : number, // generalization information loss
        SIL : number, // structural information loss
        total_costs : number, // GIL + SIL
				best_costs, // sum of the above,
				i, j;
		
		/**
		 * MAIN LOOP OF THE SANGRIA ALGORITHM
		 */
		for ( i = 0; i < keys.length; i++) {
			current_node = nodes[keys[i]];
			if ( added[current_node.getID()] ) {
				continue;
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
					'race': current_node.getFeature('race'),
					'relationship': current_node.getFeature('relationship'),
          'occupation': current_node.getFeature('occupation')
				},
				gen_ranges : {
					'age': [current_node.getFeature('age'), current_node.getFeature('age')]
				}
			};
			
			Cl.nodes[current_node.getID()] = current_node;
			added[current_node.getID()] = true;
			nr_open--;
			
			/**
			 * SANGREEA INNER LOOP - GET NODE THAT MINIMIZES GIL
			 * and add node to this cluster;
			 */
			while ( Object.keys(Cl.nodes).length < this._config.K_FACTOR && nr_open ) {
				best_costs = Number.POSITIVE_INFINITY;
				
				for ( j = i + 1; j < keys.length; j++ ) {
					
					// get node and see if we've already added it
					candidate = nodes[keys[j]];
					if ( added[candidate.getID()] ) {
						continue;
					}
					
					// now calculate costs
					cat_costs = this.calculateCatCosts(Cl, candidate);
					cont_costs = this.calculateContCosts(Cl, candidate);
          GIL = cat_costs + cont_costs;
          
          // only compute SIL if we need to
          SIL = this._config.BETA > 0 ? this.calculateSIL(Cl, candidate) : 0;
          // console.log("SIL: " + SIL);
          
          total_costs = this._config.ALPHA * GIL + this._config.BETA * SIL;
					
					// TODO normalize costs
					// Only necessary when comparing to (N)SIL
					if ( total_costs < best_costs ) {
						best_costs = total_costs;
						current_best = candidate;
					}
				}
        				
				// add best candidate and update costs
				Cl.nodes[current_best.getID()] = current_best;
				
				// TODO refactor the following methods
				this.updateRange(Cl.gen_ranges['age'], current_best.getFeature('age'));
				this.updateLevels(Cl, current_best);
				
				// mark current best added
				added[current_best.getID()] = true;
				nr_open--;		
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
  
  
  private calculateSIL(Cl: nodeCluster, candidate) : number {
        
    var population_size = this._graph.nrNodes() - 2; // subtract the two involved nodes
        var dists = [];

        var candidate_neighbors : Array<string> = candidate.reachNodes().map((ne) => ne.node.getID());
        for ( var cl_node in Cl.nodes ) {
            var dist = population_size;
            var cl_node_neighbors : Array<string> = Cl.nodes[cl_node].reachNodes().map((ne) => ne.node.getID());
            
            for (var idx in cl_node_neighbors) {
              var neighbor = cl_node_neighbors[idx];
              if ( neighbor !== candidate.getID() && candidate_neighbors.indexOf(neighbor) !== -1) {
                --dist;
              }
            }
            
            dists.push(dist / population_size);
        }
    
    return dists.reduce((a, b) => a + b, 0) / dists.length;
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
      var cat_weights = this._config.GEN_WEIGHT_VECTORS[this._config.VECTOR]['categorical'];
			costs += cat_weights[feat] * ( ( cat_gh.nrLevels() - Cl_level ) / cat_gh.nrLevels() );			
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
    
    var range_weights = this._config.GEN_WEIGHT_VECTORS[this._config.VECTOR]['range'];
		return range_weights['age'] * cost;
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