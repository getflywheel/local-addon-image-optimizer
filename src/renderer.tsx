import path from 'path';
import { Provider } from 'react-redux';
import * as LocalRenderer from '@getflywheel/local/renderer';
import { IPC_EVENTS } from './constants';
import { Preferences, CachedImageDataBySiteID } from './types';
import { store, actions } from './renderer/store';
import ImageOptimizer from './renderer/index';
import { MetaDataRow } from './renderer/preferencesRows';

const stylesheetPath = path.resolve(__dirname, '../style.css');

export default async function (context) {
	const { React, hooks } = context;

	const preferences: Preferences = await LocalRenderer.ipcAsync(
		IPC_EVENTS.READ_PREFERENCES_FROM_DISK
	);

	const cachedImageDataBySiteID: CachedImageDataBySiteID = await LocalRenderer.ipcAsync(
		IPC_EVENTS.GET_IMAGE_DATA_STORE,
	);

	const sites = await LocalRenderer.ipcAsync(
		IPC_EVENTS.READ_SITES_FROM_DISK,
	);

	/**
	 * We must add empty records for any sites that we do not yet have image optimizer data for so that we can
	 * properly hydrate state
	 */
	Object.keys(sites).forEach((key) => {
		if (!cachedImageDataBySiteID[key]) {
			cachedImageDataBySiteID[key] = {
				imageData: {},
			};
		}
	})

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

	const Component = withStoreProvider(ImageOptimizer);

	hooks.addContent('stylesheets', () => (
		<link
			rel="stylesheet"
			key="imageOptimizer-addon-stylesheet"
			href={stylesheetPath}
		/>
	));

	hooks.addContent('siteToolsImageOptimizer', ({ match }) => {
		return (
			<Component match={match} />
		)
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
