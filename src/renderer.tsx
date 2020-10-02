import fs from 'fs-extra';
import path from 'path';
import React from 'react';
import { Provider } from 'react-redux';
import * as LocalRenderer from '@getflywheel/local/renderer';
import { IPC_EVENTS } from './constants';
import makeStore from './store';
import { ImageOptimizer } from './renderer/index';
import { MetaDataRow } from './renderer/preferencesRows';

const packageJSON = fs.readJsonSync(path.join(__dirname, '../package.json'));
const addonName = packageJSON['productName'];
const addonID = packageJSON['slug'];
const stylesheetPath = path.resolve(__dirname, '../style.css');


export default async function (context) {
	const { React, hooks } = context;
	const { Route } = context.ReactRouter;

	const store = await makeStore();

	const withStoreProvider = (Component) => (props) => (
		<Provider store={store}>
			<Component {...props} />
		</Provider>
	);

	hooks.addContent('stylesheets', () => (
		<link
			rel="stylesheet"
			key="imageOptimizer-addon-stylesheet"
			href={stylesheetPath}
		/>
	));

	// Create the route/page of content that will be displayed when the menu option is clicked
	hooks.addContent('routesSiteInfo', () => <Route key={`${addonID}-addon`} path={`/main/site-info/:siteID/${addonID}`}
		render={(props) => <ImageOptimizer {...props} />} />);


	// Add menu option within the site menu bar
	hooks.addFilter('siteInfoMoreMenu', function (menu, site) {
		menu.push({
			label: `${addonName}`,
			enabled: true,
			click: () => {
				context.events.send('goToRoute', `/main/site-info/${site.id}/${addonID}`);
			}
		});

		return menu;
	});

	hooks.addFilter(
		'preferencesMenuItems',
		(menu) => {
			menu.push({
				path: 'image-optimizer',
				displayName: 'Image Optimizer',
				sections: [
					{
						rows: [
							{
								name: 'Metadata',
								component: withStoreProvider(MetaDataRow),
							},
						],
					},
				],
				onApply: () => {
					LocalRenderer.ipcAsync(
						IPC_EVENTS.SAVE_PREFERENCES_TO_DISK,
						store.getState().preferences,
					);
				},
			});

			return menu;
		}
	);
};
