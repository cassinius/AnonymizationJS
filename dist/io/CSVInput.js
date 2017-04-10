"use strict";
var fs = require('fs');
var http = require('http');
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
