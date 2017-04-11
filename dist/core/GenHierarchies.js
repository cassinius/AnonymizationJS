"use strict";
var fs = require('fs');
var StringGenHierarchy = (function () {
    function StringGenHierarchy(file) {
        this.file = file;
        this._entries = {};
        this._nr_levels = 0;
        var json;
        if (typeof window === 'undefined') {
            json = JSON.parse(fs.readFileSync(file).toString());
        }
        else {
            json = JSON.parse(file);
        }
        this._name = json.name;
        this.readFromJson(json);
    }
    StringGenHierarchy.prototype.readFromJson = function (json) {
        var level_1s = 0;
        for (var entry_idx in json.entries) {
            var json_entry = json.entries[entry_idx];
            var level = +json_entry.level;
            if (level === 0) {
                level_1s++;
            }
            if (level > this._nr_levels) {
                this._nr_levels = level;
            }
            var entry = ({
                "name": json_entry.name,
                "gen": json_entry.gen,
                "level": json_entry.level
            });
            this._entries[entry_idx] = entry;
        }
        if (level_1s !== 1) {
            throw new Error("JSON invalid. Level 0 must contain exactly 1 entry.");
        }
    };
    StringGenHierarchy.prototype.nrLevels = function () {
        return this._nr_levels;
    };
    StringGenHierarchy.prototype.getEntries = function () {
        return this._entries;
    };
    StringGenHierarchy.prototype.getLevelEntry = function (key) {
        return this._entries[key] ? this._entries[key].level : undefined;
    };
    StringGenHierarchy.prototype.getGeneralizationOf = function (key) {
        return this._entries[key] ? this._entries[key].gen : undefined;
    };
    StringGenHierarchy.prototype.getName = function (key) {
        return this._entries[key].name;
    };
    return StringGenHierarchy;
}());
exports.StringGenHierarchy = StringGenHierarchy;
var ContGenHierarchy = (function () {
    function ContGenHierarchy(_name, _min, _max) {
        this._name = _name;
        this._min = _min;
        this._max = _max;
        if (_min > _max) {
            throw new Error('Range invalid. Min greater than Max.');
        }
        if (_min === _max) {
            throw new Error('Range invalid. Min equals Max.');
        }
    }
    ContGenHierarchy.prototype.genCostOfRange = function (from, to) {
        if (from > to) {
            throw new Error('Cannot generalize to negative range.');
        }
        if (from < this._min) {
            throw new Error('Cannot generalize span. From parameter less than range min.');
        }
        if (to > this._max) {
            throw new Error('Cannot generalize span. To parameter greater than range max.');
        }
        return ((to - from) / (this._max - this._min));
    };
    return ContGenHierarchy;
}());
exports.ContGenHierarchy = ContGenHierarchy;
