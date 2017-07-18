module.exports = {
    "env": {
        "node": true,
        "es6": true
    },

    "extends": ["eslint:recommended", "google"],
    "rules": {
        "max-len": [2, 120, 2],
        "require-jsdoc": 0,
        "valid-jsdoc": 0,
        'no-case-declarations': 0,
        "comma-dangle": [2, "never"],
        "prefer-rest-params": 0
    },"globals": {
        "logger": true,
        "describe": true,
        "it": true,
        "before": true
    }
};