// domManager.js
export const SELECTORS = {
    groupSelect: '#groupSelect',
    websitedashboard: '#websitedashboard',
    main: 'main',
    dockerdashboard: '#dockerdashboard',
    importConfigButton: '#import-config-button',
    exportConfigButton: '#export-config-button',
    importWebsitesBatchButton: '#import-websites-batch-button',
    actionsToggleButton: '#actions-toggle-button',
    actionButtons: '.action-buttons',
    addGroupButton: '#add-group-button',
    addWebsiteButton: '#add-website-button',
    addDockerButton: '#add-docker-button',
    groupColorToggleButton: '#group-color-toggle'
};

export const elements = {};

export function initializeDOMElements() {
    for (const [key, selector] of Object.entries(SELECTORS)) {
        elements[key] = document.querySelector(selector);
    }
}