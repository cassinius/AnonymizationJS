"use strict";
var CONFIG = {
    'INPUT_FILE': './test/io/test_input/adult_data.csv',
    'TRIM': '\\s+',
    'TRIM_MOD': 'g',
    'SEPARATOR': ',',
    'SEP_MOD': '',
    'TARGET_COLUMN': 'marital-status',
    'AVERAGE_OUTPUT_RANGES': false,
    'NR_DRAWS': 500,
    'RANDOM_DRAWS': false,
    'EDGE_MIN': 3,
    'EDGE_MAX': 10,
    'K_FACTOR': 2,
    'ALPHA': 1,
    'BETA': 0,
    'GEN_WEIGHT_VECTORS': {
        'equal': {
            'categorical': {
                'workclass': 1.0 / 13.0,
                'native-country': 1.0 / 13.0,
                'sex': 1.0 / 13.0,
                'race': 1.0 / 13.0,
                'relationship': 1.0 / 13.0,
                'occupation': 1.0 / 13.0,
                'income': 1.0 / 13.0
            },
            'range': {
                'age': 1.0 / 13.0,
                'fnlwgt': 1.0 / 13.0,
                'education-num': 1.0 / 13.0,
                'capital-gain': 1.0 / 13.0,
                'capital-loss': 1.0 / 13.0,
                'hours-per-week': 1.0 / 13.0
            }
        },
        'emph_race': {
            'categorical': {
                'workclass': 0.01,
                'native-country': 0.01,
                'sex': 0.01,
                'race': 0.88,
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
    'VECTOR': 'equal'
};
exports.CONFIG = CONFIG;
