"use strict";
var CONFIG = {
    'NR_DRAWS': 300,
    'RANDOM_DRAWS': false,
    'EDGE_MIN': 3,
    'EDGE_MAX': 10,
    'K_FACTOR': 10,
    'ALPHA': 0.2,
    'BETA': 0.8,
    'GEN_WEIGHT_VECTORS': {
        'equal': {
            'categorical': {
                'workclass': 1.0 / 6.0,
                'native-country': 1.0 / 6.0,
                'sex': 1.0 / 6.0,
                'race': 1.0 / 6.0,
                'marital-status': 1.0 / 6.0
            },
            'range': {
                'age': 1.0 / 6.0
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
    'VECTOR': 'equal'
};
exports.CONFIG = CONFIG;
