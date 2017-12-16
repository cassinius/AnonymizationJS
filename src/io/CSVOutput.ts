/// <reference path="../../typings/tsd.d.ts" />

import fs 	= require('fs');
import * as $GH from '../core/GenHierarchies';
import * as $San from '../SaNGreeA/SaNGreeA';


export interface ICSVOutput {
  _SEP: RegExp;
  _TRIM: RegExp;
  outputCSVToFile(file: string, csv: string) : void;
}


class CSVOutput implements ICSVOutput {
  
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
	outputCSVToFile(file: string, csv: string) : void {
    fs.writeFileSync("./test/io/test_output/" + file + ".csv", csv);
	}

  
}

export { CSVOutput };