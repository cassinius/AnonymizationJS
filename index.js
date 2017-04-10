var $GH					= require("./dist/core/GenHierarchies.js");
var $CSVIN 			= require("./dist/io/CSVInput.js");
var $CSVOUT			= require("./dist/io/CSVOutput.js");
var $Sangreea 	= require("./dist/SaNGreeA/SaNGreeA.js");
var $C_ADULT		= require("./dist/config/SaNGreeAConfig_adult.js");


var out = typeof window !== 'undefined' ? window : global;


out.$A = {
	config: {
		adults: $C_ADULT.CONFIG
	},
	genHierarchy:	{
		Category		: $GH.StringGenHierarchy,
		Range	: $GH.ContGenHierarchy
	},
	IO: {
		CSVIN			 		: $CSVIN.CSVInput,
		CSVOUT		 		: $CSVOUT.CSVOutput,
	},
	algorithms: {
		Sangreea		: $Sangreea.SaNGreeA
	}
};


/**
 * For NodeJS / CommonJS global object
 */
module.exports = out.$A;
