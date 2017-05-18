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
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var $GH					= __webpack_require__(1);
	var $CSVIN 			= __webpack_require__(3);
	var $CSVOUT			= __webpack_require__(4);
	var $Sangreea 	= __webpack_require__(5);
	var $C_ADULT		= __webpack_require__(6);
	var $C_HOUSES		= __webpack_require__(8);


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

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

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


/***/ },
/* 2 */
/***/ function(module, exports) {

	

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

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


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

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


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var $GH = __webpack_require__(1);
	var $C = __webpack_require__(6);
	var $G = __webpack_require__(7);
	var $CSVOUT = __webpack_require__(4);
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


/***/ },
/* 6 */
/***/ function(module, exports) {

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
	    'NR_DRAWS': 500,
	    'RANDOM_DRAWS': false,
	    'EDGE_MIN': 2,
	    'EDGE_MAX': 10,
	    'K_FACTOR': 7,
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


/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = $G;

/***/ },
/* 8 */
/***/ function(module, exports) {

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


/***/ }
/******/ ]);