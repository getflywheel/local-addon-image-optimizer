import fs from 'fs-extra';
import path from 'path';
import { Provider } from 'react-redux';
import * as LocalRenderer from '@getflywheel/local/renderer';
import { IPC_EVENTS } from './constants';
import makeStore from './renderer/store';
import ImageOptimizer from './renderer/index';
import { MetaDataRow } from './renderer/preferencesRows';

const packageJSON = fs.readJsonSync(path.join(__dirname, '../package.json'));
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
