/// <reference path="../../typings/tsd.d.ts" />

import _ 		= require('lodash');
import fs 	= require('fs');
import path = require('path');
import * as $GH from '../../src/core/GenHierarchies';

var Graphinius = require('../../node_modules/graphinius/index.js');
var $G = Graphinius.$G;
var $Search = Graphinius.$Search;

// console.log($G);
// console.log($Search);

interface ISaNGreeAOptions {
	nr_draws: number,
	edge_min:	number,
	edge_max: number
}

enum HierarchyType {
	CONTINUOUS,
	CATEGORICAL
}

interface ISaNGreeA {
	_name: string;
	
	getOptions() : ISaNGreeAOptions;
	getHierarchy(name: string) : $GH.IContGenHierarchy | $GH.IStringGenHierarchy;
	getHierarchies() : {[name: string] : $GH.IContGenHierarchy | $GH.IStringGenHierarchy};
	setHierarchy(name: string, genh: $GH.IContGenHierarchy | $GH.IStringGenHierarchy);
	// setHierarchies(files: {[name: string] : HierarchyType}) : void;
	
	instantiateGraph() : void;
}


class SaNGreeA implements ISaNGreeA {
	/**
	 * TODO resolve ts files from graphinius in proper way
	 * - NO TYPE RESOLUTION YET -
	 */
	private _graph;
	
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
		var drawn_input = this.drawSample(str_input, this._options.nr_draws);
		
		for ( var i = 0; i < drawn_input.length; i++ ) {
			// check for empty lines at the end
			if ( !str_input[i] ) {
				break;
			}
			var line = str_input[i].replace(/\s+/g, '').split(',');
			
			// add a node to the graph
			var node = this._graph.addNode(i);
			
			// add features (columns in the dataset) 
			for (var idx in feat_idx_select) {
				node.setFeature(feat_idx_select[idx], line[idx]);
			}
			console.log(node.getFeatures());
			// console.log(parseInt(line[0]));
		}
		
		// add random edges to make dataset a graph
		// false means 'undirected'
		this._graph.createRandomEdgesSpan(this._options.edge_min, this._options.edge_max, false);
		
		console.log(this._graph.getStats());
	}
	
	
	
	private drawSample(array: any[], size: number) : any[] {
		var result = [];
		var seen = {};
		while ( size ) {
			var rand_idx = (Math.random()*array.length)|0;
			if ( seen[rand_idx] ) {
				continue;
			}
			result.push(array[rand_idx]);
			size--;
		}		
		
		return result;
	}
	
}

	
export { ISaNGreeA, SaNGreeA, ISaNGreeAOptions, HierarchyType };