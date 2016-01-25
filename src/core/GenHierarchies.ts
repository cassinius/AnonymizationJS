/// <reference path="../../typings/tsd.d.ts" />
import fs	= require('fs');


// Do we need a general GenHierarchy??
// interface GenHierarchy {
	
// }

// We need no explicit one for ordinal (continuous) values

// How about Zipcodes? Own algorithm??

// We need one for STRING values
// Workclass:
// Private, Self-emp-not-inc, Self-emp-inc, Federal-gov, Local-gov, State-gov, Without-pay, Never-worked
// has to allow different levels
// each level must hold an array of strings
// each lower level entry must have an index to an upper level entry

// FOR EXAMPLE: FOR THE 'WORKCLASS' CATEGORY ABOVE:
// TODO: Is level 0 always implicit and does not have to be instantiated
// => 0: [all: '*']

// => 1: [ {self: {name: 'Self', gen: all}}, 
//					{gov: {name: 'Government', gen: all}}, 
//					{other: {name: 'Other', gen: all}} 
//				]

// The lowest level array keys have to correspond to the possible values in the dataset
// TODO figure out how best to represent this (JSON FILE obviously??)
// => 2: [ {Private: {name: 'Private', gen: self}}, 
//					{Self-emp-not-inc: {name: 'Self-emp-not-inc', gen: self}},
//					{Self-emp-inc: {name: 'Self-emp-inc', gen: self}},
//					{Federal-gov: {name: 'Federal-gov', gen: gov}},
//					{Local-gov: {name: 'Local-gov', gen: gov}},
//					{State-gov: {name: 'State-gov', gen: gov}},
//					{Without-pay: {name: 'Without-pay', gen: other}},
//					{Never-worked: {name: 'Never-worked', gen: other}}
//				]

interface StringGenJSON {
	name: string;
	levels: Array<IStringGenHierarchyLevel>;
}


interface IStringGenHierarchy {
	_name: string;
	
	readFromJson(json: StringGenJSON) : void;
	getLevels() : Array<IStringGenHierarchyLevel>;
	getLevelEntry(key: string) : number;
	getGeneralizationOf(key: string) : string;
}


interface IStringGenHierarchyLevel {
	id: number;
	// With arrays, we actually do not need cost..?
	cost: number;
	entries: {[key: string] : IStringGHLevelEntry};
}


interface IStringGHLevelEntry {
	name: string;
	gen: string;
}


class StringGenHierarchy implements IStringGenHierarchy {
	private _levels : Array<IStringGenHierarchyLevel> = [];
	public _name;
	
	// Read from JSON file per default
	constructor(public filePath: string) {
		var json : StringGenJSON = JSON.parse(fs.readFileSync(filePath).toString());
		this._name = json.name;
		this.readFromJson(json);
	}
	
	/**
	 * for now, we just assume the JSON is flawlessly written
	 * ... except for the 0 level
	 */
	readFromJson(json: StringGenJSON) : void {
		if ( !json.levels
			|| !json.levels[0]
			|| !json.levels[0].entries
			|| Object.keys(json.levels[0].entries).length !== 1) {
				throw new Error("JSON invalid. Level 0 does not contain exactly 1 entry.");
			}		
		
		for ( var level_idx in json.levels ) {
			var json_level : IStringGenHierarchyLevel = json.levels[level_idx];
			var level : IStringGenHierarchyLevel = ({
				"id": json_level.id,
				"cost": json_level.cost,
				"entries": {}
			});
			for ( var entry_key in json_level.entries ) {
				var json_entry : IStringGHLevelEntry = json_level.entries[entry_key];
				level.entries[entry_key] = json_entry;
			}
			this._levels.push(level);
		}
		// this._levels = json.levels;
	}
	
	getLevels() : Array<IStringGenHierarchyLevel> {
		return this._levels;
	}
	
	
	getLevelEntry(key: string) : number {
		var i = this._levels.length;
		while ( i-- ) {
			var entry = this._levels[i].entries[key];
			if ( entry ) {
				return i;
			}
		}
		return undefined;
	}

	
	/**
	 * Should we include level information in the return value?
	 */
	getGeneralizationOf(key: string) : string {
		// if (this._levels[0].entries[key]) {
		// 	throw new Error("root cannot be generalized.");
		// }
		var i = this._levels.length;
		while ( i-- ) {
			var entry = this._levels[i].entries[key];
			if ( entry ) {
				return entry.gen;
			}
		}
		return undefined;
	}
	
}


export { IStringGenHierarchy, StringGenHierarchy };