/// <reference path="../../typings/tsd.d.ts" />

import fs 	= require('fs');
import http = require('http');
import * as $GH from '../core/GenHierarchies';
import * as $San from '../SaNGreeA/SaNGreeA';


export interface ICSVInput {
  _SEP: RegExp;
  _TRIM: RegExp;
  readCSVFromFile(file: string) : Array<string>;
  readCSVFromURL(url: string, cb: Function) : void;
}


class CSVInput implements ICSVInput {

  public _SEP: RegExp;
  public _TRIM: RegExp;
  
  /**
   * 
   */
  constructor(config: $San.ISaNGreeAConfig) {
    this._SEP = new RegExp(config.SEPARATOR, config.SEP_MOD);
		this._TRIM = new RegExp(config.TRIM, config.TRIM_MOD);
  }
  
  
	/**
	 * @ TODO Outsource to it's own class
	 */
	readCSVFromFile(file: string) {
    return fs.readFileSync(file).toString().split('\n');
	}


  /**
   * 
   */
  readCSVFromURL(fileurl: string, cb: Function) {
    var self = this,
				request;
		// Node or browser ??
		if ( typeof window !== 'undefined' ) {
			// Browser...
			request = new XMLHttpRequest();			
			request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
          cb(request.responseText.split('\n'));
        }
			};
			request.open("GET", fileurl, true);
			request.setRequestHeader('Content-Type', 'text/csv; charset=UTF-8');
			request.send();
		}
		else {
			// Node.js
			this.retrieveRemoteFile(fileurl, cb);
		}
  }


  /**
   * @param url
   * @param cb
   * @returns {ClientRequest}
   */
  private retrieveRemoteFile(url: string, cb: Function) {
    if ( typeof cb !== 'function' ) {
      throw new Error('Provided callback is not a function.');
    }
    
    return http.get(url, function(response) {
      // Continuously update stream with data
      var body = '';
      response.on('data', function(d) {
        body += d;
      });
      response.on('end', function() {
        // Received data in body...
        cb(body.toString().split('\n'));
      });
    });
  }
  
}

export { CSVInput };