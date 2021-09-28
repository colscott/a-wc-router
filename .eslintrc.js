  
// ESLint configuration
// http://eslint.org/docs/user-guide/configuring

module.exports = {
    extends: ['eslint-config-colscott'],
    overrides: [
        {
            files: ["*.test.js", "*.spec.js"],
            rules: {
                "no-unused-expressions": "off"
            }
        }
    ]
};