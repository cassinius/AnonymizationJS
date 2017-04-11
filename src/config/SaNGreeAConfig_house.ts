var CONFIG = {
  // remote URL education target
  'REMOTE_URL': 'http://berndmalle.com/anonymization/adults',
  // remote target
  'REMOTE_TARGET': 'education', //'marital', //'income'
  // The path to the input dataset
  'INPUT_FILE' : './test/io/test_input/house_data.csv',
  // CSV TRIM RegExp, if necessary
  'TRIM': '',
  'TRIM_MOD': '',
  // CSV Separator char
  'SEPARATOR' : '\\s+',
  'SEP_MOD': 'g',
  // columns to preserve for later processing of anonymized dataset
  'TARGET_COLUMN' : 'MEDV',
  // Shall we write out a range or an average value?
  'AVERAGE_OUTPUT_RANGES' : true,
  // How many data points to fetch
  'NR_DRAWS' : 506,
  // Do we wnat to sample the dataset randomly?
  'RANDOM_DRAWS': false,
  // Min # of edges per node for graph generation
  'EDGE_MIN' : 3,
  // Max # of edges per node for graph generation
  'EDGE_MAX' : 10,
  // The k anonymization factor
  'K_FACTOR' : 19,
  // Weight of the Generalization Information Loss
  'ALPHA' : 1,
  // Weight of the Structural Information Loss
  'BETA' : 0,
  // Weight vector for generalization hierarchies
  'GEN_WEIGHT_VECTORS' : {
    'equal': {
      'range': {
          'CRIM': 1.0/13.0,
          'ZN': 1.0/13.0,
          'INDUS': 1.0/13.0,
          'CHAS': 1.0/13.0,
          'NOX': 1.0/13.0,
          'RM': 1.0/13.0,
          'AGE': 1.0/13.0,
          'DIS': 1.0/13.0,
          'RAD': 1.0/13.0,
          'TAX': 1.0/13.0,
          'PTRATIO': 1.0/13.0,
          'B': 1.0/13.0,
          'LSTAT': 1.0/13.0
      }
    }//,
    // 'emph_race': {
    //     'range': {
    //         'age': 0.01,
    //         'fnlwgt': 0.01,
    //         'education-num': 0.01,
    //         'capital-gain': 0.01,
    //         'capital-loss': 0.01,
    //         'hours-per-week': 0.01
    //     }
    // },
    // 'emph_age': {
    //     'range': {
    //         'age': 0.88,
    //         'fnlwgt': 0.01,
    //         'education-num': 0.01,
    //         'capital-gain': 0.01,
    //         'capital-loss': 0.01,
    //         'hours-per-week': 0.01,
    //     }
    // }
  },
  // Chosen weight vector
  'VECTOR' : 'equal'
}

export { CONFIG };
