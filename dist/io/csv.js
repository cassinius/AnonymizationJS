"use strict";
var CSV = (function () {
    function CSV(_sep) {
        if (_sep === void 0) { _sep = ","; }
        this._sep = _sep;
    }
    CSV.prototype.readCSV = function () {
    };
    return CSV;
}());
exports.CSV = CSV;
