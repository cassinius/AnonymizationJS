var fs = require('fs');
var StringGenHierarchy = (function () {
    function StringGenHierarchy(filePath) {
        this.filePath = filePath;
        this._levels = [];
        var json = JSON.parse(fs.readFileSync(filePath).toString());
        this._name = json.name;
        this.readFromJson(json);
    }
    StringGenHierarchy.prototype.readFromJson = function (json) {
        if (!json.levels
            || !json.levels[0]
            || !json.levels[0].entries
            || Object.keys(json.levels[0].entries).length !== 1) {
            throw new Error("JSON invalid. Level 0 does not contain exactly 1 entry.");
        }
        for (var level_idx in json.levels) {
            var json_level = json.levels[level_idx];
            var level = ({
                "id": json_level.id,
                "cost": json_level.cost,
                "entries": {}
            });
            for (var entry_key in json_level.entries) {
                var json_entry = json_level.entries[entry_key];
                level.entries[entry_key] = json_entry;
            }
            this._levels.push(level);
        }
    };
    StringGenHierarchy.prototype.getLevels = function () {
        return this._levels;
    };
    StringGenHierarchy.prototype.getLevelEntry = function (key) {
        var i = this._levels.length;
        while (i--) {
            var entry = this._levels[i].entries[key];
            if (entry) {
                return i;
            }
        }
        return undefined;
    };
    StringGenHierarchy.prototype.getGeneralizationOf = function (key) {
        var i = this._levels.length;
        while (i--) {
            var entry = this._levels[i].entries[key];
            if (entry) {
                return entry.gen;
            }
        }
        return undefined;
    };
    return StringGenHierarchy;
})();
exports.StringGenHierarchy = StringGenHierarchy;
