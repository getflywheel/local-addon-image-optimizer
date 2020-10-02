import React from 'react';
import { Banner } from '@getflywheel/local-components';
import LastOptimizeStatus from './lastOptimizeStatus';

interface IProps {
	setOverviewSelected: (x: boolean) => void,
	handleScanForImages: () => void,
	scanImageState: GenericObject,
	fetchImageStateData: () => void,
}

export const Overview = (props: IProps) => {
	const { setOverviewSelected, handleScanForImages, scanImageState } = props;
	const { lastUpdated, totalDeductions, totalFileSizeDeductions, totalImageOptimized, remainingUncompressedImages } = scanImageState;

	const onClickViewImages = () => {
		setOverviewSelected(false);
		props.fetchImageStateData();
	}

	return <div className="overview_Container">
		{remainingUncompressedImages > 0 &&
			<Banner variant="warning" icon="warning" buttonText={'View Images'} buttonOnClick={() => onClickViewImages()}>
				We've found{' '}<strong>{remainingUncompressedImages}</strong>images slowing down your site.
			</Banner>
		}

		<LastOptimizeStatus
			lastUpdated={lastUpdated}
			totalDeductions={totalDeductions}
			totalFileSizeDeductions={totalFileSizeDeductions}
			totalImageOptimized={totalImageOptimized}
			handleScanForImages={handleScanForImages}
			scanImageState={scanImageState}
		/>
	</div>
}
