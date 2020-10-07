import React from 'react';
import { Banner } from '@getflywheel/local-components';
import LastOptimizeStatus from './lastOptimizeStatus';
import { calculateRemainingUncompressed } from './utils';
import { CombinedStateData } from '../types';

interface IProps {
	setOverviewSelected: (x: boolean) => void,
	handleScanForImages: () => void,
	combinedStateData: CombinedStateData,
	fetchImageStateData: () => void,
}

export const Overview = (props: IProps) => {
	const { setOverviewSelected, handleScanForImages, combinedStateData } = props;
	const {
		imageCount,
		totalCompressedCount,
	} = combinedStateData;

	const onClickViewImages = () => {
		setOverviewSelected(false);
		props.fetchImageStateData();
	}

	const remainingUncompressedImages = calculateRemainingUncompressed(imageCount, totalCompressedCount);

	return <div className="overview_Container">
		{remainingUncompressedImages > 0 &&
			<Banner variant="warning" icon="warning" buttonText={'View Images'} buttonOnClick={() => onClickViewImages()}>
				We've found{' '}<strong>{remainingUncompressedImages}</strong>images slowing down your site.
			</Banner>
		}

		<LastOptimizeStatus
			handleScanForImages={handleScanForImages}
			combinedStateData={combinedStateData}
		/>
	</div>
}
