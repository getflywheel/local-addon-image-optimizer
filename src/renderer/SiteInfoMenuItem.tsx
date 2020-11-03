import * as React from 'react';
import { useStoreSelector, selectors } from './store/store';
import {
	Spinner,
} from '@getflywheel/local-components';
import { OptimizerStatus } from '../types';

const SiteInfoMenuItem: React.FC = () => {
	const selectedSiteImages = useStoreSelector(selectors.selectedSiteImages);

	const selectedImages = useStoreSelector(selectors.selectedSiteImages);
	const uncompressedImages = useStoreSelector(selectors.uncompressedSiteImages);

	const isSelectableTable = useStoreSelector(selectors.selectActiveSiteIsSelectableTable);
	const isStatusRunning = useStoreSelector(selectors.selectActiveSiteIsStatusRunning);
	const data = OptimizerStatus.BEFORE ? uncompressedImages : selectedImages;
	const selectedCount = data.filter(data => data.isChecked).length

	return (
		<div className="SiteInfoMenuItem">
			<span style={{ flexGrow: 1 }}>Image Optimizer</span>
			{ isSelectableTable && selectedCount
				? (
					<span className="SiteInfoMenuItem_Badge">
						{ selectedCount < 1000 ? selectedCount : '999+' }
					</span>
				) : null
			}
			{ isStatusRunning
				? (
					<Spinner className='spinner-svg' />
				) : null
			}
		</div>
	);
}

export default SiteInfoMenuItem;
