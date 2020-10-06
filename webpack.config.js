const path = require('path');

const commonConfig = {
	node: {
		fs: 'empty',
		child_process: 'empty',
		__dirname: false,
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.jsx', '.js'],
	},
	output: {
		filename: '[name].js',
		path: path.join(__dirname, 'lib'),
		libraryTarget: 'commonjs2',
	},
};

const tsModuleCompilerRule = {
	test: /\.[tj]sx?$/,
	exclude: [/node_modules/],
	use: [
		{
			loader: 'ts-loader',
			options: {
				transpileOnly: true,
				configFile: 'tsconfig.json',
			},
		},
	],
};

module.exports = [
	{
		entry: {
			renderer: path.join(__dirname, 'src', 'renderer.tsx'),
		},
		externals: [
			'@getflywheel/local/renderer',
			'react',
			'@getflywheel/local-components',
		],
		target: 'electron-renderer',
		module: {
			rules: [
				tsModuleCompilerRule,
				{
					test: /\.svg$/,
					issuer: {
						test: /\.[tj]sx?$/,
					},
					use: [
						'babel-loader',
						{
							loader: 'react-svg-loader',
							options: {
								svgo: {
									plugins: [
										{
											inlineStyles: { onlyMatchedOnce: false },
										},
									],
								},
							},
						},
					],
				},
			],
		},
	},
	{
		entry: {
			main: path.join(__dirname, 'src', 'main.ts'),
		},
		externals: [
			'@getflywheel/local/main',
		],
		target: 'electron-main',
		module: {
			rules: [
				tsModuleCompilerRule,
			],
		},
	},
].map(c => ({ ...commonConfig, ...c }));
