import 'jest-extended';
import * as LocalMain from '@getflywheel/local/main';
import { SiteDataBySiteID, SiteData } from '../types';
import { filterDeletedSiteData } from './filterDeletedSiteData';

const mockServiceContainer = {
	siteData: {
		sites: {
			'a': {},
			'b': {},
		},

		getSite(id: string) {
			return this.sites[id] || null;
		},
	} as LocalMain.SiteData,
} as LocalMain.ServiceContainerServices;

const siteIDs = ['a', 'b', 'c', 'd'];
const siteDataBySiteID = {} as SiteDataBySiteID;
siteIDs.forEach((id) => {
	siteDataBySiteID[id] = {} as SiteData;
});

describe('filterDeletedSiteData', () => {
	it('purges site from sites that no longer exist within Local', () => {
		const purgedSiteData = filterDeletedSiteData(siteDataBySiteID, mockServiceContainer);

		expect(purgedSiteData).toContainAllKeys(['a', 'b']);
		expect(purgedSiteData).not.toContainAnyKeys(['c', 'd']);
	});
});
