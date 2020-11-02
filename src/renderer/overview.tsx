import React from 'react';
import { Banner } from '@getflywheel/local-components';
import LastOptimizeStatus from './lastOptimizeStatus';
import { selectors, useStoreSelector } from './store/store';
import { SiteImageData } from '../types';

interface IProps {
	setOverviewSelected: (x: boolean) => void,
	handleScanForImages: () => void,
	siteImageData: SiteImageData,
	siteID: string,
}

export const Overview = (props: IProps) => {
	const {
		setOverviewSelected,
		handleScanForImages,
		siteImageData,
	} = props;

	const {
		lastScan,
		scanInProgress,
	} = siteImageData;

	const onClickViewImages = () => {
		setOverviewSelected(false);
	}

	const {
		imageCount,
		originalTotalSize,
		compressedImagesOriginalSize,
		compressedTotalSize,
		totalCompressedCount,
		erroredTotalCount,
	} = useStoreSelector(selectors.imageStats);

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
			siteImageData={siteImageData}
			handleScanForImages={handleScanForImages}
			imageCount={imageCount}
			totalCompressedCount={totalCompressedCount}
			originalTotalSize={originalTotalSize}
			compressedImagesOriginalSize={compressedImagesOriginalSize}
			compressedTotalSize={compressedTotalSize}
			erroredTotalCount={erroredTotalCount}
		/>
	</div>
}
