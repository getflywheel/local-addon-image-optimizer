module.exports = {
	extends: [
		'plugin:@typescript-eslint/recommended',
		'@getflywheel/eslint-config-local',
	],
	parser: '@typescript-eslint/parser',
	plugins: [
		'@typescript-eslint',
		'jest',
	],
	env: {
		'jest/globals': true,
	},
	root: true,
	rules: {
		'import/no-unresolved': [
			2,
			{
				'ignore': [
					/**
					 * Ignore @getflywheel/local import paths since this modules is injected at runtime
					 * import/no-unresolved cannot check that these resolve correctly since it can only check what
					 * is on disk statically without taking any runtime specific things into account
					 */
					'@getflywheel/local',
				],
			},
		],
		/**
		 * The stock no-use-before-define rule is incompatible with TS. The solution is to disable it and then
		 * enable a similar rule designed for TS
		 *
		 * https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-use-before-define.md#how-to-use
		 */
		'no-use-before-define': 'off',
		'@typescript-eslint/no-use-before-define': [1],
	},
	settings: {
		'import/resolver': {
		    'node': {
		        'extensions': ['.ts', '.tsx', '.js', '.jsx'],
		    },
		},
	},
};
