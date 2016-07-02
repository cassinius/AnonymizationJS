var CONFIG = {
  // Which file to read
  'INPUT_FILE' : '',
  // columns to preserve for later processing of anonymized dataset
  'TARGET_COLUMNS' : [
    'income'
  ],
  'AVERAGE_OUTPUT_RANGES' : true,
  // How many data points to fetch
  'NR_DRAWS' : 300,
  // Do we wnat to sample the dataset randomly?
  'RANDOM_DRAWS': false,
  // Min # of edges per node for graph generation
  'EDGE_MIN' : 3,
  // Max # of edges per node for graph generation
  'EDGE_MAX' : 10,
  // The k anonymization factor
  'K_FACTOR' : 10,
  // Weight of the Generalization Information Loss
  'ALPHA' : 1,
  // Weight of the Structural Information Loss
  'BETA' : 0,
  // Weight vector for generalization categories
  'GEN_WEIGHT_VECTORS' : {
    'equal': {
        'categorical': {
            'workclass': 1.0/8.0,
            'native-country': 1.0/8.0,
            'sex': 1.0/8.0,
            'race': 1.0/8.0,
            'marital-status': 1.0/8.0,
            'relationship': 1.0/8.0,
            'occupation': 1.0/8.0
        },
        'range': {
            'age': 1.0/8.0
        }
    },
    'emph_race': {
        'categorical': {
            'workclass': 0.02,
            'native-country': 0.02,
            'sex': 0.02,
            'race': 0.86,
            'marital-status': 0.02,
            'relationship': 0.02,
            'occupation': 0.02
        },
        'range': {
            'age': 0.02,
        }
    },
    'emph_age': {
        'categorical': {
            'workclass': 0.02,
            'native-country': 0.02,
            'sex': 0.02,
            'race': 0.02,
            'marital-status': 0.02,
            'relationship': 0.02,
            'occupation': 0.02
        },
        'range': {
            'age': 0.86,
        }
    }
  },
  // Chosen weight vector
  'VECTOR' : 'equal'
}

export { CONFIG };