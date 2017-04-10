/// <reference path="../../typings/tsd.d.ts" />

import fs 	= require('fs');
import * as $GH from '../core/GenHierarchies';
import * as $San from '../SaNGreeA/SaNGreeA';
import * as $G from 'graphinius';


export interface ICSVInput {
  _SEP: RegExp;
  _TRIM: RegExp;
  readCSVFromFile(file: string) : Array<string>;
  readCSVFromURL(url: string) : string;
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
  readCSVFromURL(url: string) {
    return "test";
  }
  
}

export { CSVInput };