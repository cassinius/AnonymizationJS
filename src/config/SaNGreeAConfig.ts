var CONFIG = {
  // How many data points to fetch
  'NR_DRAWS' : 300,
  // Do we wnat to sample the dataset randomly?
  'RANDOM_DRAWS': false,
  // Min # of edges per node for graph generation
  'EDGE_MIN' : 3,
  // Max # of edges per node for graph generation
  'EDGE_MAX' : 10,
  // The k anonymization factor
  'K_FACTOR'  : 10,
  // Weight of the Generalization Information Loss
  'ALPHA'     : 0.2,
  // Weight of the Structural Information Loss
  'BETA'      : 0.8,
  // Weight vector for generalization categories
  'GEN_WEIGHT_VECTORS' : {
    'equal': {
        'categorical': {
            'workclass': 1.0/6.0,
            'native-country': 1.0/6.0,
            'sex': 1.0/6.0,
            'race': 1.0/6.0,
            'marital-status': 1.0/6.0
        },
        'range': {
            'age': 1.0/6.0
        }
    },
    'emph_race': {
        'categorical': {
            'workclass': 0.02,
            'native-country': 0.02,
            'sex': 0.02,
            'race': 0.9,
            'marital-status': 0.02,
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
        },
        'range': {
            'age': 0.9,
        }
    }
  },
  // Chosen weight vector
  'VECTOR' : 'equal'
}

export { CONFIG };