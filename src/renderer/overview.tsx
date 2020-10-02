import React from 'react';

import { Button, Banner } from '@getflywheel/local-components';
import LastOptimizeStatus from './lastOptimizeStatus';

interface IProps {
	setOverviewSelected: (x: boolean) => void,
	handleScanForImages: () => void,
	scanImageState: GenericObject,
	setSiteImageData: () => void,
}

export const Overview = (props: IProps) => {
	const { setOverviewSelected, handleScanForImages, scanImageState } = props;
	const { scannedImages, lastUpdated, totalDeductions, totalFileSizeDeductions, totalImageOptimized, remainingUncompressedImages } = scanImageState;

	const onClickViewImages = () => {
		setOverviewSelected(false);
		props.setSiteImageData();
	}

	return <div className="overview_Container">
		{remainingUncompressedImages > 0 &&
			<Banner variant="warning" icon="warning" buttonText={'View Images'} buttonOnClick={() => onClickViewImages()}>
				We've found <strong>{remainingUncompressedImages}</strong>images slowing down your site.
			</Banner>
		}

		<LastOptimizeStatus
			lastUpdated={lastUpdated}
			totalDeductions={totalDeductions}
			totalFileSizeDeductions={totalFileSizeDeductions}
			totalImageOptimized={totalImageOptimized}
		/>

		{/* // TODO-abotz: Need designs from Julie to update this */}
		<div>
			{scanImageState.scanLoading && 'Loading...'}
			<Button onClick={() => handleScanForImages()}>Placeholder Scan Button (REMOVE)</Button>
		</div>
	</div>

}
