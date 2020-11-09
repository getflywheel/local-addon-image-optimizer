import React from 'react';
import { useStoreSelector, selectors } from './store/store';
import {
	Spinner,
} from '@getflywheel/local-components';
import { OptimizerStatus } from '../types';

const SiteInfoMenuItem: React.FC = () => {
	const selectedImages = useStoreSelector(selectors.selectedSiteImages);
	const uncompressedImages = useStoreSelector(selectors.uncompressedSiteImages);
	const isSelectableTable = useStoreSelector(selectors.selectActiveSiteIsSelectableTable);
	const isStatusRunning = useStoreSelector(selectors.selectActiveSiteIsStatusRunning);
	const data = OptimizerStatus.BEFORE ? uncompressedImages : selectedImages;
	const selectedCount = data.filter(data => data.isChecked).length

	let Icon = () => null;

	if (isSelectableTable && selectedCount) {
		Icon = () => (
			<span className="SiteInfoMenuItem_Badge">
				{ selectedCount < 1000 ? selectedCount : '999+' }
			</span>
		)
	} if (isStatusRunning) {
		Icon = () => (
			<Spinner className='spinner-svg' />
		)
}

	return (
		<div className="SiteInfoMenuItem">
			<span style={{ flexGrow: 1 }}>Image Optimizer</span>
			<Icon />
		</div>
	);
}

export default SiteInfoMenuItem;
