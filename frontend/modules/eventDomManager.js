// domManager.js
export const SELECTORS = {
    groupSelect: '#groupSelect',
    main: 'main',
    websitedashboard: '#websitedashboard',
    dockerdashboard: '#dockerdashboard',

    importConfigButton: '#import-config-button',
    exportConfigButton: '#export-config-button',
    importWebsitesBatchButton: '#import-websites-batch-button',
    addGroupButton: '#add-group-button',
    addWebsiteButton: '#add-website-button',
    addDockerButton: '#add-docker-button',
    searchFormIcon: '.search-form__icon',

    actionsToggleButton: '#actions-toggle-button',
    actionButtons: '.action-buttons',
    iconButton: '.icon-button',
    groupColorToggleButton: '#group-color-toggle',
    themeSwitcherToggleButton:'#theme-switcher-toggle',
    themeSwitcherOptionsButtonContainer:'.theme-switcher__options',
    layoutSwitcherOptionsButtonContainer:'.layout-switcher__options',
    randomThemeButton:'#random-theme-button'

};

export const elements = {};

export function initializeDOMElements() {
    for (const [key, selector] of Object.entries(SELECTORS)) {
        elements[key] = document.querySelector(selector);
    }
}