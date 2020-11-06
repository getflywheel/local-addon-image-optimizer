import * as LocalMain from '@getflywheel/local/main';
import { SiteDataBySiteID } from '../types';

export function purgeDeletedSiteData(existingSiteDataBySiteID: SiteDataBySiteID, serviceContainer: LocalMain.ServiceContainerServices) {
	const siteDataBySiteID = {};

	for (const [id, siteData] of Object.entries(existingSiteDataBySiteID)) {
		if (serviceContainer.siteData.getSite(id)) {
			siteDataBySiteID[id] = siteData;
		}
	}

	return siteDataBySiteID;
}
