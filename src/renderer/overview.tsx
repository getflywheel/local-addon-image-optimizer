import React from 'react';
import { Banner } from '@getflywheel/local-components';
import LastOptimizeStatus from './lastOptimizeStatus';
import { SiteImageData } from '../types';

interface IProps {
	setOverviewSelected: (x: boolean) => void,
	handleScanForImages: () => void,
	scanImageState: SiteImageData,
	fetchImageStateData: () => void,
}

export const Overview = (props: IProps) => {
	const { setOverviewSelected, handleScanForImages, scanImageState } = props;
	const {
		imageCount,
		totalCompressedCount,
	} = scanImageState;

	const onClickViewImages = () => {
		setOverviewSelected(false);
		props.fetchImageStateData();
	}

	const remainingUncompressedImages = imageCount - totalCompressedCount;

	return <div className="overview_Container">
		{remainingUncompressedImages > 0 &&
			<Banner variant="warning" icon="warning" buttonText={'View Images'} buttonOnClick={() => onClickViewImages()}>
				We've found{' '}<strong>{remainingUncompressedImages}</strong>images slowing down your site.
			</Banner>
		}

		<LastOptimizeStatus
			scanImageState={scanImageState}
			handleScanForImages={handleScanForImages}
		/>
	</div>
}
