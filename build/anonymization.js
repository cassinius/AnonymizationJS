/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var $GH					= __webpack_require__(1);
	var $CSVIN 			= __webpack_require__(3);
	var $CSVOUT			= __webpack_require__(4);
	var $Sangreea 	= __webpack_require__(5);
	var $C_ADULT		= __webpack_require__(6);
	var $C_HOUSES		= __webpack_require__(22);


	var out = typeof window !== 'undefined' ? window : global;


	out.$A = {
		config: {
			adults: $C_ADULT.CONFIG,
			houses: $C_HOUSES.CONFIG
		},
		genHierarchy:	{
			Category		: $GH.StringGenHierarchy,
			Range	: $GH.ContGenHierarchy
		},
		IO: {
			CSVIN			 		: $CSVIN.CSVInput,
			CSVOUT		 		: $CSVOUT.CSVOutput
		},
		algorithms: {
			Sangreea		: $Sangreea.SaNGreeA
		}
	};


	/**
	 * For NodeJS / CommonJS global object
	 */
	module.exports = out.$A;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var fs = __webpack_require__(2);
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
	            throw new Error(this._name + ": Range invalid. Min (" + _min + ") greater than Max (" + _max + ").");
	        }
	        if (_min === _max) {
	            throw new Error(this._name + ": Range invalid. Min (" + _min + ") equals Max (" + _max + ").");
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


/***/ }),
/* 2 */
/***/ (function(module, exports) {

	

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var fs = __webpack_require__(2);
	var http = __webpack_require__(2);
	var CSVInput = (function () {
	    function CSVInput(config) {
	        this._SEP = new RegExp(config.SEPARATOR, config.SEP_MOD);
	        this._TRIM = new RegExp(config.TRIM, config.TRIM_MOD);
	    }
	    CSVInput.prototype.readCSVFromFile = function (file) {
	        return fs.readFileSync(file).toString().split('\n');
	    };
	    CSVInput.prototype.readCSVFromURL = function (fileurl, cb) {
	        var self = this, request;
	        if (typeof window !== 'undefined') {
	            request = new XMLHttpRequest();
	            request.onreadystatechange = function () {
	                if (request.readyState == 4 && request.status == 200) {
	                    cb(request.responseText.split('\n'));
	                }
	            };
	            request.open("GET", fileurl, true);
	            request.setRequestHeader('Content-Type', 'text/csv; charset=UTF-8');
	            request.send();
	        }
	        else {
	            this.retrieveRemoteFile(fileurl, cb);
	        }
	    };
	    CSVInput.prototype.retrieveRemoteFile = function (url, cb) {
	        if (typeof cb !== 'function') {
	            throw new Error('Provided callback is not a function.');
	        }
	        return http.get(url, function (response) {
	            var body = '';
	            response.on('data', function (d) {
	                body += d;
	            });
	            response.on('end', function () {
	                cb(body.toString().split('\n'));
	            });
	        });
	    };
	    return CSVInput;
	}());
	exports.CSVInput = CSVInput;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var fs = __webpack_require__(2);
	var CSVOutput = (function () {
	    function CSVOutput(config) {
	        this._SEP = new RegExp(config.SEPARATOR, config.SEP_MOD);
	        this._TRIM = new RegExp(config.TRIM, config.TRIM_MOD);
	    }
	    CSVOutput.prototype.outputCSVToFile = function (file, csv) {
	        fs.writeFileSync("./test/io/test_output/" + file + ".csv", csv);
	    };
	    return CSVOutput;
	}());
	exports.CSVOutput = CSVOutput;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var $GH = __webpack_require__(1);
	var $C = __webpack_require__(6);
	var $CSVOUT = __webpack_require__(4);
	var Graph_1 = __webpack_require__(7);
	var SimplePerturbations_1 = __webpack_require__(20);
	console.log(Graph_1.BaseGraph);
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
	        this._graph = new Graph_1.BaseGraph(this._name);
	        this._perturber = new SimplePerturbations_1.SimplePerturber(this._graph);
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
	    SaNGreeA.prototype.constructPreprocCSV = function (skip) {
	        var outstring = "", nodes = this._graph.getNodes(), node = null, feature = null;
	        var rows_eliminated = 0;
	        Object.keys(this._cont_hierarchies).forEach(function (range_hierarchy) {
	            outstring += range_hierarchy + ", ";
	        });
	        Object.keys(this._cat_hierarchies).forEach(function (cat_hierarchy) {
	            outstring += cat_hierarchy + ", ";
	        });
	        outstring += this._config.TARGET_COLUMN + "\n";
	        skip = skip || {};
	        var random = skip['random'], prob = parseFloat(skip['prob']), feat = skip['feat'], value = skip['value'], group = skip['group'], nr_bins = +skip['nr_bins'] | 0;
	        console.log("nr bins: " + nr_bins);
	        var bin_max = Number.NEGATIVE_INFINITY;
	        for (var node_key in this._graph.getNodes()) {
	            node = nodes[node_key];
	            if (prob != null && feat != null && value != null) {
	                if (random && Math.random() < prob) {
	                    rows_eliminated++;
	                    continue;
	                }
	                else if (parseFloat(value) !== parseFloat(value)) {
	                    if (Math.random() < prob && node.getFeature(feat) === value) {
	                        rows_eliminated++;
	                        continue;
	                    }
	                }
	                else if (group) {
	                    var min = this.getContHierarchy(feat)._min, max = this.getContHierarchy(feat)._max, range = max - min, bins = range / nr_bins, bin = ((+node.getFeature(feat) - min) / bins) | 0;
	                    bin_max = bin > bin_max ? bin : bin_max;
	                    node.setFeature(feat, bin);
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
	        console.log("Max bin used: " + bin_max);
	        console.log("Eliminated " + rows_eliminated + " rows from a DS of " + this._graph.nrNodes() + " rows.");
	        return outstring;
	    };
	    SaNGreeA.prototype.outputPreprocCSV = function (outfile, skip) {
	        var outstring = this.constructPreprocCSV(skip);
	        this._csvOUT.outputCSVToFile(outfile, outstring);
	    };
	    SaNGreeA.prototype.constructAnonymizedCSV = function () {
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
	        return outstring;
	    };
	    SaNGreeA.prototype.outputAnonymizedCSV = function (outfile) {
	        var outstring = this.constructAnonymizedCSV();
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


/***/ }),
/* 6 */
/***/ (function(module, exports) {

	"use strict";
	var CONFIG = {
	    'REMOTE_URL': 'http://berndmalle.com/anonymization/adults',
	    'REMOTE_TARGET': 'education',
	    'INPUT_FILE': './test/io/test_input/adult_data.csv',
	    'TRIM': '\\s+',
	    'TRIM_MOD': 'g',
	    'SEPARATOR': ',',
	    'SEP_MOD': '',
	    'TARGET_COLUMN': 'marital-status',
	    'AVERAGE_OUTPUT_RANGES': true,
	    'NR_DRAWS': 300,
	    'RANDOM_DRAWS': false,
	    'EDGE_MIN': 2,
	    'EDGE_MAX': 10,
	    'K_FACTOR': 50,
	    'ALPHA': 1,
	    'BETA': 0,
	    'GEN_WEIGHT_VECTORS': {
	        'equal': {
	            'categorical': {
	                'workclass': 1.0 / 13.0,
	                'native-country': 1.0 / 13.0,
	                'sex': 1.0 / 13.0,
	                'race': 1.0 / 13.0,
	                'relationship': 1.0 / 13.0,
	                'occupation': 1.0 / 13.0,
	                'income': 1.0 / 13.0
	            },
	            'range': {
	                'age': 1.0 / 13.0,
	                'fnlwgt': 1.0 / 13.0,
	                'education-num': 1.0 / 13.0,
	                'capital-gain': 1.0 / 13.0,
	                'capital-loss': 1.0 / 13.0,
	                'hours-per-week': 1.0 / 13.0
	            }
	        },
	        'emph_race': {
	            'categorical': {
	                'workclass': 0.01,
	                'native-country': 0.01,
	                'sex': 0.01,
	                'race': 0.88,
	                'relationship': 0.01,
	                'occupation': 0.01,
	                'income': 0.01
	            },
	            'range': {
	                'age': 0.01,
	                'fnlwgt': 0.01,
	                'education-num': 0.01,
	                'capital-gain': 0.01,
	                'capital-loss': 0.01,
	                'hours-per-week': 0.01
	            }
	        },
	        'emph_age': {
	            'categorical': {
	                'workclass': 0.01,
	                'native-country': 0.01,
	                'sex': 0.01,
	                'race': 0.01,
	                'relationship': 0.01,
	                'occupation': 0.01,
	                'income': 0.01
	            },
	            'range': {
	                'age': 0.88,
	                'fnlwgt': 0.01,
	                'education-num': 0.01,
	                'capital-gain': 0.01,
	                'capital-loss': 0.01,
	                'hours-per-week': 0.01,
	            }
	        }
	    },
	    'VECTOR': 'equal'
	};
	exports.CONFIG = CONFIG;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	/// <reference path="../../typings/tsd.d.ts" />
	Object.defineProperty(exports, "__esModule", { value: true });
	var $N = __webpack_require__(8);
	var $E = __webpack_require__(10);
	var $DS = __webpack_require__(9);
	var logger_1 = __webpack_require__(11);
	var $BFS = __webpack_require__(14);
	var $DFS = __webpack_require__(16);
	var BellmanFord_1 = __webpack_require__(17);
	var logger = new logger_1.Logger();
	var DEFAULT_WEIGHT = 1;
	var GraphMode;
	(function (GraphMode) {
	    GraphMode[GraphMode["INIT"] = 0] = "INIT";
	    GraphMode[GraphMode["DIRECTED"] = 1] = "DIRECTED";
	    GraphMode[GraphMode["UNDIRECTED"] = 2] = "UNDIRECTED";
	    GraphMode[GraphMode["MIXED"] = 3] = "MIXED";
	})(GraphMode = exports.GraphMode || (exports.GraphMode = {}));
	var BaseGraph = /** @class */ (function () {
	    // protected _typed_nodes: { [type: string] : { [key: string] : $N.IBaseNode } };
	    // protected _typed_dir_edges: { [type: string] : { [key: string] : $E.IBaseEdge } };
	    // protected _typed_und_edges: { [type: string] : { [key: string] : $E.IBaseEdge } };
	    function BaseGraph(_label) {
	        this._label = _label;
	        this._nr_nodes = 0;
	        this._nr_dir_edges = 0;
	        this._nr_und_edges = 0;
	        this._mode = GraphMode.INIT;
	        this._nodes = {};
	        this._dir_edges = {};
	        this._und_edges = {};
	    }
	    /**
	     * Version 1: do it in-place (to the object you receive)
	     * Version 2: clone the graph first, return the mutated clone
	     */
	    BaseGraph.prototype.toDirectedGraph = function (copy) {
	        if (copy === void 0) { copy = false; }
	        var result_graph = copy ? this.clone() : this;
	        // if graph has no edges, we want to throw an exception
	        if (this._nr_dir_edges === 0 && this._nr_und_edges === 0) {
	            throw new Error("Cowardly refusing to re-interpret an empty graph.");
	        }
	        return result_graph;
	    };
	    BaseGraph.prototype.toUndirectedGraph = function () {
	        return this;
	    };
	    /**
	     * what to do if some edges are not weighted at all?
	     * Since graph traversal algortihms (and later maybe graphs themselves)
	     * use default weights anyways, I am simply ignoring them for now...
	     * @todo figure out how to test this...
	     */
	    BaseGraph.prototype.hasNegativeEdge = function () {
	        var has_neg_edge = false, edge;
	        // negative und_edges are always negative cycles
	        //reminder: a return statement breaks out of the for loop and finishes the function
	        for (var edge_id in this._und_edges) {
	            edge = this._und_edges[edge_id];
	            if (!edge.isWeighted()) {
	                continue;
	            }
	            if (edge.getWeight() < 0) {
	                return true;
	            }
	        }
	        for (var edge_id in this._dir_edges) {
	            edge = this._dir_edges[edge_id];
	            if (!edge.isWeighted()) {
	                continue;
	            }
	            if (edge.getWeight() < 0) {
	                has_neg_edge = true;
	                break;
	            }
	        }
	        return has_neg_edge;
	    };
	    /**
	     * Do we want to throw an error if an edge is unweighted?
	     * Or shall we let the traversal algorithm deal with DEFAULT weights like now?
	     */
	    BaseGraph.prototype.hasNegativeCycles = function (node) {
	        var _this = this;
	        if (!this.hasNegativeEdge()) {
	            return false;
	        }
	        var negative_cycle = false, start = node ? node : this.getRandomNode();
	        /**
	         * Now do Bellman Ford over all graph components
	         */
	        $DFS.DFS(this, start).forEach(function (comp) {
	            var min_count = Number.POSITIVE_INFINITY, comp_start_node;
	            Object.keys(comp).forEach(function (node_id) {
	                if (min_count > comp[node_id].counter) {
	                    min_count = comp[node_id].counter;
	                    comp_start_node = node_id;
	                }
	            });
	            if (BellmanFord_1.BellmanFordArray(_this, _this._nodes[comp_start_node]).neg_cycle) {
	                negative_cycle = true;
	            }
	        });
	        return negative_cycle;
	    };
	    /**
	     *
	     * @param incoming
	     */
	    BaseGraph.prototype.nextArray = function (incoming) {
	        if (incoming === void 0) { incoming = false; }
	        var next = [], node_keys = Object.keys(this._nodes);
	        //?? - but AdjDict contains distance value only for the directly reachable neighbors for each node, not all!	
	        //I do not understand but it works so it should be okay	
	        var adjDict = this.adjListDict(incoming, true, 0);
	        for (var i = 0; i < this._nr_nodes; ++i) {
	            next.push([]);
	            for (var j = 0; j < this._nr_nodes; ++j) {
	                next[i].push([]);
	                next[i][j].push(i === j ? j : isFinite(adjDict[node_keys[i]][node_keys[j]]) ? j : null);
	            }
	        }
	        return next;
	    };
	    /**
	     * This function iterates over the adjDict in order to use it's advantage
	     * of being able to override edges if edges with smaller weights exist
	     *
	     * However, the order of nodes in the array represents the order of nodes
	     * at creation time, no other implicit alphabetical or collational sorting.
	     *
	     * This has to be considered when further processing the result
	     *
	     * @param incoming whether or not to consider incoming edges as well
	     * @param include_self contains a distance to itself apart?
	     * @param self_dist default distance to self
	     */
	    BaseGraph.prototype.adjListArray = function (incoming) {
	        if (incoming === void 0) { incoming = false; }
	        var adjList = [], node_keys = Object.keys(this._nodes);
	        var adjDict = this.adjListDict(incoming, true, 0);
	        for (var i = 0; i < this._nr_nodes; ++i) {
	            adjList.push([]);
	            for (var j = 0; j < this._nr_nodes; ++j) {
	                adjList[i].push(i === j ? 0 : isFinite(adjDict[node_keys[i]][node_keys[j]]) ? adjDict[node_keys[i]][node_keys[j]] : Number.POSITIVE_INFINITY);
	            }
	        }
	        return adjList;
	    };
	    /**
	     *
	     * @param incoming whether or not to consider incoming edges as well
	     * @param include_self contains a distance to itself apart?
	     * @param self_dist default distance to self
	     */
	    BaseGraph.prototype.adjListDict = function (incoming, include_self, self_dist) {
	        if (incoming === void 0) { incoming = false; }
	        if (include_self === void 0) { include_self = false; }
	        if (self_dist === void 0) { self_dist = 0; }
	        var adj_list_dict = {}, nodes = this.getNodes(), cur_dist, key, cur_edge_weight;
	        for (key in nodes) {
	            adj_list_dict[key] = {};
	            if (include_self) {
	                adj_list_dict[key][key] = self_dist;
	            }
	        }
	        for (key in nodes) {
	            var neighbors = incoming ? nodes[key].reachNodes().concat(nodes[key].prevNodes()) : nodes[key].reachNodes();
	            neighbors.forEach(function (ne) {
	                cur_dist = adj_list_dict[key][ne.node.getID()] || Number.POSITIVE_INFINITY;
	                cur_edge_weight = isNaN(ne.edge.getWeight()) ? DEFAULT_WEIGHT : ne.edge.getWeight();
	                if (cur_edge_weight < cur_dist) {
	                    adj_list_dict[key][ne.node.getID()] = cur_edge_weight;
	                    if (incoming) { // we need to update the 'inverse' entry as well
	                        adj_list_dict[ne.node.getID()][key] = cur_edge_weight;
	                    }
	                }
	                else {
	                    adj_list_dict[key][ne.node.getID()] = cur_dist;
	                    if (incoming) { // we need to update the 'inverse' entry as well
	                        adj_list_dict[ne.node.getID()][key] = cur_dist;
	                    }
	                }
	            });
	        }
	        return adj_list_dict;
	    };
	    BaseGraph.prototype.getMode = function () {
	        return this._mode;
	    };
	    BaseGraph.prototype.getStats = function () {
	        return {
	            mode: this._mode,
	            nr_nodes: this._nr_nodes,
	            nr_und_edges: this._nr_und_edges,
	            nr_dir_edges: this._nr_dir_edges,
	            density_dir: this._nr_dir_edges / (this._nr_nodes * (this._nr_nodes - 1)),
	            density_und: 2 * this._nr_und_edges / (this._nr_nodes * (this._nr_nodes - 1))
	        };
	    };
	    BaseGraph.prototype.nrNodes = function () {
	        return this._nr_nodes;
	    };
	    BaseGraph.prototype.nrDirEdges = function () {
	        return this._nr_dir_edges;
	    };
	    BaseGraph.prototype.nrUndEdges = function () {
	        return this._nr_und_edges;
	    };
	    /**
	     *
	     * @param id
	     * @param opts
	     *
	     * @todo addNode functions should check if a node with a given ID already exists -> node IDs have to be unique...
	     */
	    BaseGraph.prototype.addNodeByID = function (id, opts) {
	        if (this.hasNodeID(id)) {
	            throw new Error("Won't add node with duplicate ID.");
	        }
	        var node = new $N.BaseNode(id, opts);
	        return this.addNode(node) ? node : null;
	    };
	    BaseGraph.prototype.addNode = function (node) {
	        if (this.hasNodeID(node.getID())) {
	            throw new Error("Won't add node with duplicate ID.");
	        }
	        this._nodes[node.getID()] = node;
	        this._nr_nodes += 1;
	        return true;
	    };
	    /**
	     * Instantiates a new node object, copies the features and
	     * adds the node to the graph, but does NOT clone it's edges
	     * @param node the node object to clone
	     */
	    BaseGraph.prototype.cloneAndAddNode = function (node) {
	        var new_node = new $N.BaseNode(node.getID());
	        new_node.setFeatures($DS.clone(node.getFeatures()));
	        this._nodes[node.getID()] = new_node;
	        this._nr_nodes += 1;
	        return new_node;
	    };
	    BaseGraph.prototype.hasNodeID = function (id) {
	        return !!this._nodes[id];
	    };
	    BaseGraph.prototype.getNodeById = function (id) {
	        return this._nodes[id];
	    };
	    BaseGraph.prototype.getNodes = function () {
	        return this._nodes;
	    };
	    /**
	     * CAUTION - This function takes linear time in # nodes
	     */
	    BaseGraph.prototype.getRandomNode = function () {
	        return this.pickRandomProperty(this._nodes);
	    };
	    BaseGraph.prototype.deleteNode = function (node) {
	        var rem_node = this._nodes[node.getID()];
	        if (!rem_node) {
	            throw new Error('Cannot remove un-added node.');
	        }
	        // Edges?
	        var in_deg = node.inDegree();
	        var out_deg = node.outDegree();
	        var deg = node.degree();
	        // Delete all edges brutally...
	        if (in_deg) {
	            this.deleteInEdgesOf(node);
	        }
	        if (out_deg) {
	            this.deleteOutEdgesOf(node);
	        }
	        if (deg) {
	            this.deleteUndEdgesOf(node);
	        }
	        delete this._nodes[node.getID()];
	        this._nr_nodes -= 1;
	    };
	    BaseGraph.prototype.hasEdgeID = function (id) {
	        return !!this._dir_edges[id] || !!this._und_edges[id];
	    };
	    BaseGraph.prototype.getEdgeById = function (id) {
	        var edge = this._dir_edges[id] || this._und_edges[id];
	        if (!edge) {
	            throw new Error("cannot retrieve edge with non-existing ID.");
	        }
	        return edge;
	    };
	    BaseGraph.prototype.checkExistanceOfEdgeNodes = function (node_a, node_b) {
	        if (!node_a) {
	            throw new Error("Cannot find edge. Node A does not exist (in graph).");
	        }
	        if (!node_b) {
	            throw new Error("Cannot find edge. Node B does not exist (in graph).");
	        }
	    };
	    // get the edge from node_a to node_b (or undirected)
	    BaseGraph.prototype.getDirEdgeByNodeIDs = function (node_a_id, node_b_id) {
	        var node_a = this.getNodeById(node_a_id);
	        var node_b = this.getNodeById(node_b_id);
	        this.checkExistanceOfEdgeNodes(node_a, node_b);
	        // check for outgoing directed edges
	        var edges_dir = node_a.outEdges(), edges_dir_keys = Object.keys(edges_dir);
	        for (var i = 0; i < edges_dir_keys.length; i++) {
	            var edge = edges_dir[edges_dir_keys[i]];
	            if (edge.getNodes().b.getID() == node_b_id) {
	                return edge;
	            }
	        }
	        // if we managed to arrive here, there is no edge!
	        throw new Error("Cannot find edge. There is no edge between Node " + node_a_id + " and " + node_b_id + ".");
	    };
	    BaseGraph.prototype.getUndEdgeByNodeIDs = function (node_a_id, node_b_id) {
	        var node_a = this.getNodeById(node_a_id);
	        var node_b = this.getNodeById(node_b_id);
	        this.checkExistanceOfEdgeNodes(node_a, node_b);
	        // check for undirected edges
	        var edges_und = node_a.undEdges(), edges_und_keys = Object.keys(edges_und);
	        for (var i = 0; i < edges_und_keys.length; i++) {
	            var edge = edges_und[edges_und_keys[i]];
	            var b;
	            (edge.getNodes().a.getID() == node_a_id) ? (b = edge.getNodes().b.getID()) : (b = edge.getNodes().a.getID());
	            if (b == node_b_id) {
	                return edge;
	            }
	        }
	    };
	    BaseGraph.prototype.getDirEdges = function () {
	        return this._dir_edges;
	    };
	    BaseGraph.prototype.getUndEdges = function () {
	        return this._und_edges;
	    };
	    BaseGraph.prototype.getDirEdgesArray = function () {
	        var edges = [];
	        for (var e_id in this._dir_edges) {
	            edges.push(this._dir_edges[e_id]);
	        }
	        return edges;
	    };
	    BaseGraph.prototype.getUndEdgesArray = function () {
	        var edges = [];
	        for (var e_id in this._und_edges) {
	            edges.push(this._und_edges[e_id]);
	        }
	        return edges;
	    };
	    BaseGraph.prototype.addEdgeByNodeIDs = function (label, node_a_id, node_b_id, opts) {
	        var node_a = this.getNodeById(node_a_id), node_b = this.getNodeById(node_b_id);
	        if (!node_a) {
	            throw new Error("Cannot add edge. Node A does not exist");
	        }
	        else if (!node_b) {
	            throw new Error("Cannot add edge. Node B does not exist");
	        }
	        else {
	            return this.addEdgeByID(label, node_a, node_b, opts);
	        }
	    };
	    /**
	     * Now all test cases pertaining addEdge() call this one...
	     */
	    BaseGraph.prototype.addEdgeByID = function (id, node_a, node_b, opts) {
	        var edge = new $E.BaseEdge(id, node_a, node_b, opts || {});
	        return this.addEdge(edge);
	    };
	    /**
	     * Test cases should be reversed / completed
	     */
	    BaseGraph.prototype.addEdge = function (edge) {
	        var node_a = edge.getNodes().a, node_b = edge.getNodes().b;
	        if (!this.hasNodeID(node_a.getID()) || !this.hasNodeID(node_b.getID())
	            || this._nodes[node_a.getID()] !== node_a || this._nodes[node_b.getID()] !== node_b) {
	            throw new Error("can only add edge between two nodes existing in graph");
	        }
	        // connect edge to first node anyways
	        node_a.addEdge(edge);
	        if (edge.isDirected()) {
	            // add edge to second node too
	            node_b.addEdge(edge);
	            this._dir_edges[edge.getID()] = edge;
	            this._nr_dir_edges += 1;
	            this.updateGraphMode();
	        }
	        else {
	            // add edge to both nodes, except they are the same...
	            if (node_a !== node_b) {
	                node_b.addEdge(edge);
	            }
	            this._und_edges[edge.getID()] = edge;
	            this._nr_und_edges += 1;
	            this.updateGraphMode();
	        }
	        return edge;
	    };
	    BaseGraph.prototype.deleteEdge = function (edge) {
	        var dir_edge = this._dir_edges[edge.getID()];
	        var und_edge = this._und_edges[edge.getID()];
	        if (!dir_edge && !und_edge) {
	            throw new Error('cannot remove non-existing edge.');
	        }
	        var nodes = edge.getNodes();
	        nodes.a.removeEdge(edge);
	        if (nodes.a !== nodes.b) {
	            nodes.b.removeEdge(edge);
	        }
	        if (dir_edge) {
	            delete this._dir_edges[edge.getID()];
	            this._nr_dir_edges -= 1;
	        }
	        else {
	            delete this._und_edges[edge.getID()];
	            this._nr_und_edges -= 1;
	        }
	        this.updateGraphMode();
	    };
	    // Some atomicity / rollback feature would be nice here...
	    BaseGraph.prototype.deleteInEdgesOf = function (node) {
	        this.checkConnectedNodeOrThrow(node);
	        var in_edges = node.inEdges();
	        var key, edge;
	        for (key in in_edges) {
	            edge = in_edges[key];
	            edge.getNodes().a.removeEdge(edge);
	            delete this._dir_edges[edge.getID()];
	            this._nr_dir_edges -= 1;
	        }
	        node.clearInEdges();
	        this.updateGraphMode();
	    };
	    // Some atomicity / rollback feature would be nice here...
	    BaseGraph.prototype.deleteOutEdgesOf = function (node) {
	        this.checkConnectedNodeOrThrow(node);
	        var out_edges = node.outEdges();
	        var key, edge;
	        for (key in out_edges) {
	            edge = out_edges[key];
	            edge.getNodes().b.removeEdge(edge);
	            delete this._dir_edges[edge.getID()];
	            this._nr_dir_edges -= 1;
	        }
	        node.clearOutEdges();
	        this.updateGraphMode();
	    };
	    // Some atomicity / rollback feature would be nice here...
	    BaseGraph.prototype.deleteDirEdgesOf = function (node) {
	        this.deleteInEdgesOf(node);
	        this.deleteOutEdgesOf(node);
	    };
	    // Some atomicity / rollback feature would be nice here...
	    BaseGraph.prototype.deleteUndEdgesOf = function (node) {
	        this.checkConnectedNodeOrThrow(node);
	        var und_edges = node.undEdges();
	        var key, edge;
	        for (key in und_edges) {
	            edge = und_edges[key];
	            var conns = edge.getNodes();
	            conns.a.removeEdge(edge);
	            if (conns.a !== conns.b) {
	                conns.b.removeEdge(edge);
	            }
	            delete this._und_edges[edge.getID()];
	            this._nr_und_edges -= 1;
	        }
	        node.clearUndEdges();
	        this.updateGraphMode();
	    };
	    // Some atomicity / rollback feature would be nice here...
	    BaseGraph.prototype.deleteAllEdgesOf = function (node) {
	        this.deleteDirEdgesOf(node);
	        this.deleteUndEdgesOf(node);
	    };
	    /**
	     * Remove all the (un)directed edges in the graph
	     */
	    BaseGraph.prototype.clearAllDirEdges = function () {
	        for (var edge in this._dir_edges) {
	            this.deleteEdge(this._dir_edges[edge]);
	        }
	    };
	    BaseGraph.prototype.clearAllUndEdges = function () {
	        for (var edge in this._und_edges) {
	            this.deleteEdge(this._und_edges[edge]);
	        }
	    };
	    BaseGraph.prototype.clearAllEdges = function () {
	        this.clearAllDirEdges();
	        this.clearAllUndEdges();
	    };
	    /**
	     * CAUTION - This function is linear in # directed edges
	     */
	    BaseGraph.prototype.getRandomDirEdge = function () {
	        return this.pickRandomProperty(this._dir_edges);
	    };
	    /**
	     * CAUTION - This function is linear in # undirected edges
	     */
	    BaseGraph.prototype.getRandomUndEdge = function () {
	        return this.pickRandomProperty(this._und_edges);
	    };
	    BaseGraph.prototype.clone = function () {
	        var new_graph = new BaseGraph(this._label), old_nodes = this.getNodes(), old_edge, new_node_a = null, new_node_b = null;
	        for (var node_id in old_nodes) {
	            new_graph.addNode(old_nodes[node_id].clone());
	        }
	        [this.getDirEdges(), this.getUndEdges()].forEach(function (old_edges) {
	            for (var edge_id in old_edges) {
	                old_edge = old_edges[edge_id];
	                new_node_a = new_graph.getNodeById(old_edge.getNodes().a.getID());
	                new_node_b = new_graph.getNodeById(old_edge.getNodes().b.getID());
	                new_graph.addEdge(old_edge.clone(new_node_a, new_node_b));
	            }
	        });
	        return new_graph;
	    };
	    BaseGraph.prototype.cloneSubGraph = function (root, cutoff) {
	        var new_graph = new BaseGraph(this._label);
	        var config = $BFS.prepareBFSStandardConfig();
	        var bfsNodeUnmarkedTestCallback = function (context) {
	            if (config.result[context.next_node.getID()].counter > cutoff) {
	                context.queue = [];
	            }
	            else { //This means we only add cutoff -1 nodes to the cloned graph, # of nodes is then equal to cutoff
	                new_graph.addNode(context.next_node.clone());
	            }
	        };
	        config.callbacks.node_unmarked.push(bfsNodeUnmarkedTestCallback);
	        $BFS.BFS(this, root, config);
	        var old_edge, new_node_a = null, new_node_b = null;
	        [this.getDirEdges(), this.getUndEdges()].forEach(function (old_edges) {
	            for (var edge_id in old_edges) {
	                old_edge = old_edges[edge_id];
	                new_node_a = new_graph.getNodeById(old_edge.getNodes().a.getID());
	                new_node_b = new_graph.getNodeById(old_edge.getNodes().b.getID());
	                if (new_node_a != null && new_node_b != null)
	                    new_graph.addEdge(old_edge.clone(new_node_a, new_node_b));
	            }
	        });
	        return new_graph;
	    };
	    BaseGraph.prototype.checkConnectedNodeOrThrow = function (node) {
	        var node = this._nodes[node.getID()];
	        if (!node) {
	            throw new Error('Cowardly refusing to delete edges of un-added node.');
	        }
	    };
	    BaseGraph.prototype.updateGraphMode = function () {
	        var nr_dir = this._nr_dir_edges, nr_und = this._nr_und_edges;
	        if (nr_dir && nr_und) {
	            this._mode = GraphMode.MIXED;
	        }
	        else if (nr_dir) {
	            this._mode = GraphMode.DIRECTED;
	        }
	        else if (nr_und) {
	            this._mode = GraphMode.UNDIRECTED;
	        }
	        else {
	            this._mode = GraphMode.INIT;
	        }
	    };
	    BaseGraph.prototype.pickRandomProperty = function (propList) {
	        var tmpList = Object.keys(propList);
	        var randomPropertyName = tmpList[Math.floor(Math.random() * tmpList.length)];
	        return propList[randomPropertyName];
	    };
	    /**
	     * In some cases we need to give back a large number of objects
	     * in one swoop, as calls to Object.keys() are really slow
	     * for large input objects.
	     *
	     * In order to do this, we only extract the keys once and then
	     * iterate over the key list and add them to a result array
	     * with probability = amount / keys.length
	     *
	     * We also mark all used keys in case we haven't picked up
	     * enough entities for the result array after the first round.
	     * We then just fill up the rest of the result array linearly
	     * with as many unused keys as necessary
	     *
	     *
	     * @todo include generic Test Cases
	     * @todo check if amount is larger than propList size
	     * @todo This seems like a simple hack - filling up remaining objects
	     * Could be replaced by a better fraction-increasing function above...
	     *
	     * @param propList
	     * @param fraction
	     * @returns {Array}
	     */
	    BaseGraph.prototype.pickRandomProperties = function (propList, amount) {
	        var ids = [];
	        var keys = Object.keys(propList);
	        var fraction = amount / keys.length;
	        var used_keys = {};
	        for (var i = 0; ids.length < amount && i < keys.length; i++) {
	            if (Math.random() < fraction) {
	                ids.push(keys[i]);
	                used_keys[keys[i]] = i;
	            }
	        }
	        var diff = amount - ids.length;
	        for (var i = 0; i < keys.length && diff; i++) {
	            if (used_keys[keys[i]] == null) {
	                ids.push(keys[i]);
	                diff--;
	            }
	        }
	        return ids;
	    };
	    return BaseGraph;
	}());
	exports.BaseGraph = BaseGraph;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	/// <reference path="../../typings/tsd.d.ts" />
	Object.defineProperty(exports, "__esModule", { value: true });
	var $SU = __webpack_require__(9);
	var BaseNode = /** @class */ (function () {
	    function BaseNode(_id, features) {
	        this._id = _id;
	        this._in_degree = 0;
	        this._out_degree = 0;
	        this._und_degree = 0;
	        this._in_edges = {};
	        this._out_edges = {};
	        this._und_edges = {};
	        this._features = typeof features !== 'undefined' ? $SU.clone(features) : {};
	        this._label = this._features["label"] || this._id;
	    }
	    BaseNode.prototype.getID = function () {
	        return this._id;
	    };
	    BaseNode.prototype.getLabel = function () {
	        return this._label;
	    };
	    BaseNode.prototype.setLabel = function (label) {
	        this._label = label;
	    };
	    BaseNode.prototype.getFeatures = function () {
	        return this._features;
	    };
	    BaseNode.prototype.getFeature = function (key) {
	        return this._features[key];
	        // if ( !feat ) {
	        // 	throw new Error("Cannot retrieve non-existing feature.");
	        // }
	        // return feat;
	    };
	    BaseNode.prototype.setFeatures = function (features) {
	        this._features = $SU.clone(features);
	    };
	    BaseNode.prototype.setFeature = function (key, value) {
	        this._features[key] = value;
	    };
	    BaseNode.prototype.deleteFeature = function (key) {
	        var feat = this._features[key];
	        // if ( !feat ) {
	        // 	throw new Error("Cannot delete non-existing feature.");
	        // }
	        delete this._features[key];
	        return feat;
	    };
	    BaseNode.prototype.clearFeatures = function () {
	        this._features = {};
	    };
	    BaseNode.prototype.inDegree = function () {
	        return this._in_degree;
	    };
	    BaseNode.prototype.outDegree = function () {
	        return this._out_degree;
	    };
	    BaseNode.prototype.degree = function () {
	        return this._und_degree;
	    };
	    /**
	     * We have to:
	     * 1. throw an error if the edge is already attached
	     * 2. add it to the edge array
	     * 3. check type of edge (directed / undirected)
	     * 4. update our degrees accordingly
	     * This is a design decision we can defend by pointing out
	     * that querying degrees will occur much more often
	     * than modifying the edge structure of a node (??)
	     * One further point: do we also check for duplicate
	     * edges not in the sense of duplicate ID's but duplicate
	     * structure (nodes, direction) ?
	     * => Not for now, as we would have to check every edge
	     * instead of simply checking the hash id...
	     * ALTHOUGH: adding edges will (presumably) not occur often...
	     */
	    BaseNode.prototype.addEdge = function (edge) {
	        // is this edge connected to us at all?
	        var nodes = edge.getNodes();
	        if (nodes.a !== this && nodes.b !== this) {
	            throw new Error("Cannot add edge that does not connect to this node");
	        }
	        var edge_id = edge.getID();
	        // Is it an undirected or directed edge?
	        if (edge.isDirected()) {
	            // is it outgoing or incoming?
	            if (nodes.a === this && !this._out_edges[edge_id]) {
	                this._out_edges[edge_id] = edge;
	                this._out_degree += 1;
	                // Is the edge also connecting to ourselves -> loop ?
	                if (nodes.b === this && !this._in_edges[edge_id]) {
	                    this._in_edges[edge.getID()] = edge;
	                    this._in_degree += 1;
	                }
	            }
	            else if (!this._in_edges[edge_id]) { // nodes.b === this
	                this._in_edges[edge.getID()] = edge;
	                this._in_degree += 1;
	            }
	        }
	        else {
	            // Is the edge also connecting to ourselves -> loop
	            if (this._und_edges[edge.getID()]) {
	                throw new Error("Cannot add same undirected edge multiple times.");
	            }
	            this._und_edges[edge.getID()] = edge;
	            this._und_degree += 1;
	        }
	    };
	    BaseNode.prototype.hasEdge = function (edge) {
	        return !!this._in_edges[edge.getID()] || !!this._out_edges[edge.getID()] || !!this._und_edges[edge.getID()];
	    };
	    BaseNode.prototype.hasEdgeID = function (id) {
	        return !!this._in_edges[id] || !!this._out_edges[id] || !!this._und_edges[id];
	    };
	    BaseNode.prototype.getEdge = function (id) {
	        var edge = this._in_edges[id] || this._out_edges[id] || this._und_edges[id];
	        if (!edge) {
	            throw new Error("Cannot retrieve non-existing edge.");
	        }
	        return edge;
	    };
	    BaseNode.prototype.inEdges = function () {
	        return this._in_edges;
	    };
	    BaseNode.prototype.outEdges = function () {
	        return this._out_edges;
	    };
	    BaseNode.prototype.undEdges = function () {
	        return this._und_edges;
	    };
	    BaseNode.prototype.dirEdges = function () {
	        return $SU.mergeObjects([this._in_edges, this._out_edges]);
	    };
	    BaseNode.prototype.allEdges = function () {
	        return $SU.mergeObjects([this._in_edges, this._out_edges, this._und_edges]);
	    };
	    BaseNode.prototype.removeEdge = function (edge) {
	        if (!this.hasEdge(edge)) {
	            throw new Error("Cannot remove unconnected edge.");
	        }
	        var id = edge.getID();
	        var e = this._und_edges[id];
	        if (e) {
	            delete this._und_edges[id];
	            this._und_degree -= 1;
	        }
	        e = this._in_edges[id];
	        if (e) {
	            delete this._in_edges[id];
	            this._in_degree -= 1;
	        }
	        e = this._out_edges[id];
	        if (e) {
	            delete this._out_edges[id];
	            this._out_degree -= 1;
	        }
	    };
	    BaseNode.prototype.removeEdgeID = function (id) {
	        if (!this.hasEdgeID(id)) {
	            throw new Error("Cannot remove unconnected edge.");
	        }
	        var e = this._und_edges[id];
	        if (e) {
	            delete this._und_edges[id];
	            this._und_degree -= 1;
	        }
	        e = this._in_edges[id];
	        if (e) {
	            delete this._in_edges[id];
	            this._in_degree -= 1;
	        }
	        e = this._out_edges[id];
	        if (e) {
	            delete this._out_edges[id];
	            this._out_degree -= 1;
	        }
	    };
	    BaseNode.prototype.clearOutEdges = function () {
	        this._out_edges = {};
	        this._out_degree = 0;
	    };
	    BaseNode.prototype.clearInEdges = function () {
	        this._in_edges = {};
	        this._in_degree = 0;
	    };
	    BaseNode.prototype.clearUndEdges = function () {
	        this._und_edges = {};
	        this._und_degree = 0;
	    };
	    BaseNode.prototype.clearEdges = function () {
	        this.clearInEdges();
	        this.clearOutEdges();
	        this.clearUndEdges();
	    };
	    BaseNode.prototype.prevNodes = function () {
	        var prevs = [];
	        var key, edge;
	        for (key in this._in_edges) {
	            if (this._in_edges.hasOwnProperty(key)) {
	                edge = this._in_edges[key];
	                prevs.push({
	                    node: edge.getNodes().a,
	                    edge: edge
	                });
	            }
	        }
	        return prevs;
	    };
	    BaseNode.prototype.nextNodes = function () {
	        var nexts = [];
	        var key, edge;
	        for (key in this._out_edges) {
	            if (this._out_edges.hasOwnProperty(key)) {
	                edge = this._out_edges[key];
	                nexts.push({
	                    node: edge.getNodes().b,
	                    edge: edge
	                });
	            }
	        }
	        return nexts;
	    };
	    BaseNode.prototype.connNodes = function () {
	        var conns = [];
	        var key, edge;
	        for (key in this._und_edges) {
	            if (this._und_edges.hasOwnProperty(key)) {
	                edge = this._und_edges[key];
	                var nodes = edge.getNodes();
	                if (nodes.a === this) {
	                    conns.push({
	                        node: edge.getNodes().b,
	                        edge: edge
	                    });
	                }
	                else {
	                    conns.push({
	                        node: edge.getNodes().a,
	                        edge: edge
	                    });
	                }
	            }
	        }
	        return conns;
	    };
	    /**
	     *
	     * @param identityFunc can be used to remove 'duplicates' from resulting array,
	     * if necessary
	     * @returns {Array}
	     *
	   */
	    BaseNode.prototype.reachNodes = function (identityFunc) {
	        var identity = 0;
	        // console.log(this.nextNodes());
	        return $SU.mergeArrays([this.nextNodes(), this.connNodes()], identityFunc || function (ne) { return identity++; });
	    };
	    BaseNode.prototype.clone = function () {
	        var new_node = new BaseNode(this._id);
	        new_node.setFeatures(this.getFeatures());
	        return new_node;
	    };
	    return BaseNode;
	}());
	exports.BaseNode = BaseNode;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	/// <reference path="../../typings/tsd.d.ts" />
	Object.defineProperty(exports, "__esModule", { value: true });
	var $N = __webpack_require__(8);
	var $E = __webpack_require__(10);
	/**
	 * Method to deep clone an object
	 *
	 * @param obj
	 * @returns {*}
	 *
	 */
	function clone(obj) {
	    if (obj === null || typeof obj !== 'object') {
	        return obj;
	    }
	    // check for nodes or edges and ignore them
	    if (obj instanceof $N.BaseNode || obj instanceof $E.BaseEdge) {
	        return;
	    }
	    var cloneObj = obj.constructor ? obj.constructor() : {};
	    for (var attribute in obj) {
	        if (!obj.hasOwnProperty(attribute)) {
	            continue;
	        }
	        if (typeof obj[attribute] === "object") {
	            cloneObj[attribute] = clone(obj[attribute]);
	        }
	        else {
	            cloneObj[attribute] = obj[attribute];
	        }
	    }
	    return cloneObj;
	}
	exports.clone = clone;
	/**
	 * @args an Array of any kind of objects
	 * @cb callback to return a unique identifier;
	 * if this is duplicate, the object will not be stored in result.
	 * @returns {Array}
	 */
	function mergeArrays(args, cb) {
	    if (cb === void 0) { cb = undefined; }
	    for (var arg_idx in args) {
	        if (!Array.isArray(args[arg_idx])) {
	            throw new Error('Will only mergeArrays arrays');
	        }
	    }
	    var seen = {}, result = [], identity;
	    for (var i = 0; i < args.length; i++) {
	        for (var j = 0; j < args[i].length; j++) {
	            identity = typeof cb !== 'undefined' ? cb(args[i][j]) : args[i][j];
	            if (seen[identity] !== true) {
	                result.push(args[i][j]);
	                seen[identity] = true;
	            }
	        }
	    }
	    return result;
	}
	exports.mergeArrays = mergeArrays;
	/**
	 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
	 * @param args Array of all the object to take keys from
	 * @returns result object
	 */
	function mergeObjects(args) {
	    for (var i = 0; i < args.length; i++) {
	        if (Object.prototype.toString.call(args[i]) !== '[object Object]') {
	            throw new Error('Will only take objects as inputs');
	        }
	    }
	    var result = {};
	    for (var i = 0; i < args.length; i++) {
	        for (var key in args[i]) {
	            if (args[i].hasOwnProperty(key)) {
	                result[key] = args[i][key];
	            }
	        }
	    }
	    return result;
	}
	exports.mergeObjects = mergeObjects;
	/**
	 * @TODO Test !!!
	 *
	 * @param object
	 * @param cb
	 */
	function findKey(obj, cb) {
	    for (var key in obj) {
	        if (obj.hasOwnProperty(key) && cb(obj[key])) {
	            return key;
	        }
	    }
	    return undefined;
	}
	exports.findKey = findKey;
	/**
	 * Takes two ordered number arrays and merges them. The returned array is
	 * also ordered and does not contain any duplicates.
	 *
	 * @param a: first array
	 * @param b: second array
	 */
	function mergeOrderedArraysNoDups(a, b) {
	    var ret = [];
	    var idx_a = 0;
	    var idx_b = 0;
	    if (a[0] != null && b[0] != null) {
	        while (true) {
	            if (idx_a >= a.length || idx_b >= b.length)
	                break;
	            if (a[idx_a] == b[idx_b]) {
	                if (ret[ret.length - 1] != a[idx_a])
	                    ret.push(a[idx_a]);
	                idx_a++;
	                idx_b++;
	                continue;
	            }
	            if (a[idx_a] < b[idx_b]) {
	                ret.push(a[idx_a]);
	                idx_a++;
	                continue;
	            }
	            if (b[idx_b] < a[idx_a]) {
	                ret.push(b[idx_b]);
	                idx_b++;
	            }
	        }
	    }
	    while (idx_a < a.length) {
	        if (a[idx_a] != null)
	            ret.push(a[idx_a]);
	        idx_a++;
	    }
	    while (idx_b < b.length) {
	        if (b[idx_b] != null)
	            ret.push(b[idx_b]);
	        idx_b++;
	    }
	    return ret;
	}
	exports.mergeOrderedArraysNoDups = mergeOrderedArraysNoDups;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var $N = __webpack_require__(8);
	var BaseEdge = /** @class */ (function () {
	    function BaseEdge(_id, _node_a, _node_b, options) {
	        this._id = _id;
	        this._node_a = _node_a;
	        this._node_b = _node_b;
	        if (!(_node_a instanceof $N.BaseNode) || !(_node_b instanceof $N.BaseNode)) {
	            throw new Error("cannot instantiate edge without two valid node objects");
	        }
	        options = options || {};
	        this._directed = options.directed || false;
	        this._weighted = options.weighted || false;
	        // @NOTE isNaN and Number.isNaN confusion...
	        this._weight = this._weighted ? (isNaN(options.weight) ? 1 : options.weight) : undefined;
	        this._label = options.label || this._id;
	    }
	    BaseEdge.prototype.getID = function () {
	        return this._id;
	    };
	    BaseEdge.prototype.getLabel = function () {
	        return this._label;
	    };
	    BaseEdge.prototype.setLabel = function (label) {
	        this._label = label;
	    };
	    BaseEdge.prototype.isDirected = function () {
	        return this._directed;
	    };
	    BaseEdge.prototype.isWeighted = function () {
	        return this._weighted;
	    };
	    BaseEdge.prototype.getWeight = function () {
	        return this._weight;
	    };
	    BaseEdge.prototype.setWeight = function (w) {
	        if (!this._weighted) {
	            throw new Error("Cannot set weight on unweighted edge.");
	        }
	        this._weight = w;
	    };
	    BaseEdge.prototype.getNodes = function () {
	        return { a: this._node_a, b: this._node_b };
	    };
	    BaseEdge.prototype.clone = function (new_node_a, new_node_b) {
	        if (!(new_node_a instanceof $N.BaseNode) || !(new_node_b instanceof $N.BaseNode)) {
	            throw new Error("refusing to clone edge if any new node is invalid");
	        }
	        return new BaseEdge(this._id, new_node_a, new_node_b, {
	            directed: this._directed,
	            weighted: this._weighted,
	            weight: this._weight,
	            label: this._label
	        });
	    };
	    return BaseEdge;
	}());
	exports.BaseEdge = BaseEdge;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var run_config_1 = __webpack_require__(12);
	var Logger = /** @class */ (function () {
	    function Logger(config) {
	        this.config = null;
	        this.config = config || run_config_1.RUN_CONFIG;
	    }
	    Logger.prototype.log = function (msg) {
	        if (this.config.log_level === run_config_1.LOG_LEVELS.debug) {
	            console.log.apply(console, Array.prototype.slice.call(arguments));
	            return true;
	        }
	        return false;
	    };
	    Logger.prototype.error = function (err) {
	        if (this.config.log_level === run_config_1.LOG_LEVELS.debug) {
	            console.error.apply(console, Array.prototype.slice.call(arguments));
	            return true;
	        }
	        return false;
	    };
	    Logger.prototype.dir = function (obj) {
	        if (this.config.log_level === run_config_1.LOG_LEVELS.debug) {
	            console.dir.apply(console, Array.prototype.slice.call(arguments));
	            return true;
	        }
	        return false;
	    };
	    Logger.prototype.info = function (msg) {
	        if (this.config.log_level === run_config_1.LOG_LEVELS.debug) {
	            console.info.apply(console, Array.prototype.slice.call(arguments));
	            return true;
	        }
	        return false;
	    };
	    Logger.prototype.warn = function (msg) {
	        if (this.config.log_level === run_config_1.LOG_LEVELS.debug) {
	            console.warn.apply(console, Array.prototype.slice.call(arguments));
	            return true;
	        }
	        return false;
	    };
	    return Logger;
	}());
	exports.Logger = Logger;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var LOG_LEVELS = {
	    debug: "debug",
	    production: "production"
	};
	exports.LOG_LEVELS = LOG_LEVELS;
	var RUN_CONFIG = {
	    log_level: process.env['G_LOG'] // LOG_LEVELS.debug
	};
	exports.RUN_CONFIG = RUN_CONFIG;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(13)))

/***/ }),
/* 13 */
/***/ (function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	process.prependListener = noop;
	process.prependOnceListener = noop;

	process.listeners = function (name) { return [] }

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	/// <reference path="../../typings/tsd.d.ts" />
	Object.defineProperty(exports, "__esModule", { value: true });
	var $G = __webpack_require__(7);
	var $CB = __webpack_require__(15);
	/**
	 * Breadth first search - usually performed to see
	 * reachability etc. Therefore we do not want 'segments'
	 * or 'components' of our graph, but simply one well
	 * defined result segment covering the whole graph.
	 *
	 * @param graph the graph to perform BFS on
	 * @param v the vertex to use as a start vertex
	 * @param config an optional config object, will be
	 * automatically instantiated if not passed by caller
	 * @returns {{}}
	 * @constructor
	 */
	function BFS(graph, v, config) {
	    var config = config || prepareBFSStandardConfig(), callbacks = config.callbacks, dir_mode = config.dir_mode;
	    /**
	     * We are not traversing an empty graph...
	     */
	    if (graph.getMode() === $G.GraphMode.INIT) {
	        throw new Error('Cowardly refusing to traverse graph without edges.');
	    }
	    /**
	     * We are not traversing a graph taking NO edges into account
	     */
	    if (dir_mode === $G.GraphMode.INIT) {
	        throw new Error('Cannot traverse a graph with dir_mode set to INIT.');
	    }
	    // scope to pass to callbacks at different stages of execution
	    var bfsScope = {
	        marked: {},
	        nodes: graph.getNodes(),
	        queue: [],
	        current: null,
	        next_node: null,
	        next_edge: null,
	        root_node: v,
	        adj_nodes: []
	    };
	    /**
	       * HOOK 1: BFS INIT
	       */
	    if (callbacks.init_bfs) {
	        $CB.execCallbacks(callbacks.init_bfs, bfsScope);
	    }
	    bfsScope.queue.push(v);
	    var i = 0;
	    while (i < bfsScope.queue.length) {
	        bfsScope.current = bfsScope.queue[i++];
	        /**
	         * Do we move only in the directed subgraph,
	         * undirected subgraph or complete (mixed) graph?
	         */
	        if (dir_mode === $G.GraphMode.MIXED) {
	            bfsScope.adj_nodes = bfsScope.current.reachNodes();
	        }
	        else if (dir_mode === $G.GraphMode.UNDIRECTED) {
	            bfsScope.adj_nodes = bfsScope.current.connNodes();
	        }
	        else if (dir_mode === $G.GraphMode.DIRECTED) {
	            bfsScope.adj_nodes = bfsScope.current.nextNodes();
	        }
	        else {
	            bfsScope.adj_nodes = [];
	        }
	        /**
	         * HOOK 2 - Sort adjacent nodes
	         */
	        if (typeof callbacks.sort_nodes === 'function') {
	            callbacks.sort_nodes(bfsScope);
	        }
	        for (var adj_idx in bfsScope.adj_nodes) {
	            bfsScope.next_node = bfsScope.adj_nodes[adj_idx].node;
	            bfsScope.next_edge = bfsScope.adj_nodes[adj_idx].edge;
	            /**
	             * HOOK 3 - Node unmarked
	             */
	            if (config.result[bfsScope.next_node.getID()].distance === Number.POSITIVE_INFINITY) {
	                if (callbacks.node_unmarked) {
	                    $CB.execCallbacks(callbacks.node_unmarked, bfsScope);
	                }
	            }
	            else {
	                /**
	                 * HOOK 4 - Node marked
	                 */
	                if (callbacks.node_marked) {
	                    $CB.execCallbacks(callbacks.node_marked, bfsScope);
	                }
	            }
	        }
	    }
	    return config.result;
	}
	exports.BFS = BFS;
	function prepareBFSStandardConfig() {
	    var config = {
	        result: {},
	        callbacks: {
	            init_bfs: [],
	            node_unmarked: [],
	            node_marked: [],
	            sort_nodes: undefined
	        },
	        dir_mode: $G.GraphMode.MIXED,
	        messages: {},
	        filters: {}
	    }, result = config.result, callbacks = config.callbacks;
	    var count = 0;
	    var counter = function () {
	        return count++;
	    };
	    // Standard INIT callback
	    var initBFS = function (context) {
	        // initialize all nodes to infinite distance
	        for (var key in context.nodes) {
	            config.result[key] = {
	                distance: Number.POSITIVE_INFINITY,
	                parent: null,
	                counter: -1
	            };
	        }
	        // initialize root node entry
	        config.result[context.root_node.getID()] = {
	            distance: 0,
	            parent: context.root_node,
	            counter: counter()
	        };
	    };
	    callbacks.init_bfs.push(initBFS);
	    // Standard Node unmarked callback
	    // have to populate respective result entry
	    var nodeUnmarked = function (context) {
	        config.result[context.next_node.getID()] = {
	            distance: result[context.current.getID()].distance + 1,
	            parent: context.current,
	            counter: counter()
	        };
	        context.queue.push(context.next_node);
	    };
	    callbacks.node_unmarked.push(nodeUnmarked);
	    return config;
	}
	exports.prepareBFSStandardConfig = prepareBFSStandardConfig;


/***/ }),
/* 15 */
/***/ (function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	/**
	 * @param context this pointer to the DFS or DFSVisit function
	 */
	function execCallbacks(cbs, context) {
	    cbs.forEach(function (cb) {
	        if (typeof cb === 'function') {
	            cb(context);
	        }
	        else {
	            throw new Error('Provided callback is not a function.');
	        }
	    });
	}
	exports.execCallbacks = execCallbacks;


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	/// <reference path="../../typings/tsd.d.ts" />
	Object.defineProperty(exports, "__esModule", { value: true });
	var $G = __webpack_require__(7);
	var $CB = __webpack_require__(15);
	/**
	 * DFS Visit - one run to see what nodes are reachable
	 * from a given "current" root node
	 *
	 * @param graph
	 * @param current_root
	 * @param config
	 * @returns {{}}
	 * @constructor
	 */
	function DFSVisit(graph, current_root, config) {
	    // scope to pass to callbacks at different stages of execution
	    var dfsVisitScope = {
	        stack: [],
	        adj_nodes: [],
	        stack_entry: null,
	        current: null,
	        current_root: current_root
	    };
	    var config = config || prepareDFSVisitStandardConfig(), callbacks = config.callbacks, dir_mode = config.dir_mode;
	    /**
	     * We are not traversing an empty graph...
	     */
	    if (graph.getMode() === $G.GraphMode.INIT) {
	        throw new Error('Cowardly refusing to traverse graph without edges.');
	    }
	    /**
	       * We are not traversing a graph taking NO edges into account
	       */
	    if (dir_mode === $G.GraphMode.INIT) {
	        throw new Error('Cannot traverse a graph with dir_mode set to INIT.');
	    }
	    /**
	     * HOOK 1 - INIT (INNER DFS VISIT):
	     * Initializing a possible result object,
	     * possibly with the current_root;
	     */
	    if (callbacks.init_dfs_visit) {
	        $CB.execCallbacks(callbacks.init_dfs_visit, dfsVisitScope);
	    }
	    // Start by pushing current root to the stack
	    dfsVisitScope.stack.push({
	        node: current_root,
	        parent: current_root,
	        weight: 0 // initial weight cost from current_root
	    });
	    while (dfsVisitScope.stack.length) {
	        dfsVisitScope.stack_entry = dfsVisitScope.stack.pop();
	        dfsVisitScope.current = dfsVisitScope.stack_entry.node;
	        /**
	         * HOOK 2 - AQUIRED CURRENT NODE / POPPED NODE
	         */
	        if (callbacks.node_popped) {
	            $CB.execCallbacks(callbacks.node_popped, dfsVisitScope);
	        }
	        if (!config.dfs_visit_marked[dfsVisitScope.current.getID()]) {
	            config.dfs_visit_marked[dfsVisitScope.current.getID()] = true;
	            /**
	             * HOOK 3 - CURRENT NODE UNMARKED
	             */
	            if (callbacks.node_unmarked) {
	                $CB.execCallbacks(callbacks.node_unmarked, dfsVisitScope);
	            }
	            /**
	             * Do we move only in the directed subgraph,
	             * undirected subgraph or complete (mixed) graph?
	             */
	            if (dir_mode === $G.GraphMode.MIXED) {
	                dfsVisitScope.adj_nodes = dfsVisitScope.current.reachNodes();
	            }
	            else if (dir_mode === $G.GraphMode.UNDIRECTED) {
	                dfsVisitScope.adj_nodes = dfsVisitScope.current.connNodes();
	            }
	            else if (dir_mode === $G.GraphMode.DIRECTED) {
	                dfsVisitScope.adj_nodes = dfsVisitScope.current.nextNodes();
	            }
	            /**
	             * HOOK 4 - SORT ADJACENT NODES
	             */
	            if (typeof callbacks.sort_nodes === 'function') {
	                callbacks.sort_nodes(dfsVisitScope);
	            }
	            for (var adj_idx in dfsVisitScope.adj_nodes) {
	                /**
	                 * HOOK 5 - NODE OR EDGE TYPE CHECK...
	                 * LATER !!
	                 */
	                if (callbacks) {
	                }
	                dfsVisitScope.stack.push({
	                    node: dfsVisitScope.adj_nodes[adj_idx].node,
	                    parent: dfsVisitScope.current,
	                    weight: dfsVisitScope.adj_nodes[adj_idx].edge.getWeight()
	                });
	            }
	            /**
	             * HOOK 6 - ADJACENT NODES PUSHED - LEAVING CURRENT NODE
	             */
	            if (callbacks.adj_nodes_pushed) {
	                $CB.execCallbacks(callbacks.adj_nodes_pushed, dfsVisitScope);
	            }
	        }
	        else {
	            /**
	             * HOOK 7 - CURRENT NODE ALREADY MARKED
	             */
	            if (callbacks.node_marked) {
	                $CB.execCallbacks(callbacks.node_marked, dfsVisitScope);
	            }
	        }
	    }
	    return config.visit_result;
	}
	exports.DFSVisit = DFSVisit;
	/**
	 * Depth first search - used for reachability / exploration
	 * of graph structure and as a basis for topological sorting
	 * and component / community analysis.
	 * Because DFS can be used as a basis for many other algorithms,
	 * we want to keep the result as generic as possible to be
	 * populated by the caller rather than the core DFS algorithm.
	 *
	 * @param graph
	 * @param root
	 * @param config
	 * @returns {{}[]}
	 * @constructor
	 */
	function DFS(graph, root, config) {
	    var config = config || prepareDFSStandardConfig(), callbacks = config.callbacks, dir_mode = config.dir_mode;
	    if (graph.getMode() === $G.GraphMode.INIT) {
	        throw new Error('Cowardly refusing to traverse graph without edges.');
	    }
	    if (dir_mode === $G.GraphMode.INIT) {
	        throw new Error('Cannot traverse a graph with dir_mode set to INIT.');
	    }
	    var dfsScope = {
	        marked: {},
	        nodes: graph.getNodes()
	    };
	    /**
	     * HOOK 1 - INIT (OUTER DFS)
	     */
	    if (callbacks.init_dfs) {
	        $CB.execCallbacks(callbacks.init_dfs, dfsScope);
	    }
	    callbacks.adj_nodes_pushed = callbacks.adj_nodes_pushed || [];
	    var markNode = function (context) {
	        dfsScope.marked[context.current.getID()] = true;
	    };
	    callbacks.adj_nodes_pushed.push(markNode);
	    // We need to put our results into segments
	    // for easy counting of 'components'
	    // TODO refactor for count & counter...
	    var dfs_result = [{}];
	    var dfs_idx = 0;
	    var count = 0;
	    var counter = function () {
	        return count++;
	    };
	    /**
	     * We not only add new nodes to the result object
	     * of DFSVisit, but also to it's appropriate
	     * segment of the dfs_result object
	     */
	    var addToProperSegment = function (context) {
	        dfs_result[dfs_idx][context.current.getID()] = {
	            parent: context.stack_entry.parent,
	            counter: counter()
	        };
	    };
	    // check if a callbacks object has been instantiated
	    if (callbacks && callbacks.node_unmarked) {
	        callbacks.node_unmarked.push(addToProperSegment);
	    }
	    // Start with root node, no matter what
	    DFSVisit(graph, root, config);
	    // Now take the rest in 'normal' order
	    for (var node_key in dfsScope.nodes) {
	        if (!dfsScope.marked[node_key]) {
	            // Next segment in dfs_results
	            dfs_idx++;
	            dfs_result.push({});
	            // Explore and fill next subsegment
	            DFSVisit(graph, dfsScope.nodes[node_key], config);
	        }
	    }
	    // console.dir(config.visit_result);
	    return dfs_result;
	}
	exports.DFS = DFS;
	/**
	 * This is the only place in which a config object
	 * is instantiated (except manually, of course)
	 *
	 * Therefore, we do not take any arguments
	 */
	function prepareDFSVisitStandardConfig() {
	    var config = {
	        visit_result: {},
	        callbacks: {},
	        messages: {},
	        dfs_visit_marked: {},
	        dir_mode: $G.GraphMode.MIXED
	    }, result = config.visit_result, callbacks = config.callbacks;
	    // internal variable for order of visit
	    // during DFS Visit                      
	    var count = 0;
	    var counter = function () {
	        return count++;
	    };
	    callbacks.init_dfs_visit = callbacks.init_dfs_visit || [];
	    var initDFSVisit = function (context) {
	        result[context.current_root.getID()] = {
	            parent: context.current_root
	        };
	    };
	    callbacks.init_dfs_visit.push(initDFSVisit);
	    callbacks.node_unmarked = callbacks.node_unmarked || [];
	    var setResultEntry = function (context) {
	        result[context.current.getID()] = {
	            parent: context.stack_entry.parent,
	            counter: counter()
	        };
	    };
	    callbacks.node_unmarked.push(setResultEntry);
	    return config;
	}
	exports.prepareDFSVisitStandardConfig = prepareDFSVisitStandardConfig;
	/**
	 * First instantiates config file for DFSVisit, then
	 * enhances it with outer DFS init callback
	 */
	function prepareDFSStandardConfig() {
	    // First prepare DFS Visit callbacks
	    var config = prepareDFSVisitStandardConfig(), callbacks = config.callbacks, result = config.visit_result;
	    // Now add outer DFS INIT callback
	    callbacks.init_dfs = callbacks.init_dfs || [];
	    var setInitialResultEntries = function (context) {
	        // for ( var node_id in context.nodes ) {
	        // 	result[node_id] = {
	        // 		parent: null,
	        // 		counter: -1
	        // 	}
	        // }
	    };
	    callbacks.init_dfs.push(setInitialResultEntries);
	    return config;
	}
	exports.prepareDFSStandardConfig = prepareDFSStandardConfig;
	;


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	/// <reference path="../../typings/tsd.d.ts" />
	Object.defineProperty(exports, "__esModule", { value: true });
	var PFS_1 = __webpack_require__(18);
	/**
	 *
	 * @param graph
	 * @param start
	 */
	function BFSanityChecks(graph, start) {
	    if (graph == null || start == null) {
	        throw new Error('Graph as well as start node have to be valid objects.');
	    }
	    if (graph.nrDirEdges() === 0 && graph.nrUndEdges() === 0) {
	        throw new Error('Cowardly refusing to traverse a graph without edges.');
	    }
	    if (!graph.hasNodeID(start.getID())) {
	        throw new Error('Cannot start from an outside node.');
	    }
	}
	function BellmanFordArray(graph, start) {
	    BFSanityChecks(graph, start);
	    var distances = [], nodes = graph.getNodes(), edge, node_keys = Object.keys(nodes), node, id_idx_map = {}, bf_edge_entry, new_weight, neg_cycle = false;
	    for (var n_idx = 0; n_idx < node_keys.length; ++n_idx) {
	        node = nodes[node_keys[n_idx]];
	        distances[n_idx] = (node === start) ? 0 : Number.POSITIVE_INFINITY;
	        id_idx_map[node.getID()] = n_idx;
	    }
	    // Initialize an edge array just holding the node indices, weight and directed
	    var graph_edges = graph.getDirEdgesArray().concat(graph.getUndEdgesArray());
	    var bf_edges = [];
	    for (var e_idx = 0; e_idx < graph_edges.length; ++e_idx) {
	        edge = graph_edges[e_idx];
	        var bf_edge_entry_1 = bf_edges.push([
	            id_idx_map[edge.getNodes().a.getID()],
	            id_idx_map[edge.getNodes().b.getID()],
	            isFinite(edge.getWeight()) ? edge.getWeight() : PFS_1.DEFAULT_WEIGHT,
	            edge.isDirected()
	        ]);
	    }
	    for (var i = 0; i < node_keys.length - 1; ++i) {
	        for (var e_idx = 0; e_idx < bf_edges.length; ++e_idx) {
	            edge = bf_edges[e_idx];
	            updateDist(edge[0], edge[1], edge[2]);
	            !edge[3] && updateDist(edge[1], edge[0], edge[2]);
	        }
	    }
	    for (var e_idx = 0; e_idx < bf_edges.length; ++e_idx) {
	        edge = bf_edges[e_idx];
	        if (betterDist(edge[0], edge[1], edge[2]) || (!edge[3] && betterDist(edge[1], edge[0], edge[2]))) {
	            neg_cycle = true;
	            break;
	        }
	    }
	    function updateDist(u, v, weight) {
	        new_weight = distances[u] + weight;
	        if (distances[v] > new_weight) {
	            distances[v] = new_weight;
	        }
	    }
	    function betterDist(u, v, weight) {
	        return (distances[v] > distances[u] + weight);
	    }
	    return { distances: distances, neg_cycle: neg_cycle };
	}
	exports.BellmanFordArray = BellmanFordArray;
	/**
	 *
	 * @param graph
	 * @param start
	 */
	function BellmanFordDict(graph, start) {
	    BFSanityChecks(graph, start);
	    var distances = {}, edges, edge, a, b, weight, new_weight, nodes_size, neg_cycle = false;
	    distances = {}; // Reset dists, TODO refactor
	    edges = graph.getDirEdgesArray().concat(graph.getUndEdgesArray());
	    nodes_size = graph.nrNodes();
	    for (var node in graph.getNodes()) {
	        distances[node] = Number.POSITIVE_INFINITY;
	    }
	    distances[start.getID()] = 0;
	    for (var i = 0; i < nodes_size - 1; ++i) {
	        for (var e_idx = 0; e_idx < edges.length; ++e_idx) {
	            edge = edges[e_idx];
	            a = edge.getNodes().a.getID();
	            b = edge.getNodes().b.getID();
	            weight = isFinite(edge.getWeight()) ? edge.getWeight() : PFS_1.DEFAULT_WEIGHT;
	            updateDist(a, b, weight);
	            !edge.isDirected() && updateDist(b, a, weight);
	        }
	    }
	    for (var edgeID in edges) {
	        edge = edges[edgeID];
	        a = edge.getNodes().a.getID();
	        b = edge.getNodes().b.getID();
	        weight = isFinite(edge.getWeight()) ? edge.getWeight() : PFS_1.DEFAULT_WEIGHT;
	        if (betterDist(a, b, weight) || (!edge.isDirected() && betterDist(b, a, weight))) {
	            neg_cycle = true;
	        }
	    }
	    function updateDist(u, v, weight) {
	        new_weight = distances[u] + weight;
	        if (distances[v] > new_weight) {
	            distances[v] = new_weight;
	        }
	    }
	    function betterDist(u, v, weight) {
	        return (distances[v] > distances[u] + weight);
	    }
	    return { distances: distances, neg_cycle: neg_cycle };
	}
	exports.BellmanFordDict = BellmanFordDict;


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	/// <reference path="../../typings/tsd.d.ts" />
	Object.defineProperty(exports, "__esModule", { value: true });
	var $E = __webpack_require__(10);
	var $G = __webpack_require__(7);
	var $CB = __webpack_require__(15);
	var $BH = __webpack_require__(19);
	exports.DEFAULT_WEIGHT = 1;
	/**
	 * Priority first search
	 *
	 * Like BFS, we are not necessarily visiting the
	 * whole graph, but only what's reachable from
	 * a given start node.
	 *
	 * @param graph the graph to perform PFS only
	 * @param v the node from which to start PFS
	 * @config a config object similar to that used
	 * in BFS, automatically instantiated if not given..
	 */
	function PFS(graph, v, config) {
	    var config = config || preparePFSStandardConfig(), callbacks = config.callbacks, dir_mode = config.dir_mode, evalPriority = config.evalPriority, evalObjID = config.evalObjID;
	    /**
	       * We are not traversing an empty graph...
	       */
	    if (graph.getMode() === $G.GraphMode.INIT) {
	        throw new Error('Cowardly refusing to traverse graph without edges.');
	    }
	    /**
	       * We are not traversing a graph taking NO edges into account
	       */
	    if (dir_mode === $G.GraphMode.INIT) {
	        throw new Error('Cannot traverse a graph with dir_mode set to INIT.');
	    }
	    // We need to push NeighborEntries
	    // TODO: Virtual edge addition OK?
	    var start_ne = {
	        node: v,
	        edge: new $E.BaseEdge('virtual start edge', v, v, { weighted: true, weight: 0 }),
	        best: 0
	    };
	    var scope = {
	        OPEN_HEAP: new $BH.BinaryHeap($BH.BinaryHeapMode.MIN, evalPriority, evalObjID),
	        OPEN: {},
	        CLOSED: {},
	        nodes: graph.getNodes(),
	        root_node: v,
	        current: start_ne,
	        adj_nodes: [],
	        next: null,
	        proposed_dist: Number.POSITIVE_INFINITY,
	    };
	    /**
	       * HOOK 1: PFS INIT
	       */
	    callbacks.init_pfs && $CB.execCallbacks(callbacks.init_pfs, scope);
	    //initializes the result entry, gives the start node the final values, and default values for all others
	    scope.OPEN_HEAP.insert(start_ne);
	    scope.OPEN[start_ne.node.getID()] = start_ne;
	    /**
	     * Main loop
	     */
	    while (scope.OPEN_HEAP.size()) {
	        // console.log(scope.OPEN_HEAP); //LOG!
	        // get currently best node
	        //pop returns the first element of the OPEN_HEAP, which is the node with the smallest distance
	        //it removes it from the heap, too - no extra removal needed
	        // process.stdout.write(`heap array: [`);
	        // scope.OPEN_HEAP.getArray().forEach( ne => {
	        //   process.stdout.write( ne.node.getID() + ", " );
	        // });
	        // console.log(']');
	        // console.log(`heap positions: \n`)
	        // console.log(scope.OPEN_HEAP.getPositions());
	        scope.current = scope.OPEN_HEAP.pop();
	        // console.log(`node: ${scope.current.node.getID()}`); //LOG!
	        // console.log(`best: ${scope.current.best}`); //LOG!
	        /**
	         * HOOK 2: NEW CURRENT
	         */
	        callbacks.new_current && $CB.execCallbacks(callbacks.new_current, scope);
	        if (scope.current == null) {
	            console.log("HEAP popped undefined - HEAP size: " + scope.OPEN_HEAP.size());
	        }
	        // remove from OPEN
	        scope.OPEN[scope.current.node.getID()] = undefined;
	        // add it to CLOSED
	        scope.CLOSED[scope.current.node.getID()] = scope.current;
	        // TODO what if we already reached the goal?
	        if (scope.current.node === config.goal_node) {
	            /**
	             * HOOK 3: Goal node reached
	             */
	            config.callbacks.goal_reached && $CB.execCallbacks(config.callbacks.goal_reached, scope);
	            // If a goal node is set from the outside & we reach it, we stop.
	            return config.result;
	        }
	        /**
	         * Extend the current node, also called
	         * "create n's successors"...
	             */
	        // TODO: Reverse callback logic to NOT merge anything by default!!!
	        if (dir_mode === $G.GraphMode.MIXED) {
	            scope.adj_nodes = scope.current.node.reachNodes();
	        }
	        else if (dir_mode === $G.GraphMode.UNDIRECTED) {
	            scope.adj_nodes = scope.current.node.connNodes();
	        }
	        else if (dir_mode === $G.GraphMode.DIRECTED) {
	            scope.adj_nodes = scope.current.node.nextNodes();
	        }
	        else {
	            throw new Error('Unsupported traversal mode. Please use directed, undirected, or mixed');
	        }
	        /**
	         * EXPAND AND EXAMINE NEIGHBORHOOD
	         */
	        for (var adj_idx in scope.adj_nodes) {
	            scope.next = scope.adj_nodes[adj_idx];
	            // console.log("scopeNext now:"); //LOG!
	            // console.log(scope.next.node.getID());
	            if (scope.CLOSED[scope.next.node.getID()]) {
	                /**
	                 * HOOK 4: Goal node already closed
	                 */
	                config.callbacks.node_closed && $CB.execCallbacks(config.callbacks.node_closed, scope);
	                continue;
	            }
	            if (scope.OPEN[scope.next.node.getID()]) {
	                // First let's recover the previous best solution from our OPEN structure,
	                // as the node's neighborhood-retrieving function cannot know it...
	                // console.log("MARKER - ALREADY OPEN"); //LOG!
	                scope.next.best = scope.OPEN[scope.next.node.getID()].best;
	                /**
	                 * HOOK 5: Goal node already visited, but not yet closed
	                 */
	                config.callbacks.node_open && $CB.execCallbacks(config.callbacks.node_open, scope);
	                scope.proposed_dist = scope.current.best + (isNaN(scope.next.edge.getWeight()) ? exports.DEFAULT_WEIGHT : scope.next.edge.getWeight());
	                /**
	                 * HOOK 6: Better path found
	                 */
	                if (scope.next.best > scope.proposed_dist) {
	                    config.callbacks.better_path && $CB.execCallbacks(config.callbacks.better_path, scope);
	                    // HEAP operations are necessary for internal traversal,
	                    // so we handle them here in the main loop
	                    //removing thext with the old value and adding it again with updated value
	                    scope.OPEN_HEAP.remove(scope.next);
	                    // console.log("MARKER - BETTER DISTANCE");
	                    // console.log(scope.OPEN_HEAP);
	                    scope.next.best = scope.proposed_dist;
	                    scope.OPEN_HEAP.insert(scope.next);
	                    scope.OPEN[scope.next.node.getID()].best = scope.proposed_dist;
	                }
	                /**
	                 * HOOK 7: Equal path found (same weight)
	                 */
	                //at the moment, this callback array is empty here in the PFS and in the Dijkstra, but used in the Johnsons
	                else if (scope.next.best === scope.proposed_dist) {
	                    config.callbacks.equal_path && $CB.execCallbacks(config.callbacks.equal_path, scope);
	                }
	                continue;
	            }
	            // NODE NOT ENCOUNTERED
	            config.callbacks.not_encountered && $CB.execCallbacks(config.callbacks.not_encountered, scope);
	            // HEAP operations are necessary for internal traversal,
	            // so we handle them here in the main loop
	            scope.OPEN_HEAP.insert(scope.next);
	            scope.OPEN[scope.next.node.getID()] = scope.next;
	            // console.log("MARKER-NOT ENCOUNTERED"); //LOG!
	        }
	    }
	    return config.result;
	}
	exports.PFS = PFS;
	function preparePFSStandardConfig() {
	    var config = {
	        result: {},
	        callbacks: {
	            init_pfs: [],
	            new_current: [],
	            not_encountered: [],
	            node_open: [],
	            node_closed: [],
	            better_path: [],
	            equal_path: [],
	            goal_reached: []
	        },
	        messages: {
	            init_pfs_msgs: [],
	            new_current_msgs: [],
	            not_enc_msgs: [],
	            node_open_msgs: [],
	            node_closed_msgs: [],
	            better_path_msgs: [],
	            equal_path_msgs: [],
	            goal_reached_msgs: []
	        },
	        dir_mode: $G.GraphMode.MIXED,
	        goal_node: null,
	        evalPriority: function (ne) {
	            return ne.best || exports.DEFAULT_WEIGHT;
	        },
	        evalObjID: function (ne) {
	            return ne.node.getID();
	        }
	    }, callbacks = config.callbacks;
	    var count = 0;
	    var counter = function () {
	        return count++;
	    };
	    // Standard INIT callback
	    var initPFS = function (context) {
	        // initialize all nodes to infinite distance
	        for (var key in context.nodes) {
	            config.result[key] = {
	                distance: Number.POSITIVE_INFINITY,
	                parent: null,
	                counter: -1
	            };
	        }
	        // initialize root node entry
	        // maybe take heuristic into account right here...??
	        config.result[context.root_node.getID()] = {
	            distance: 0,
	            parent: context.root_node,
	            counter: counter()
	        };
	    };
	    callbacks.init_pfs.push(initPFS);
	    // Node not yet encountered callback
	    var notEncountered = function (context) {
	        // setting it's best score to actual distance + edge weight
	        // and update result structure
	        context.next.best = context.current.best + (isNaN(context.next.edge.getWeight()) ? exports.DEFAULT_WEIGHT : context.next.edge.getWeight());
	        config.result[context.next.node.getID()] = {
	            distance: context.next.best,
	            parent: context.current.node,
	            counter: undefined
	        };
	    };
	    callbacks.not_encountered.push(notEncountered);
	    // Callback for when we find a better solution
	    var betterPathFound = function (context) {
	        config.result[context.next.node.getID()].distance = context.proposed_dist;
	        config.result[context.next.node.getID()].parent = context.current.node;
	    };
	    callbacks.better_path.push(betterPathFound);
	    return config;
	}
	exports.preparePFSStandardConfig = preparePFSStandardConfig;


/***/ }),
/* 19 */
/***/ (function(module, exports) {

	"use strict";
	/// <reference path="../../typings/tsd.d.ts" />
	Object.defineProperty(exports, "__esModule", { value: true });
	var BinaryHeapMode;
	(function (BinaryHeapMode) {
	    BinaryHeapMode[BinaryHeapMode["MIN"] = 0] = "MIN";
	    BinaryHeapMode[BinaryHeapMode["MAX"] = 1] = "MAX";
	})(BinaryHeapMode = exports.BinaryHeapMode || (exports.BinaryHeapMode = {}));
	/**
	 * We only support unique object ID's for now !!!
	 * @TODO Rename into "ObjectBinaryHeap" or such...
	 */
	var BinaryHeap = /** @class */ (function () {
	    /**
	     * Mode of a min heap should only be set upon
	     * instantiation and never again afterwards...
	     * @param _mode MIN or MAX heap
	     * @param _evalObjID function to determine an object's identity
	     * @param _evalPriority function to determine an objects score
	     */
	    function BinaryHeap(_mode, _evalPriority, _evalObjID) {
	        if (_mode === void 0) { _mode = BinaryHeapMode.MIN; }
	        if (_evalPriority === void 0) { _evalPriority = function (obj) {
	            if (typeof obj !== 'number' && typeof obj !== 'string') {
	                return NaN;
	            }
	            if (typeof obj === 'number') {
	                return obj | 0;
	            }
	            return parseInt(obj);
	        }; }
	        if (_evalObjID === void 0) { _evalObjID = function (obj) {
	            return obj;
	        }; }
	        this._mode = _mode;
	        this._evalPriority = _evalPriority;
	        this._evalObjID = _evalObjID;
	        this._nr_removes = 0; // just for debugging
	        this._array = [];
	        this._positions = {};
	    }
	    BinaryHeap.prototype.getMode = function () {
	        return this._mode;
	    };
	    BinaryHeap.prototype.getArray = function () {
	        return this._array;
	    };
	    BinaryHeap.prototype.getPositions = function () {
	        return this._positions;
	    };
	    BinaryHeap.prototype.size = function () {
	        return this._array.length;
	    };
	    BinaryHeap.prototype.getEvalPriorityFun = function () {
	        return this._evalPriority;
	    };
	    BinaryHeap.prototype.evalInputScore = function (obj) {
	        return this._evalPriority(obj);
	    };
	    BinaryHeap.prototype.getEvalObjIDFun = function () {
	        return this._evalObjID;
	    };
	    BinaryHeap.prototype.evalInputObjID = function (obj) {
	        return this._evalObjID(obj);
	    };
	    BinaryHeap.prototype.peek = function () {
	        return this._array[0];
	    };
	    BinaryHeap.prototype.pop = function () {
	        if (this.size()) {
	            return this.remove(this._array[0]);
	        }
	    };
	    BinaryHeap.prototype.find = function (obj) {
	        var pos = this.getNodePosition(obj);
	        return this._array[pos];
	    };
	    /**
	     * Insert - Adding an object to the heap
	     * @param obj the obj to add to the heap
	     * @returns {number} the objects index in the internal array
	     */
	    BinaryHeap.prototype.insert = function (obj) {
	        if (isNaN(this._evalPriority(obj))) {
	            throw new Error("Cannot insert object without numeric priority.");
	        }
	        /**
	         * @todo if we keep the unique ID stuff, check for it here and throw an Error if needed...
	         */
	        this._array.push(obj);
	        this.setNodePosition(obj, this.size() - 1);
	        this.trickleUp(this.size() - 1);
	    };
	    BinaryHeap.prototype.remove = function (obj) {
	        this._nr_removes++;
	        if (isNaN(this._evalPriority(obj))) {
	            throw new Error('Object invalid.');
	        }
	        var objID = this._evalObjID(obj), found = null;
	        /**
	         * Search in O(1)
	         */
	        var pos = this.getNodePosition(obj), found = this._array[pos] != null ? this._array[pos] : null;
	        /**
	         * Search in O(n)
	         */
	        // for (var pos = 0; pos < this._array.length; ++pos) {
	        //   if (this._evalObjID(this._array[pos]) === objID) {
	        //     found = this._array[pos];
	        //     break;
	        //   }
	        // }
	        if (found === null) {
	            return undefined;
	        }
	        var last_array_obj = this._array.pop();
	        this.removeNodePosition(obj);
	        if (this.size() && found !== last_array_obj) {
	            this._array[pos] = last_array_obj;
	            this.setNodePosition(last_array_obj, pos);
	            this.trickleUp(pos);
	            this.trickleDown(pos);
	        }
	        return found;
	    };
	    BinaryHeap.prototype.trickleDown = function (i) {
	        var parent = this._array[i];
	        while (true) {
	            var right_child_idx = (i + 1) * 2, left_child_idx = right_child_idx - 1, right_child = this._array[right_child_idx], left_child = this._array[left_child_idx], swap = null;
	            // check if left child exists && is larger than parent
	            if (left_child_idx < this.size() && !this.orderCorrect(parent, left_child)) {
	                swap = left_child_idx;
	            }
	            // check if right child exists && is larger than parent
	            if (right_child_idx < this.size() && !this.orderCorrect(parent, right_child)
	                && !this.orderCorrect(left_child, right_child)) {
	                swap = right_child_idx;
	            }
	            if (swap === null) {
	                break;
	            }
	            // we only have to swap one child, doesn't matter which one
	            this._array[i] = this._array[swap];
	            this._array[swap] = parent;
	            // console.log(`Trickle down: swapping ${this._array[i]} and ${this._array[swap]}`);
	            this.setNodePosition(this._array[i], i);
	            this.setNodePosition(this._array[swap], swap);
	            i = swap;
	        }
	    };
	    BinaryHeap.prototype.trickleUp = function (i) {
	        var child = this._array[i];
	        // Can only trickle up from positive levels
	        while (i) {
	            var parent_idx = Math.floor((i + 1) / 2) - 1, parent = this._array[parent_idx];
	            if (this.orderCorrect(parent, child)) {
	                break;
	            }
	            else {
	                this._array[parent_idx] = child;
	                this._array[i] = parent;
	                // console.log(`Trickle up: swapping ${child} and ${parent}`);
	                this.setNodePosition(child, parent_idx);
	                this.setNodePosition(parent, i);
	                i = parent_idx;
	            }
	        }
	    };
	    BinaryHeap.prototype.orderCorrect = function (obj_a, obj_b) {
	        var obj_a_pr = this._evalPriority(obj_a);
	        var obj_b_pr = this._evalPriority(obj_b);
	        if (this._mode === BinaryHeapMode.MIN) {
	            return obj_a_pr <= obj_b_pr;
	        }
	        else {
	            return obj_a_pr >= obj_b_pr;
	        }
	    };
	    /**
	     * Superstructure to enable search in BinHeap in O(1)
	     * @param obj
	     * @param pos
	     */
	    BinaryHeap.prototype.setNodePosition = function (obj, pos) {
	        if (obj == null || pos == null || pos !== (pos | 0)) {
	            throw new Error('minium required arguments are obj and new_pos');
	        }
	        var pos_obj = {
	            score: this.evalInputScore(obj),
	            position: pos
	        };
	        var obj_key = this.evalInputObjID(obj);
	        this._positions[obj_key] = pos_obj;
	    };
	    /**
	     *
	     */
	    BinaryHeap.prototype.getNodePosition = function (obj) {
	        var obj_key = this.evalInputObjID(obj);
	        // console.log(obj_key);
	        var occurrence = this._positions[obj_key];
	        // console.log(occurrence);
	        return occurrence ? occurrence.position : null;
	    };
	    /**
	     * @param obj
	     * @returns {number}
	     */
	    BinaryHeap.prototype.removeNodePosition = function (obj) {
	        var obj_key = this.evalInputObjID(obj);
	        delete this._positions[obj_key];
	    };
	    return BinaryHeap;
	}());
	exports.BinaryHeap = BinaryHeap;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	/// <reference path="../../typings/tsd.d.ts" />
	Object.defineProperty(exports, "__esModule", { value: true });
	var randgen = __webpack_require__(21);
	var logger_1 = __webpack_require__(11);
	var logger = new logger_1.Logger();
	var SimplePerturber = /** @class */ (function () {
	    function SimplePerturber(_graph) {
	        this._graph = _graph;
	    }
	    /**
	     *
	     * @param percentage
	     */
	    SimplePerturber.prototype.randomlyDeleteNodesPercentage = function (percentage) {
	        if (percentage > 100) {
	            percentage = 100;
	        }
	        var nr_nodes_to_delete = Math.ceil(this._graph.nrNodes() * percentage / 100);
	        this.randomlyDeleteNodesAmount(nr_nodes_to_delete);
	    };
	    /**
	     *
	     * @param percentage
	     */
	    SimplePerturber.prototype.randomlyDeleteUndEdgesPercentage = function (percentage) {
	        if (percentage > 100) {
	            percentage = 100;
	        }
	        var nr_edges_to_delete = Math.ceil(this._graph.nrUndEdges() * percentage / 100);
	        this.randomlyDeleteUndEdgesAmount(nr_edges_to_delete);
	    };
	    /**
	     *
	     * @param percentage
	     */
	    SimplePerturber.prototype.randomlyDeleteDirEdgesPercentage = function (percentage) {
	        if (percentage > 100) {
	            percentage = 100;
	        }
	        var nr_edges_to_delete = Math.ceil(this._graph.nrDirEdges() * percentage / 100);
	        this.randomlyDeleteDirEdgesAmount(nr_edges_to_delete);
	    };
	    /**
	     *
	     */
	    SimplePerturber.prototype.randomlyDeleteNodesAmount = function (amount) {
	        if (amount < 0) {
	            throw 'Cowardly refusing to remove a negative amount of nodes';
	        }
	        if (this._graph.nrNodes() === 0) {
	            return;
	        }
	        for (var nodeID = 0, randomNodes = this._graph.pickRandomProperties(this._graph.getNodes(), amount); nodeID < randomNodes.length; nodeID++) {
	            this._graph.deleteNode(this._graph.getNodes()[randomNodes[nodeID]]);
	        }
	    };
	    /**
	     *
	     */
	    SimplePerturber.prototype.randomlyDeleteUndEdgesAmount = function (amount) {
	        if (amount < 0) {
	            throw 'Cowardly refusing to remove a negative amount of edges';
	        }
	        if (this._graph.nrUndEdges() === 0) {
	            return;
	        }
	        for (var edgeID = 0, randomEdges = this._graph.pickRandomProperties(this._graph.getUndEdges(), amount); edgeID < randomEdges.length; edgeID++) {
	            this._graph.deleteEdge(this._graph.getUndEdges()[randomEdges[edgeID]]);
	        }
	    };
	    /**
	     *
	     */
	    SimplePerturber.prototype.randomlyDeleteDirEdgesAmount = function (amount) {
	        if (amount < 0) {
	            throw 'Cowardly refusing to remove a negative amount of edges';
	        }
	        if (this._graph.nrDirEdges() === 0) {
	            return;
	        }
	        for (var edgeID = 0, randomEdges = this._graph.pickRandomProperties(this._graph.getDirEdges(), amount); edgeID < randomEdges.length; edgeID++) {
	            this._graph.deleteEdge(this._graph.getDirEdges()[randomEdges[edgeID]]);
	        }
	    };
	    /**
	     *
	     */
	    SimplePerturber.prototype.randomlyAddUndEdgesPercentage = function (percentage) {
	        var nr_und_edges_to_add = Math.ceil(this._graph.nrUndEdges() * percentage / 100);
	        this.randomlyAddEdgesAmount(nr_und_edges_to_add, { directed: false });
	    };
	    /**
	     *
	     */
	    SimplePerturber.prototype.randomlyAddDirEdgesPercentage = function (percentage) {
	        var nr_dir_edges_to_add = Math.ceil(this._graph.nrDirEdges() * percentage / 100);
	        this.randomlyAddEdgesAmount(nr_dir_edges_to_add, { directed: true });
	    };
	    /**
	     *
	     * DEFAULT edge direction: UNDIRECTED
	     */
	    SimplePerturber.prototype.randomlyAddEdgesAmount = function (amount, config) {
	        if (amount <= 0) {
	            throw new Error('Cowardly refusing to add a non-positive amount of edges');
	        }
	        var node_a, node_b, nodes;
	        var direction = (config && config.directed) ? config.directed : false, dir = direction ? "_d" : "_u";
	        // logger.log("DIRECTION of new edges to create: " + direction ? "directed" : "undirected");
	        while (amount) {
	            node_a = this._graph.getRandomNode();
	            while ((node_b = this._graph.getRandomNode()) === node_a) { }
	            var edge_id = node_a.getID() + "_" + node_b.getID() + dir;
	            if (node_a.hasEdgeID(edge_id)) {
	                // TODO: Check if the whole duplication prevention is really necessary!
	                // logger.log("Duplicate edge creation, continuing...");
	                continue;
	            }
	            else {
	                /**
	                 * Enable random weights for edges ??
	                 */
	                this._graph.addEdgeByID(edge_id, node_a, node_b, { directed: direction });
	                --amount;
	            }
	        }
	        // logger.log(`Created ${amount} ${direction ? "directed" : "undirected"} edges...`);
	    };
	    /**
	     *
	     */
	    SimplePerturber.prototype.randomlyAddNodesPercentage = function (percentage, config) {
	        var nr_nodes_to_add = Math.ceil(this._graph.nrNodes() * percentage / 100);
	        this.randomlyAddNodesAmount(nr_nodes_to_add, config);
	    };
	    /**
	     *
	     * If the degree configuration is invalid
	     * (negative or infinite degree amount / percentage)
	     * the nodes will have been created nevertheless
	     */
	    SimplePerturber.prototype.randomlyAddNodesAmount = function (amount, config) {
	        if (amount < 0) {
	            throw 'Cowardly refusing to add a negative amount of nodes';
	        }
	        var new_nodes = {};
	        while (amount--) {
	            var new_node_id = randgen.randBase36String();
	            new_nodes[new_node_id] = this._graph.addNodeByID(new_node_id);
	        }
	        if (config == null) {
	            return;
	        }
	        else {
	            this.createEdgesByConfig(config, new_nodes);
	        }
	    };
	    /**
	     * Go through the degree_configuration provided and create edges
	     * as requested by config
	     */
	    SimplePerturber.prototype.createEdgesByConfig = function (config, new_nodes) {
	        var degree, min_degree, max_degree, deg_probability;
	        if (config.und_degree != null ||
	            config.dir_degree != null ||
	            config.min_und_degree != null && config.max_und_degree != null ||
	            config.min_dir_degree != null && config.max_dir_degree != null) {
	            // Ignore min / max undirected degree if specific amount is given
	            if ((degree = config.und_degree) != null) {
	                this.createRandomEdgesSpan(degree, degree, false, new_nodes);
	            }
	            else if ((min_degree = config.min_und_degree) != null
	                && (max_degree = config.max_und_degree) != null) {
	                this.createRandomEdgesSpan(min_degree, max_degree, false, new_nodes);
	            }
	            // Ignore min / max directed degree if specific amount is given
	            if (degree = config.dir_degree) {
	                this.createRandomEdgesSpan(degree, degree, true, new_nodes);
	            }
	            else if ((min_degree = config.min_dir_degree) != null
	                && (max_degree = config.max_dir_degree) != null) {
	                this.createRandomEdgesSpan(min_degree, max_degree, true, new_nodes);
	            }
	        }
	        else {
	            if (config.probability_dir != null) {
	                this.createRandomEdgesProb(config.probability_dir, true, new_nodes);
	            }
	            if (config.probability_und != null) {
	                this.createRandomEdgesProb(config.probability_und, false, new_nodes);
	            }
	        }
	    };
	    /**
	     * Simple edge generator:
	     * Go through all node combinations, and
	     * add an (un)directed edge with
	     * @param probability and
	     * @direction true or false
	     * CAUTION: this algorithm takes quadratic runtime in #nodes
	     */
	    SimplePerturber.prototype.createRandomEdgesProb = function (probability, directed, new_nodes) {
	        if (0 > probability || 1 < probability) {
	            throw new Error("Probability out of range.");
	        }
	        directed = directed || false;
	        new_nodes = new_nodes || this._graph.getNodes();
	        var all_nodes = this._graph.getNodes(), node_a, node_b, edge_id, dir = directed ? '_d' : '_u';
	        for (node_a in new_nodes) {
	            for (node_b in all_nodes) {
	                if (node_a !== node_b && Math.random() <= probability) {
	                    edge_id = all_nodes[node_a].getID() + "_" + all_nodes[node_b].getID() + dir;
	                    // Check if edge already exists
	                    if (this._graph.getNodes()[node_a].hasEdgeID(edge_id)) {
	                        continue;
	                    }
	                    this._graph.addEdgeByID(edge_id, all_nodes[node_a], all_nodes[node_b], { directed: directed });
	                }
	            }
	        }
	    };
	    /**
	     * Simple edge generator:
	     * Go through all nodes, and
	     * add [min, max] (un)directed edges to
	     * a randomly chosen node
	     * CAUTION: this algorithm could take quadratic runtime in #nodes
	     * but should be much faster
	     */
	    SimplePerturber.prototype.createRandomEdgesSpan = function (min, max, directed, setOfNodes) {
	        if (min < 0) {
	            throw new Error('Minimum degree cannot be negative.');
	        }
	        if (max >= this._graph.nrNodes()) {
	            throw new Error('Maximum degree exceeds number of reachable nodes.');
	        }
	        if (min > max) {
	            throw new Error('Minimum degree cannot exceed maximum degree.');
	        }
	        directed = directed || false;
	        // Do we need to set them integers before the calculations?
	        var min = min | 0, max = max | 0, new_nodes = setOfNodes || this._graph.getNodes(), all_nodes = this._graph.getNodes(), idx_a, node_a, node_b, edge_id, 
	        // we want edges to all possible nodes
	        // TODO: enhance with types / filters later on
	        node_keys = Object.keys(all_nodes), keys_len = node_keys.length, rand_idx, rand_deg, dir = directed ? '_d' : '_u';
	        for (idx_a in new_nodes) {
	            node_a = new_nodes[idx_a];
	            rand_idx = 0;
	            rand_deg = (Math.random() * (max - min) + min) | 0;
	            while (rand_deg) {
	                rand_idx = (keys_len * Math.random()) | 0; // should never reach keys_len...
	                node_b = all_nodes[node_keys[rand_idx]];
	                if (node_a !== node_b) {
	                    edge_id = node_a.getID() + "_" + node_b.getID() + dir;
	                    // Check if edge already exists
	                    if (node_a.hasEdgeID(edge_id)) {
	                        continue;
	                    }
	                    this._graph.addEdgeByID(edge_id, node_a, node_b, { directed: directed });
	                    --rand_deg;
	                }
	            }
	        }
	    };
	    return SimplePerturber;
	}());
	exports.SimplePerturber = SimplePerturber;


/***/ }),
/* 21 */
/***/ (function(module, exports) {

	"use strict";
	/**
	 * Taken from https://github.com/robbrit/randgen
	 * and slightly modified to give TS completion
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	/**
	 * Generate a random Base36  UID of length 24
	 */
	function randBase36String() {
	    return (Math.random() + 1).toString(36).substr(2, 24);
	}
	exports.randBase36String = randBase36String;
	/*jslint indent: 2, plusplus: true, sloppy: true */
	// Generate uniformly distributed random numbers
	// Gives a random number on the interval [min, max).
	// If discrete is true, the number will be an integer.
	function runif(min, max, discrete) {
	    if (min === undefined) {
	        min = 0;
	    }
	    if (max === undefined) {
	        max = 1;
	    }
	    if (discrete === undefined) {
	        discrete = false;
	    }
	    if (discrete) {
	        return Math.floor(runif(min, max, false));
	    }
	    return Math.random() * (max - min) + min;
	}
	exports.runif = runif;
	// Generate normally-distributed random nubmers
	// Algorithm adapted from:
	// http://c-faq.com/lib/gaussian.html
	function rnorm(mean, stdev) {
	    this.v2 = null;
	    var u1, u2, v1, v2, s;
	    if (mean === undefined) {
	        mean = 0.0;
	    }
	    if (stdev === undefined) {
	        stdev = 1.0;
	    }
	    if (this.v2 === null) {
	        do {
	            u1 = Math.random();
	            u2 = Math.random();
	            v1 = 2 * u1 - 1;
	            v2 = 2 * u2 - 1;
	            s = v1 * v1 + v2 * v2;
	        } while (s === 0 || s >= 1);
	        this.v2 = v2 * Math.sqrt(-2 * Math.log(s) / s);
	        return stdev * v1 * Math.sqrt(-2 * Math.log(s) / s) + mean;
	    }
	    v2 = this.v2;
	    this.v2 = null;
	    return stdev * v2 + mean;
	}
	exports.rnorm = rnorm;
	// rnorm.v2 = null;
	// Generate Chi-square distributed random numbers
	function rchisq(degreesOfFreedom) {
	    if (degreesOfFreedom === undefined) {
	        degreesOfFreedom = 1;
	    }
	    var i, z, sum = 0.0;
	    for (i = 0; i < degreesOfFreedom; i++) {
	        z = rnorm();
	        sum += z * z;
	    }
	    return sum;
	}
	exports.rchisq = rchisq;
	// Generate Poisson distributed random numbers
	function rpoisson(lambda) {
	    if (lambda === undefined) {
	        lambda = 1;
	    }
	    var l = Math.exp(-lambda), k = 0, p = 1.0;
	    do {
	        k++;
	        p *= Math.random();
	    } while (p > l);
	    return k - 1;
	}
	exports.rpoisson = rpoisson;
	// Generate Cauchy distributed random numbers
	function rcauchy(loc, scale) {
	    if (loc === undefined) {
	        loc = 0.0;
	    }
	    if (scale === undefined) {
	        scale = 1.0;
	    }
	    var n2, n1 = rnorm();
	    do {
	        n2 = rnorm();
	    } while (n2 === 0.0);
	    return loc + scale * n1 / n2;
	}
	exports.rcauchy = rcauchy;
	// Bernoulli distribution: gives 1 with probability p
	function rbernoulli(p) {
	    return Math.random() < p ? 1 : 0;
	}
	exports.rbernoulli = rbernoulli;
	// Vectorize a random generator
	function vectorize(generator) {
	    return function () {
	        var n, result, i, args;
	        args = [].slice.call(arguments);
	        n = args.shift();
	        result = [];
	        for (i = 0; i < n; i++) {
	            result.push(generator.apply(this, args));
	        }
	        return result;
	    };
	}
	// Generate a histogram from a list of numbers
	function histogram(data, binCount) {
	    binCount = binCount || 10;
	    var bins, i, scaled, max = Math.max.apply(this, data), min = Math.min.apply(this, data);
	    // edge case: max == min
	    if (max === min) {
	        return [data.length];
	    }
	    bins = [];
	    // zero each bin
	    for (i = 0; i < binCount; i++) {
	        bins.push(0);
	    }
	    for (i = 0; i < data.length; i++) {
	        // scale it to be between 0 and 1
	        scaled = (data[i] - min) / (max - min);
	        // scale it up to the histogram size
	        scaled *= binCount;
	        // drop it in a bin
	        scaled = Math.floor(scaled);
	        // edge case: the max
	        if (scaled === binCount) {
	            scaled--;
	        }
	        bins[scaled]++;
	    }
	    return bins;
	}
	exports.histogram = histogram;
	/**
	 * Get a random element from a list
	 */
	function rlist(list) {
	    return list[runif(0, list.length, true)];
	}
	exports.rlist = rlist;
	var rvunif = vectorize(runif);
	exports.rvunif = rvunif;
	var rvnorm = vectorize(rnorm);
	exports.rvnorm = rvnorm;
	var rvchisq = vectorize(rchisq);
	exports.rvchisq = rvchisq;
	var rvpoisson = vectorize(rpoisson);
	exports.rvpoisson = rvpoisson;
	var rvcauchy = vectorize(rcauchy);
	exports.rvcauchy = rvcauchy;
	var rvbernoulli = vectorize(rbernoulli);
	exports.rvbernoulli = rvbernoulli;
	var rvlist = vectorize(rlist);
	exports.rvlist = rvlist;


/***/ }),
/* 22 */
/***/ (function(module, exports) {

	"use strict";
	var CONFIG = {
	    'REMOTE_URL': 'http://berndmalle.com/anonymization/adults',
	    'REMOTE_TARGET': 'education',
	    'INPUT_FILE': './test/io/test_input/house_data.csv',
	    'TRIM': '',
	    'TRIM_MOD': '',
	    'SEPARATOR': '\\s+',
	    'SEP_MOD': 'g',
	    'TARGET_COLUMN': 'MEDV',
	    'AVERAGE_OUTPUT_RANGES': true,
	    'NR_DRAWS': 506,
	    'RANDOM_DRAWS': false,
	    'EDGE_MIN': 3,
	    'EDGE_MAX': 10,
	    'K_FACTOR': 19,
	    'ALPHA': 1,
	    'BETA': 0,
	    'GEN_WEIGHT_VECTORS': {
	        'equal': {
	            'range': {
	                'CRIM': 1.0 / 13.0,
	                'ZN': 1.0 / 13.0,
	                'INDUS': 1.0 / 13.0,
	                'CHAS': 1.0 / 13.0,
	                'NOX': 1.0 / 13.0,
	                'RM': 1.0 / 13.0,
	                'AGE': 1.0 / 13.0,
	                'DIS': 1.0 / 13.0,
	                'RAD': 1.0 / 13.0,
	                'TAX': 1.0 / 13.0,
	                'PTRATIO': 1.0 / 13.0,
	                'B': 1.0 / 13.0,
	                'LSTAT': 1.0 / 13.0
	            }
	        }
	    },
	    'VECTOR': 'equal'
	};
	exports.CONFIG = CONFIG;


/***/ })
/******/ ]);