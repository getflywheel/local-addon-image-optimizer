import React from 'react';
import fs from 'fs-extra';
import path from 'path';
import { Provider } from 'react-redux';
import * as LocalRenderer from '@getflywheel/local/renderer';
import { IPC_EVENTS } from './constants';
import { Preferences, SiteDataBySiteID } from './types';
import { store, actions } from './renderer/store/store';
import ImageOptimizer from './renderer/index';
import { MetaDataRow } from './renderer/preferencesRows';
import { setupListeners } from './renderer/setupListeners';
import SiteInfoMenuItem from './renderer/SiteInfoMenuItem';

const stylesheetPath = path.resolve(__dirname, '../style.css');

export default async function (context) {
	const { React, hooks } = context;
	const packageJSON = fs.readJsonSync(path.join(__dirname, '../package.json'));
	const addonID = packageJSON.slug;

	setupListeners();

	const preferences: Preferences = await LocalRenderer.ipcAsync(
		IPC_EVENTS.READ_PREFERENCES_FROM_DISK,
	);

	const cachedImageDataBySiteID: SiteDataBySiteID = await LocalRenderer.ipcAsync(
		IPC_EVENTS.GET_IMAGE_DATA_STORE,
	);

	/**
	 * It is important that the store get hydrated before any React components are mounted so that the data is ready
	 * once the components are mounted
	 */
	store.dispatch(actions.hydratePreferences(preferences));
	store.dispatch(actions.hydrateSites(cachedImageDataBySiteID));

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

	const SiteInfoMenuItemHOC = withStoreProvider(SiteInfoMenuItem);

	const ImageOptimizerHOC = withStoreProvider(ImageOptimizer);

	hooks.addFilter(
		'siteInfoToolsItem',
		(menu) => {
			menu.push({
				path: `/${addonID}`,
				menuItem: <SiteInfoMenuItemHOC />,
				render: ({ site }) => (
					<ImageOptimizerHOC siteID={site.id} />
				),
			});
			return menu;
		},
	);


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
		},
	);
}
