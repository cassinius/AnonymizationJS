var CONFIG = {
  // The path to the input dataset
  'INPUT_FILE' : './test/io/test_input/adult_data.csv',
  // CSV TRIM RegExp, if necessary
  'TRIM': '\\s+',
  'TRIM_MOD': 'g',
  // CSV Separator char
  'SEPARATOR' : ',',
  'SEP_MOD': '',
  // columns to preserve for later processing of anonymized dataset
  'TARGET_COLUMN' : 'marital-status',
  // Shall we write out a range or an average value?
  'AVERAGE_OUTPUT_RANGES' : true,
  // How many data points to fetch
  'NR_DRAWS' : 30162,
  // Do we wnat to sample the dataset randomly?
  'RANDOM_DRAWS': false,
  // Min # of edges per node for graph generation
  'EDGE_MIN' : 3,
  // Max # of edges per node for graph generation
  'EDGE_MAX' : 10,
  // The k anonymization factor
  'K_FACTOR' : 35,
  // Weight of the Generalization Information Loss
  'ALPHA' : 1,
  // Weight of the Structural Information Loss
  'BETA' : 0,
  // Weight vector for generalization hierarchies
  'GEN_WEIGHT_VECTORS' : {
    'equal': {
        'categorical': {
            'workclass': 1.0/13.0,
            'native-country': 1.0/13.0,
            'sex': 1.0/13.0,
            'race': 1.0/13.0,
            // 'marital-status': 1.0/13.0,
            'relationship': 1.0/13.0,
            'occupation': 1.0/13.0,
            'income': 1.0/13.0
        },
        'range': {
            'age': 1.0/13.0,
            'fnlwgt': 1.0/13.0,
            'education-num': 1.0/13.0,
            'capital-gain': 1.0/13.0,
            'capital-loss': 1.0/13.0,
            'hours-per-week': 1.0/13.0
        }
    },
    'emph_race': {
        'categorical': {
            'workclass': 0.01,
            'native-country': 0.01,
            'sex': 0.01,
            'race': 0.88,
            // 'marital-status': 0.01,
            'relationship': 0.01,
            'occupation': 0.01,
            'income': 0.01
        },
        'range': {
            'age': 0.01,
            'fnlwgt': 0.01,
            'education-num': 0.01,
            'capital-gain': 0.01,
            'capital-loss': 0.01,
            'hours-per-week': 0.01
        }
    },
    'emph_age': {
        'categorical': {
            'workclass': 0.01,
            'native-country': 0.01,
            'sex': 0.01,
            'race': 0.01,
            // 'marital-status': 0.01,
            'relationship': 0.01,
            'occupation': 0.01,
            'income': 0.01
        },
        'range': {
            'age': 0.88,
            'fnlwgt': 0.01,
            'education-num': 0.01,
            'capital-gain': 0.01,
            'capital-loss': 0.01,
            'hours-per-week': 0.01,
        }
    }
  },
  // Chosen weight vector
  'VECTOR' : 'equal'
}

export { CONFIG };
