import {
    fetchDataFromApi,
    getWebsites,
    getWebsiteGroups,
    getWebsiteById,
    getWebsiteGroupById,
    getWebsitesByGroupId,
    createWebsite,
    createWebsiteGroup,
    updateWebsite,
    updateWebsiteGroup,
    deleteWebsite,
    deleteWebsiteGroup,
    batchDeleteWebsites,
    batchMoveWebsites,
    reorderWebsiteGroups,
  } from './api.js';

// 渲染分组下拉框
export function renderGroupSelect(data) {
    const groupSelect = document.getElementById('groupSelect');
    groupSelect.innerHTML = '<option value="">选择分组</option>';
    const fragment = document.createDocumentFragment();
    data.groups.forEach(group => {
        const option = document.createElement('option');
        option.value = group.id;
        option.textContent = group.name;
        fragment.appendChild(option);
    });
    groupSelect.appendChild(fragment);
}

// 获取分组下拉框数据
export async function fetchGroupSelectData() {
    try {
        const groups = await getWebsiteGroups();
        return { groups };
    } catch (error) {
        console.error('Failed to fetch group data:', error);
        showNotification('加载分组数据失败，请检查控制台获取详细信息', 'error');
        return null;
    }
}

// 渲染分组下拉框数据
export async function renderGroupSelectWithData() {
    const data = await fetchGroupSelectData();
    if (data) {
        renderGroupSelect(data);
    }
}

// 获取分组数据并渲染下拉框
export async function fetchAndRenderGroupSelect() {
    await renderGroupSelectWithData();
}