

import { renderMainDashboardWithData } from './mainDashboardServiceOrderFirst.js';
import {getSiteName} from "./api.js";

export async function renderDashboardWithData() {
    renderh1()
    renderMainDashboardWithData()


}
async function renderh1() {
    getSiteName()
        .then(data => {
            console.log(data);
            const siteNamePlaceholder = document.getElementById('siteNamePlaceholder');
            if (siteNamePlaceholder) {
                siteNamePlaceholder.textContent = data.siteName || 'SiteBox'; // Use 'SiteBox' as default if API fails
            }
        })
        .catch(error => {
            console.error('Failed to fetch site name:', error);
            const siteNamePlaceholder = document.getElementById('siteNamePlaceholder');
            if (siteNamePlaceholder) {
                siteNamePlaceholder.textContent = 'SiteBox'; // Fallback to default on error
            }
        });

}
