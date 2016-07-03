"use strict";
var fs = require('fs');
var $GH = require('../core/GenHierarchies');
var $C = require('../config/SaNGreeAConfig');
var $G = require('graphinius').$G;
(function (HierarchyType) {
    HierarchyType[HierarchyType["CONTINUOUS"] = 0] = "CONTINUOUS";
    HierarchyType[HierarchyType["CATEGORICAL"] = 1] = "CATEGORICAL";
})(exports.HierarchyType || (exports.HierarchyType = {}));
var HierarchyType = exports.HierarchyType;
var SaNGreeA = (function () {
    function SaNGreeA(_name, config) {
        if (_name === void 0) { _name = "default"; }
        this._name = _name;
        this.config = config;
        this._cont_hierarchies = {};
        this._cat_hierarchies = {};
        this._config = config || $C.CONFIG;
        if (this._config.INPUT_FILE === "") {
            throw new Error('Input file cannot be an empty string');
        }
        if (this._config.NR_DRAWS < 0) {
            throw new Error('Options invalid. Nr_draws can not be negative.');
        }
        if (this._config.EDGE_MIN < 0) {
            throw new Error('Options invalid. Edge_min can not be negative.');
        }
        if (this._config.EDGE_MAX < 0) {
            throw new Error('Options invalid. Edge_max can not be negative.');
        }
        if (this._config.EDGE_MAX < this._config.EDGE_MIN) {
            throw new Error('Options invalid. Edge_min cannot exceed edge_max.');
        }
        this._graph = new $G.core.Graph(this._name);
    }
    SaNGreeA.prototype.getConfig = function () {
        return this._config;
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
    SaNGreeA.prototype.instantiateGraph = function (createEdges) {
        if (createEdges === void 0) { createEdges = true; }
        this.readCSV(this._config.INPUT_FILE, this._graph);
        if (createEdges === true) {
            this._graph.createRandomEdgesSpan(this._config.EDGE_MIN, this._config.EDGE_MAX, false);
        }
    };
    SaNGreeA.prototype.instantiateCategoricalHierarchies = function () {
    };
    SaNGreeA.prototype.instantiateRangeHierarchies = function () {
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
        var draw = this._config.NR_DRAWS;
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
            node.setFeature("income", line[line.length - 1]);
            var age = parseInt(line[0]);
            min_age = age < min_age ? age : min_age;
            max_age = age > max_age ? age : max_age;
            node.setFeature('age', parseInt(line[0]));
        }
        var age_hierarchy = new $GH.ContGenHierarchy('age', min_age, max_age);
        this.setContHierarchy('age', age_hierarchy);
    };
    SaNGreeA.prototype.outputPreprocCSV = function (outfile, skip) {
        var outstring = "", nodes = this._graph.getNodes(), node = null, feature = null;
        var rows_eliminated = 0;
        for (var node_key in this._graph.getNodes()) {
            node = nodes[node_key];
            skip = skip || {};
            var prob = parseFloat(skip['prob']), feat = skip['feat'], value = skip['value'];
            if (prob != null && feat != null && value != null) {
                if (Math.random() < prob && node.getFeature(feat) === value) {
                    rows_eliminated++;
                    continue;
                }
            }
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
    };
    SaNGreeA.prototype.outputAnonymizedCSV = function (outfile) {
        var outstring = "";
        for (var cl_idx in this._clusters) {
            var cluster = this._clusters[cl_idx], nodes = cluster.nodes;
            for (var node_id in nodes) {
                var age_range = cluster.gen_ranges['age'];
                if (age_range[0] === age_range[1]) {
                    outstring += age_range[0] + ", ";
                }
                else if (this._config.AVERAGE_OUTPUT_RANGES) {
                    var avg_age = (age_range[0] + age_range[1]) / 2.0;
                    outstring += avg_age + ", ";
                }
                else {
                    outstring += "[" + age_range[0] + " - " + age_range[1] + "], ";
                }
                for (var hi in this._cat_hierarchies) {
                    var h = this._cat_hierarchies[hi];
                    outstring += h.getName(cluster.gen_feat[hi]) + ", ";
                }
                outstring += nodes[node_id].getFeature('income');
                outstring += "\n";
            }
        }
        var first_line = "age, workclass, native-country, sex, race, marital-status, relationship, occupation, income \n";
        outstring = first_line + outstring;
        fs.writeFileSync("./test/io/test_output/" + outfile + ".csv", outstring);
    };
    SaNGreeA.prototype.anonymizeGraph = function () {
        var S = [], nodes = this._graph.getNodes(), keys = Object.keys(nodes), current_node, candidate, current_best, added = {}, nr_open = Object.keys(nodes).length, cont_costs, cat_costs, GIL, SIL, total_costs, best_costs, i, j;
        for (i = 0; i < keys.length; i++) {
            current_node = nodes[keys[i]];
            if (added[current_node.getID()]) {
                continue;
            }
            var Cl = {
                nodes: {},
                gen_feat: {
                    'workclass': current_node.getFeature('workclass'),
                    'native-country': current_node.getFeature('native-country'),
                    'marital-status': current_node.getFeature('marital-status'),
                    'sex': current_node.getFeature('sex'),
                    'race': current_node.getFeature('race'),
                    'relationship': current_node.getFeature('relationship'),
                    'occupation': current_node.getFeature('occupation')
                },
                gen_ranges: {
                    'age': [current_node.getFeature('age'), current_node.getFeature('age')]
                }
            };
            Cl.nodes[current_node.getID()] = current_node;
            added[current_node.getID()] = true;
            nr_open--;
            while (Object.keys(Cl.nodes).length < this._config.K_FACTOR && nr_open) {
                best_costs = Number.POSITIVE_INFINITY;
                for (j = i + 1; j < keys.length; j++) {
                    candidate = nodes[keys[j]];
                    if (added[candidate.getID()]) {
                        continue;
                    }
                    cat_costs = this.calculateCatCosts(Cl, candidate);
                    cont_costs = this.calculateContCosts(Cl, candidate);
                    GIL = cat_costs + cont_costs;
                    SIL = this._config.BETA > 0 ? this.calculateSIL(Cl, candidate) : 0;
                    total_costs = this._config.ALPHA * GIL + this._config.BETA * SIL;
                    if (total_costs < best_costs) {
                        best_costs = total_costs;
                        current_best = candidate;
                    }
                }
                Cl.nodes[current_best.getID()] = current_best;
                this.updateRange(Cl.gen_ranges['age'], current_best.getFeature('age'));
                this.updateLevels(Cl, current_best);
                added[current_best.getID()] = true;
                nr_open--;
            }
            S.push(Cl);
        }
        console.log("Built " + S.length + " clusters.");
        this._clusters = S;
    };
    SaNGreeA.prototype.calculateSIL = function (Cl, candidate) {
        var population_size = this._graph.nrNodes() - 2;
        var dists = [];
        var candidate_neighbors = candidate.reachNodes().map(function (ne) { return ne.node.getID(); });
        for (var cl_node in Cl.nodes) {
            var dist = population_size;
            var cl_node_neighbors = Cl.nodes[cl_node].reachNodes().map(function (ne) { return ne.node.getID(); });
            for (var idx in cl_node_neighbors) {
                var neighbor = cl_node_neighbors[idx];
                if (neighbor !== candidate.getID() && candidate_neighbors.indexOf(neighbor) !== -1) {
                    --dist;
                }
            }
            dists.push(dist / population_size);
        }
        return dists.reduce(function (a, b) { return a + b; }, 0) / dists.length;
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
            var cat_weights = this._config.GEN_WEIGHT_VECTORS[this._config.VECTOR]['categorical'];
            costs += cat_weights[feat] * ((cat_gh.nrLevels() - Cl_level) / cat_gh.nrLevels());
        }
        return costs / Object.keys(this._cat_hierarchies).length;
    };
    SaNGreeA.prototype.calculateContCosts = function (Cl, Y) {
        var age_range = Cl.gen_ranges['age'];
        var new_range = this.expandRange(age_range, Y.getFeature('age'));
        var age_hierarchy = this.getContHierarchy('age');
        var cost = age_hierarchy instanceof $GH.ContGenHierarchy ? age_hierarchy.genCostOfRange(new_range[0], new_range[1]) : 0;
        var range_weights = this._config.GEN_WEIGHT_VECTORS[this._config.VECTOR]['range'];
        return range_weights['age'] * cost;
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
}());
exports.SaNGreeA = SaNGreeA;
