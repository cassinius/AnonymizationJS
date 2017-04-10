"use strict";
var fs = require('fs');
var CSVInput = (function () {
    function CSVInput(config) {
        this._SEP = new RegExp(config.SEPARATOR, config.SEP_MOD);
        this._TRIM = new RegExp(config.TRIM, config.TRIM_MOD);
    }
    CSVInput.prototype.readCSVFromFile = function (file) {
        return fs.readFileSync(file).toString().split('\n');
    };
    CSVInput.prototype.readCSVFromURL = function (url) {
        return "test";
    };
    return CSVInput;
}());
exports.CSVInput = CSVInput;
