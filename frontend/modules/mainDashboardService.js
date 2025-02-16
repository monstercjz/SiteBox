import { showNotification, renderWebsiteDashboardWithData } from './websiteDashboardService.js';
import { renderDockerDashboardWithData } from './dockerDashboardService.js';

import { renderMainDashboardWithData } from './mainDashboardServiceOrderFirst.js';

export async function renderDashboardWithData() {
    renderMainDashboardWithData()
    // await Promise.all([ // Parallel rendering of dashboards
        // renderWebsiteDashboardWithData(),
        // renderDockerDashboardWithData()
    // ]);
   }