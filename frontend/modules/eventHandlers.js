// eventHandlers.js
import { elements } from './eventDomManager.js';
import { 
    addWebsite, 
    handleWebsiteClick,
    handleWebsiteHover, 
} from './websiteInteractionService.js';
import { 
    handleDockerHover,
    addDocker 
} from './dockerInteractionService.js';

//快速添加item
export function handleQuicklyAddClick(e) {
    const addIcon = e.target.closest('.quickly-item-add-button');
    if (!addIcon) return;

    const groupElement = addIcon.closest('.website-group, .docker-group');
    if (groupElement) {
        const groupType = groupElement.getAttribute('groupType');
        const groupId = groupElement.getAttribute('id');
        if (groupType === 'website-group') {
            addWebsite(groupId);
        } else if (groupType === 'docker-group') {
            addDocker(groupId);
        } else {
            console.warn('Unknown group type:', groupType);
        }
    }
}
//打开website
export function handleWebsiteItemClick(e) {
    const websiteTarget = e.target.closest('.website-item');
    if (!websiteTarget) return;

    const link = websiteTarget.querySelector('a');
    if (link) {
        handleWebsiteClick(websiteTarget);
        window.open(link.href, '_blank');
    }
}

//打开docker
export function handleDockerItemClick(e) {
    const dockerTarget = e.target.closest('.docker-item');
    if (!dockerTarget) return;

    const link = dockerTarget.querySelector('a');
    if (link) {
        window.open(link.href, '_blank');
    } else {
        console.warn('No <a> element found within the clicked .docker-item');
    }
}
// 合并鼠标悬停事件处理逻辑，item详细信息显示
export function handleHoverEvents(e) {
    const websiteTarget = e.target.closest('.website-item');
    if (websiteTarget) {
        handleWebsiteHover(websiteTarget);
        return;
    }

    const dockerTarget = e.target.closest('.docker-item');
    if (dockerTarget) {
        handleDockerHover(dockerTarget);
    }
}