"use strict";
var CONFIG = {
    'INPUT_FILE': './test/io/test_input/housing_data.csv',
    'TRIM': '',
    'TRIM_MOD': '',
    'SEPARATOR': '\\s+',
    'SEP_MOD': 'g',
    'TARGET_COLUMN': 'MEDV',
    'AVERAGE_OUTPUT_RANGES': true,
    'NR_DRAWS': 506,
    'RANDOM_DRAWS': false,
    'EDGE_MIN': 3,
    'EDGE_MAX': 10,
    'K_FACTOR': 19,
    'ALPHA': 1,
    'BETA': 0,
    'GEN_WEIGHT_VECTORS': {
        'equal': {
            'range': {
                'CRIM': 1.0 / 13.0,
                'ZN': 1.0 / 13.0,
                'INDUS': 1.0 / 13.0,
                'CHAS': 1.0 / 13.0,
                'NOX': 1.0 / 13.0,
                'RM': 1.0 / 13.0,
                'AGE': 1.0 / 13.0,
                'DIS': 1.0 / 13.0,
                'RAD': 1.0 / 13.0,
                'TAX': 1.0 / 13.0,
                'PTRATIO': 1.0 / 13.0,
                'B': 1.0 / 13.0,
                'LSTAT': 1.0 / 13.0
            }
        }
    },
    'VECTOR': 'equal'
};
exports.CONFIG = CONFIG;
