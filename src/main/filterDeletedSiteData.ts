import * as LocalMain from '@getflywheel/local/main';
import { SiteDataBySiteID } from '../types';

/**
 * Filters out any SiteData from sites that have been deleted in Local
 *
 * @param existingSiteDataBySiteID
 * @param serviceContainer
 */
export function filterDeletedSiteData (existingSiteDataBySiteID: SiteDataBySiteID, serviceContainer: LocalMain.ServiceContainerServices) {
	const siteDataBySiteID: SiteDataBySiteID = {};

	for (const [id, siteData] of Object.entries(existingSiteDataBySiteID)) {
		if (serviceContainer.siteData.getSite(id)) {
			siteDataBySiteID[id] = siteData;
		}
	}

	return siteDataBySiteID;
}
