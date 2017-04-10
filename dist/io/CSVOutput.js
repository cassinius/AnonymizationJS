"use strict";
var fs = require('fs');
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
