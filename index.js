var $GH					= require("./dist/core/GenHierarchies.js");
var $CSV	 			= require("./dist/io/csv.js");
var $Sangreea 	= require("./dist/SaNGreeA/SaNGreeA.js");


var out = typeof window !== 'undefined' ? window : global;


out.Anonymity = {
	GenHierarchy:	{
		String		: $GH.StringGenHierarchy,
		Category	: $GH.ContGenHierarchy
	},
	Input: {
		Csv			 		: $CSV.CSV
	},
	Algorithms: {
		Sangreea		: $Sangreea.SaNGreeA
	}
};

module.exports = {
	$G : out.$G
};
