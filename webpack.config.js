const path = require('path');

module.exports = {
	entry: {
		renderer: path.join(__dirname, 'src', 'renderer.tsx'),
		main: path.join(__dirname, 'src', 'main.ts'),
	},
	externals: [
		'@getflywheel/local/renderer',
		'@getflywheel/local/main',
		'react',
		'@getflywheel/local-components',
		'react-dom',
	],
	target: 'electron-renderer',
	module: {
		rules: [
			{
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
			},
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
