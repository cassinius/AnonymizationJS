var fs = require('fs');
var $GH = require('../core/GenHierarchies');
var $G = require('graphinius').$G;
console.log($G);
(function (HierarchyType) {
    HierarchyType[HierarchyType["CONTINUOUS"] = 0] = "CONTINUOUS";
    HierarchyType[HierarchyType["CATEGORICAL"] = 1] = "CATEGORICAL";
})(exports.HierarchyType || (exports.HierarchyType = {}));
var HierarchyType = exports.HierarchyType;
var SaNGreeA = (function () {
    function SaNGreeA(_name, _input_file, opts, weights) {
        if (_name === void 0) { _name = "default"; }
        this._name = _name;
        this._input_file = _input_file;
        this._cont_hierarchies = {};
        this._cat_hierarchies = {};
        this._weights = weights || {
            'age': 1 / 6,
            'workclass': 1 / 6,
            'native-country': 1 / 6,
            'sex': 1 / 6,
            'race': 1 / 6,
            'marital-status': 1 / 6
        };
        if (_input_file === "") {
            throw new Error('Input file cannot be an empty string');
        }
        this._options = opts || {
            nr_draws: 300,
            edge_min: 1,
            edge_max: 10
        };
        if (this._options.nr_draws < 0) {
            throw new Error('Options invalid. Nr_draws can not be negative.');
        }
        if (this._options.edge_min < 0) {
            throw new Error('Options invalid. Edge_min can not be negative.');
        }
        if (this._options.edge_max < 0) {
            throw new Error('Options invalid. Edge_max can not be negative.');
        }
        if (this._options.edge_max < this._options.edge_min) {
            throw new Error('Options invalid. Edge_max cannot exceed edge_min.');
        }
    }
    SaNGreeA.prototype.getOptions = function () {
        return this._options;
    };
    SaNGreeA.prototype.getContHierarchies = function () {
        return this._cont_hierarchies;
    };
    SaNGreeA.prototype.getCatHierarchies = function () {
        return this._cat_hierarchies;
    };
    SaNGreeA.prototype.getContHierarchy = function (name) {
        return this._cont_hierarchies[name];
    };
    SaNGreeA.prototype.getCatHierarchy = function (name) {
        return this._cat_hierarchies[name];
    };
    SaNGreeA.prototype.setContHierarchy = function (name, genh) {
        this._cont_hierarchies[name] = genh;
    };
    SaNGreeA.prototype.setCatHierarchy = function (name, genh) {
        this._cat_hierarchies[name] = genh;
    };
    SaNGreeA.prototype.instantiateGraph = function (name) {
        if (name === void 0) { name = "default"; }
        this._graph = new $G.core.Graph("adults");
        this.readCSV(this._input_file, this._graph);
    };
    SaNGreeA.prototype.readCSV = function (file, graph) {
        var str_input = fs.readFileSync(file).toString().split('\n');
        var str_cols = str_input.shift().replace(/\s+/g, '').split(',');
        var cont_hierarchies = Object.keys(this._cont_hierarchies);
        var cat_hierarchies = Object.keys(this._cat_hierarchies);
        var min_age = Number.POSITIVE_INFINITY;
        var max_age = Number.NEGATIVE_INFINITY;
        var cont_feat_idx_select = {};
        str_cols.forEach(function (col, idx) {
            if (cont_hierarchies.indexOf(col) !== -1) {
                cont_feat_idx_select[idx] = col;
            }
        });
        var cat_feat_idx_select = {};
        str_cols.forEach(function (col, idx) {
            if (cat_hierarchies.indexOf(col) !== -1) {
                cat_feat_idx_select[idx] = col;
            }
        });
        var draw = 300;
        for (var i = 0; i < draw; i++) {
            if (!str_input[i]) {
                continue;
            }
            var line = str_input[i].replace(/\s+/g, '').split(',');
            var line_valid = true;
            for (var idx in cat_feat_idx_select) {
                var cat_hierarchy = this.getCatHierarchy(cat_feat_idx_select[idx]);
                if (cat_hierarchy && !cat_hierarchy.getLevelEntry(line[idx])) {
                    line_valid = false;
                }
            }
            for (var idx in cont_feat_idx_select) {
                var cont_hierarchy = this.getContHierarchy(cont_feat_idx_select[idx]);
                if (+line[idx] !== +line[idx]) {
                    line_valid = false;
                }
            }
            if (!line_valid) {
                draw++;
                continue;
            }
            var node = this._graph.addNode(i);
            for (var idx in cat_feat_idx_select) {
                node.setFeature(cat_feat_idx_select[idx], line[idx]);
            }
            for (var idx in cont_feat_idx_select) {
                node.setFeature(cont_feat_idx_select[idx], +line[idx]);
            }
            var age = parseInt(line[0]);
            min_age = age < min_age ? age : min_age;
            max_age = age > max_age ? age : max_age;
            node.setFeature('age', parseInt(line[0]));
        }
        var age_hierarchy = new $GH.ContGenHierarchy('age', min_age, max_age);
        this.setContHierarchy('age', age_hierarchy);
    };
    SaNGreeA.prototype.outputAnonymizedCSV = function (outfile) {
        var outstring = "";
        for (var cl_idx in this._clusters) {
            var cluster = this._clusters[cl_idx];
            for (var count in cluster.nodes) {
                var age_range = cluster.gen_ranges['age'];
                if (age_range[0] === age_range[1]) {
                    outstring += age_range[0] + ", ";
                }
                else {
                    outstring += "[" + age_range[0] + " - " + age_range[1] + "], ";
                }
                for (var hi in this._cat_hierarchies) {
                    var h = this._cat_hierarchies[hi];
                    outstring += h.getName(cluster.gen_feat[hi]) + ", ";
                }
                outstring = outstring.slice(0, -2) + "\n";
            }
        }
        var first_line = "age, workclass, native-country, sex, race, marital-status \n";
        outstring = first_line + outstring;
        fs.writeFileSync("./test/io/test_output/" + outfile + ".csv", outstring);
    };
    SaNGreeA.prototype.anonymizeGraph = function (k, alpha, beta) {
        if (alpha === void 0) { alpha = 1; }
        if (beta === void 0) { beta = 0; }
        var S = [], N = this._graph.getNodes(), keys = Object.keys(N), X, Y, current_best, added = {}, cont_costs, cat_costs, best_costs, i, j;
        for (i = 0; i < keys.length; i++) {
            X = N[keys[i]];
            if (added[X.getID()]) {
                continue;
            }
            var Cl = {
                nodes: {},
                gen_feat: {
                    'workclass': X.getFeature('workclass'),
                    'native-country': X.getFeature('native-country'),
                    'marital-status': X.getFeature('marital-status'),
                    'sex': X.getFeature('sex'),
                    'race': X.getFeature('race')
                },
                gen_ranges: {
                    'age': [X.getFeature('age'), X.getFeature('age')]
                }
            };
            Cl.nodes[X.getID()] = X;
            added[X.getID()] = true;
            while (Object.keys(Cl.nodes).length < k && i < keys.length) {
                best_costs = Number.POSITIVE_INFINITY;
                for (j = 0; j < keys.length; j++) {
                    Y = N[keys[j]];
                    if (added[Y.getID()]) {
                        continue;
                    }
                    cat_costs = this.calculateCatCosts(Cl, Y);
                    cont_costs = this.calculateContCosts(Cl, Y);
                    if ((cat_costs + cont_costs) < best_costs) {
                        best_costs = (cat_costs + cont_costs);
                        current_best = Y;
                    }
                }
                Cl.nodes[current_best.getID()] = current_best;
                this.updateRange(Cl.gen_ranges['age'], current_best.getFeature('age'));
                this.updateLevels(Cl, current_best);
                added[current_best.getID()] = true;
            }
            S.push(Cl);
        }
        console.log("Built " + S.length + " clusters.");
        this._clusters = S;
    };
    SaNGreeA.prototype.updateLevels = function (Cl, Y) {
        for (var feat in this._cat_hierarchies) {
            var cat_gh = this.getCatHierarchy(feat);
            var Cl_feat = Cl.gen_feat[feat];
            var Y_feat = Y.getFeature(feat);
            var Cl_level = cat_gh.getLevelEntry(Cl_feat);
            var Y_level = cat_gh.getLevelEntry(Y_feat);
            while (Cl_feat !== Y_feat) {
                Y_feat = cat_gh.getGeneralizationOf(Y_feat);
                Y_level = cat_gh.getLevelEntry(Y_feat);
                if (Cl_level > Y_level) {
                    Cl_feat = cat_gh.getGeneralizationOf(Cl_feat);
                    Cl_level = cat_gh.getLevelEntry(Cl_feat);
                }
            }
            Cl.gen_feat[feat] = Cl_feat;
        }
    };
    SaNGreeA.prototype.calculateCatCosts = function (Cl, Y) {
        var costs = 0;
        for (var feat in this._cat_hierarchies) {
            var cat_gh = this.getCatHierarchy(feat);
            var Cl_feat = Cl.gen_feat[feat];
            var Y_feat = Y.getFeature(feat);
            var Cl_level = cat_gh.getLevelEntry(Cl_feat);
            var Y_level = cat_gh.getLevelEntry(Y_feat);
            while (Cl_feat !== Y_feat) {
                Y_feat = cat_gh.getGeneralizationOf(Y_feat);
                Y_level = cat_gh.getLevelEntry(Y_feat);
                if (Cl_level > Y_level) {
                    Cl_feat = cat_gh.getGeneralizationOf(Cl_feat);
                    Cl_level = cat_gh.getLevelEntry(Cl_feat);
                }
            }
            costs += this._weights[feat] * ((cat_gh.nrLevels() - Cl_level) / cat_gh.nrLevels());
        }
        return costs / Object.keys(this._cat_hierarchies).length;
    };
    SaNGreeA.prototype.calculateContCosts = function (Cl, Y) {
        var age_range = Cl.gen_ranges['age'];
        var new_range = this.expandRange(age_range, Y.getFeature('age'));
        var age_hierarchy = this.getContHierarchy('age');
        var cost = age_hierarchy instanceof $GH.ContGenHierarchy ? age_hierarchy.genCostOfRange(new_range[0], new_range[1]) : 0;
        return this._weights['age'] * cost;
    };
    SaNGreeA.prototype.expandRange = function (range, nr) {
        var min = nr < range[0] ? nr : range[0];
        var max = nr > range[1] ? nr : range[1];
        return [min, max];
    };
    SaNGreeA.prototype.updateRange = function (range, nr) {
        range[0] < range[0] ? nr : range[0];
        range[1] = nr > range[1] ? nr : range[1];
    };
    return SaNGreeA;
})();
exports.SaNGreeA = SaNGreeA;
