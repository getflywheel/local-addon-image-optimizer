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
		lastScan,
		scanInProgress
	} = scanImageState;

	const onClickViewImages = () => {
		setOverviewSelected(false);
		props.fetchImageStateData();
	}

	const remainingUncompressedImages = imageCount - totalCompressedCount;

	return <div className="overview_Container">
		{remainingUncompressedImages > 0 &&
			<Banner className="imageNotificationBanner" variant="success" icon="false" buttonText={'View Images'} buttonOnClick={() => onClickViewImages()}>
				We've found{' '}<strong>{remainingUncompressedImages}</strong>images slowing down your site.
			</Banner>
		}
		{imageCount === 0
		&& lastScan > 0
		&& !scanInProgress
		&&
			<Banner variant="warning" icon="warning">
				No images found on site.
			</Banner>
		}

		<LastOptimizeStatus
			scanImageState={scanImageState}
			handleScanForImages={handleScanForImages}
		/>
	</div>
}
