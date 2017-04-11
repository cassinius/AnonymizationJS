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

export interface StringGenJSON {
	name: string;
	entries: {[key: string] : IStringGHEntry};
}


export interface IStringGenHierarchy {
	_name: string;
	
	readFromJson(json: StringGenJSON) : void;
	
	nrLevels() : number;
	getEntries(): {[key: string] : IStringGHEntry};
	getLevelEntry(key: string) : number;
	getGeneralizationOf(key: string) : string;
	// TODO write test
	getName(key: string) : string;
}


export interface IStringGHEntry {
	name: string;
	gen: string;
	level: number;
}


class StringGenHierarchy implements IStringGenHierarchy {
	private _entries: {[key: string] : IStringGHEntry} = {};
	private _nr_levels : number = 0;
	public _name : string;
	
	// Read from JSON file per default
	constructor(public file: string) {
		let json : StringGenJSON;

		if ( typeof window === 'undefined' ) {
			json = JSON.parse(fs.readFileSync(file).toString());
		}
		else {
			json = JSON.parse(file);
		}

		this._name = json.name;
		this.readFromJson(json);
	}
	
	/**
	 * for now, we just assume the JSON is flawlessly written
	 * ... except for the 0 level
	 */
	readFromJson(json: StringGenJSON) : void {
		var level_1s = 0;
		
		for ( var entry_idx in json.entries ) {
			var json_entry : IStringGHEntry = json.entries[entry_idx];
			var level = +json_entry.level;
			if ( level === 0 ) {
				level_1s++;
			}
			if ( level > this._nr_levels ) {
				this._nr_levels = level;
			}
			var entry : IStringGHEntry = ({
				"name": json_entry.name,
				"gen": json_entry.gen,
				"level": json_entry.level
			});
			this._entries[entry_idx] = entry;
		}
		
		if ( level_1s !== 1) {
			throw new Error("JSON invalid. Level 0 must contain exactly 1 entry.");
		}
	}
	
	
	nrLevels() : number {
		return this._nr_levels;
	}
	
	
	getEntries(): {[key: string] : IStringGHEntry} {
		return this._entries;
	}
	
	
	getLevelEntry(key: string) : number {
		return this._entries[key] ? this._entries[key].level : undefined;
	}
	
	/**
	 * Should we include level information in the return value?
	 */
	getGeneralizationOf(key: string) : string {
		return this._entries[key] ? this._entries[key].gen : undefined;
	}
	
	
	getName(key: string) : string {
		return this._entries[key].name;
	}
	
}


export interface IContGenHierarchy {
	_name: string;
	_min: number;
	_max: number;
	
	genCostOfRange(from: number, to: number) : number;
}


class ContGenHierarchy implements IContGenHierarchy {
	
	constructor( public _name: string, public _min: number, public _max: number ) {
		if ( _min > _max ) {
			throw new Error('Range invalid. Min greater than Max.');
		}
		if ( _min === _max ) {
			throw new Error('Range invalid. Min equals Max.');
		}
	}
	
	genCostOfRange(from: number, to: number) : number {
		if ( from > to ) {
			throw new Error('Cannot generalize to negative range.');
		}
		if ( from < this._min ) {
			throw new Error('Cannot generalize span. From parameter less than range min.');
		}
		if ( to > this._max ) {
			throw new Error('Cannot generalize span. To parameter greater than range max.');
		}
		return ((to - from) / (this._max - this._min));
	}
	
}


export { StringGenHierarchy, ContGenHierarchy };