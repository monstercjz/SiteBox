import { showNotification, renderWebsiteDashboardWithData } from './websiteDashboardService.js';
import { renderDockerDashboardWithData } from './dockerDashboardService.js';

import { renderMainDashboardWithData } from './newdashboard.js';

export async function renderDashboardWithData() {
    renderMainDashboardWithData()
    // await Promise.all([ // Parallel rendering of dashboards
        // renderWebsiteDashboardWithData(),
        // renderDockerDashboardWithData()
    // ]);
   }