"use strict";
var $GH = require('../core/GenHierarchies');
var $C = require('../config/SaNGreeAConfig_adult');
var $G = require('graphinius');
var $CSVOUT = require('../io/CSVOutput');
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
        this._range_hierarchy_indices = {};
        this._categorical_hierarchy_indices = {};
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
        this._graph = new $G.core.BaseGraph(this._name);
        this._perturber = new $G.perturbation.SimplePerturber(this._graph);
        this._SEP = new RegExp(this._config.SEPARATOR, this._config.SEP_MOD);
        this._TRIM = new RegExp(this._config.TRIM, this._config.TRIM_MOD);
        this._csvOUT = new $CSVOUT.CSVOutput(this._config);
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
    SaNGreeA.prototype.instantiateGraph = function (csv_arr, createEdges) {
        if (createEdges === void 0) { createEdges = true; }
        var str_cols = csv_arr.shift().trim().replace(this._TRIM, '').split(this._SEP);
        this.instantiateRangeHierarchies(csv_arr, str_cols);
        this.readCSV(csv_arr, str_cols, this._graph);
        if (createEdges) {
            this._perturber.createRandomEdgesSpan(this._config.EDGE_MIN, this._config.EDGE_MAX, false);
        }
    };
    SaNGreeA.prototype.instantiateRangeHierarchies = function (str_input, str_cols) {
        var _this = this;
        var cont_hierarchies = Object.keys(this._cont_hierarchies);
        var ranges = Object.keys(this._config.GEN_WEIGHT_VECTORS[this._config.VECTOR]['range']);
        if (ranges.length < 1) {
            return;
        }
        str_cols.forEach(function (col, idx) {
            if (ranges.indexOf(col) !== -1) {
                _this._range_hierarchy_indices[col] = idx;
            }
        });
        var min_max_struct = {};
        ranges.forEach(function (range) {
            min_max_struct[range] = {
                'min': Number.POSITIVE_INFINITY,
                'max': Number.NEGATIVE_INFINITY
            };
        });
        var current_value = NaN;
        for (var i = 0; i < str_input.length; i++) {
            if (!str_input[i]) {
                continue;
            }
            var line = str_input[i].trim().replace(this._TRIM, '').split(this._SEP);
            ranges.forEach(function (range) {
                current_value = parseFloat(line[_this._range_hierarchy_indices[range]]);
                if (current_value < min_max_struct[range]['min']) {
                    min_max_struct[range]['min'] = current_value;
                }
                if (current_value > min_max_struct[range]['max']) {
                    min_max_struct[range]['max'] = current_value;
                }
            });
        }
        ranges.forEach(function (range) {
            var range_hierarchy = new $GH.ContGenHierarchy(range, min_max_struct[range]['min'], min_max_struct[range]['max']);
            _this.setContHierarchy(range_hierarchy._name, range_hierarchy);
        });
    };
    SaNGreeA.prototype.readCSV = function (str_input, str_cols, graph) {
        var cont_hierarchies = Object.keys(this._cont_hierarchies);
        var cat_hierarchies = Object.keys(this._cat_hierarchies);
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
        var target_idx = str_cols.indexOf(this._config.TARGET_COLUMN);
        if (target_idx < 0) {
            throw new Error("Target column does not exist... aborting.");
        }
        var draw = this._config.NR_DRAWS;
        for (var i = 0; i < draw; i++) {
            if (!str_input[i]) {
                continue;
            }
            var line = str_input[i].trim().replace(this._TRIM, '').split(this._SEP);
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
            var node = this._graph.addNodeByID("" + i);
            for (var idx in cat_feat_idx_select) {
                node.setFeature(cat_feat_idx_select[idx], line[idx]);
            }
            for (var idx in cont_feat_idx_select) {
                node.setFeature(cont_feat_idx_select[idx], +line[idx]);
            }
            node.setFeature(this._config.TARGET_COLUMN, line[target_idx]);
        }
    };
    SaNGreeA.prototype.outputPreprocCSV = function (outfile, skip) {
        var outstring = "", nodes = this._graph.getNodes(), node = null, feature = null;
        var rows_eliminated = 0;
        Object.keys(this._cont_hierarchies).forEach(function (range_hierarchy) {
            outstring += range_hierarchy + ", ";
        });
        Object.keys(this._cat_hierarchies).forEach(function (cat_hierarchy) {
            outstring += cat_hierarchy + ", ";
        });
        outstring += this._config.TARGET_COLUMN + "\n";
        for (var node_key in this._graph.getNodes()) {
            node = nodes[node_key];
            skip = skip || {};
            var prob = parseFloat(skip['prob']), feat = skip['feat'], value = skip['value'];
            if (prob != null && feat != null && value != null) {
                if (parseFloat(value) !== parseFloat(value)) {
                    if (Math.random() < prob && node.getFeature(feat) === value) {
                        rows_eliminated++;
                        continue;
                    }
                }
                else if (Math.random() < prob && node.getFeature(feat) > value) {
                    rows_eliminated++;
                    continue;
                }
            }
            Object.keys(this._cont_hierarchies).forEach(function (range_hierarchy) {
                outstring += node.getFeature(range_hierarchy) + ', ';
            });
            Object.keys(this._cat_hierarchies).forEach(function (cat_hierarchy) {
                outstring += node.getFeature(cat_hierarchy) + ', ';
            });
            outstring += node.getFeature(this._config.TARGET_COLUMN) + "\n";
        }
        console.log("Eliminated " + rows_eliminated + " rows from a DS of " + this._graph.nrNodes() + " rows.");
        this._csvOUT.outputCSVToFile(outfile, outstring);
    };
    SaNGreeA.prototype.outputAnonymizedCSV = function (outfile) {
        var _this = this;
        var outstring = "";
        Object.keys(this._cont_hierarchies).forEach(function (range_hierarchy) {
            outstring += range_hierarchy + ", ";
        });
        Object.keys(this._cat_hierarchies).forEach(function (cat_hierarchy) {
            outstring += cat_hierarchy + ", ";
        });
        outstring += this._config.TARGET_COLUMN + "\n";
        for (var cl_idx in this._clusters) {
            var cluster = this._clusters[cl_idx], nodes = cluster.nodes;
            for (var node_id in nodes) {
                Object.keys(this._cont_hierarchies).forEach(function (range_hierarchy) {
                    var range = cluster.gen_ranges[range_hierarchy];
                    if (range[0] === range[1]) {
                        outstring += range[0] + ", ";
                    }
                    else if (_this._config.AVERAGE_OUTPUT_RANGES) {
                        var range_average = (range[0] + range[1]) / 2.0;
                        outstring += range_average + ", ";
                    }
                    else {
                        outstring += "[" + range[0] + " - " + range[1] + "], ";
                    }
                });
                Object.keys(this._cat_hierarchies).forEach(function (cat_hierarchy) {
                    var gen_Hierarchy = _this._cat_hierarchies[cat_hierarchy];
                    outstring += gen_Hierarchy.getName(cluster.gen_feat[cat_hierarchy]) + ", ";
                });
                outstring += nodes[node_id].getFeature(this._config.TARGET_COLUMN) + "\n";
            }
        }
        this._csvOUT.outputCSVToFile(outfile, outstring);
    };
    SaNGreeA.prototype.anonymizeGraph = function () {
        var _this = this;
        var S = [], nodes = this._graph.getNodes(), keys = Object.keys(nodes), current_node, candidate, current_best, added = {}, nr_open = Object.keys(nodes).length, cont_costs, cat_costs, GIL, SIL, total_costs, best_costs, i, j;
        for (i = 0; i < keys.length; i++) {
            current_node = nodes[keys[i]];
            if (added[current_node.getID()]) {
                continue;
            }
            var Cl = {
                nodes: {},
                gen_feat: {},
                gen_ranges: {}
            };
            Object.keys(this._cat_hierarchies).forEach(function (cat) {
                Cl.gen_feat[cat] = current_node.getFeature(cat);
            });
            Object.keys(this._cont_hierarchies).forEach(function (range) {
                Cl.gen_ranges[range] = [current_node.getFeature(range), current_node.getFeature(range)];
            });
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
                    GIL = this.calculateGIL(Cl, candidate);
                    SIL = this._config.BETA > 0 ? this.calculateSIL(Cl, candidate) : 0;
                    total_costs = this._config.ALPHA * GIL + this._config.BETA * SIL;
                    if (total_costs < best_costs) {
                        best_costs = total_costs;
                        current_best = candidate;
                    }
                }
                Cl.nodes[current_best.getID()] = current_best;
                this.updateLevels(Cl, current_best);
                Object.keys(this._cont_hierarchies).forEach(function (range) {
                    _this.updateRange(Cl.gen_ranges[range], current_best.getFeature(range));
                });
                added[current_best.getID()] = true;
                nr_open--;
            }
            S.push(Cl);
        }
        console.log("Built " + S.length + " clusters.");
        this._clusters = S;
    };
    SaNGreeA.prototype.calculateGIL = function (Cl, candidate) {
        return this.calculateCatCosts(Cl, candidate) + this.calculateContCosts(Cl, candidate);
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
    SaNGreeA.prototype.calculateCatCosts = function (Cl, Y) {
        var gen_costs = 0;
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
            gen_costs += cat_weights[feat] * ((cat_gh.nrLevels() - Cl_level) / cat_gh.nrLevels());
        }
        var nr_cat_hierarchies = Object.keys(this._cat_hierarchies).length;
        return nr_cat_hierarchies > 1 ? gen_costs / nr_cat_hierarchies : gen_costs;
    };
    SaNGreeA.prototype.calculateContCosts = function (Cl, Y) {
        var _this = this;
        var range_costs = 0;
        var range_weights = this._config.GEN_WEIGHT_VECTORS[this._config.VECTOR]['range'];
        Object.keys(this._cont_hierarchies).forEach(function (range) {
            var range_hierarchy = _this.getContHierarchy(range);
            var current_range = Cl.gen_ranges[range];
            var extended_range = _this.expandRange(current_range, Y.getFeature(range));
            var extension_cost = range_hierarchy instanceof $GH.ContGenHierarchy ? range_hierarchy.genCostOfRange(extended_range[0], extended_range[1]) : 0;
            range_costs += range_weights[range] + extension_cost;
        });
        var nr_cont_hierarchies = Object.keys(this._cont_hierarchies).length;
        return nr_cont_hierarchies > 1 ? range_costs / nr_cont_hierarchies : range_costs;
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
