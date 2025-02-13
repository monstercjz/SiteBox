import { showNotification, renderWebsiteDashboardWithData } from './websiteDashboardService.js';
import { renderDockerDashboardWithData } from './dockerDashboardService.js';



export async function renderDashboardWithData() {
    await Promise.all([ // Parallel rendering of dashboards
        renderWebsiteDashboardWithData(),
        renderDockerDashboardWithData()
    ]);
   }