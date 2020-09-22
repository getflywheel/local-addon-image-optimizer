import { ImageOptimizer } from './renderer/index';
import fs from 'fs-extra';
import path from 'path';

const packageJSON = fs.readJsonSync(path.join(__dirname, '../package.json'));
const addonName = packageJSON['productName'];
const addonID = packageJSON['slug'];
const stylesheetPath = path.resolve(__dirname, '../style.css');

export default function (context) {
	const { React, hooks } = context;
	const { Route } = context.ReactRouter;

	hooks.addContent('stylesheets', () => (
		<link
			rel="stylesheet"
			key="imageOptimizer-addon-stylesheet"
			href={stylesheetPath}
		/>
	));

	hooks.addContent('imageOptimizer', ({ props, routeChildrenProps }) => (
		<ImageOptimizer
			{...props}
			{...routeChildrenProps}
		/>
	));


	// Add Preference Menu Option for Image Optimizer
	hooks.addFilter('preferenceMenu', function (menu, site) {
		menu.push({
			enabled: false,
			label: 'Image Optimizer',
			toRoute: `/settings/imageOptimizer/`
		});

		return menu;
	});
}
