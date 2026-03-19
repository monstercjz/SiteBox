// backend/controllers/websiteController.js
const websiteService = require('../services/websiteService');
const syncService = require('../services/syncService');
const apiResponse = require('../utils/apiResponse');

const getAllWebsites = async (c) => {
  try {
    const env = c.env;
    const websites = await websiteService.getAllWebsites(env);
    return apiResponse.success(c, websites);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const getWebsitesByGroupId = async (c) => {
  try {
    const env = c.env;
    const { groupId } = c.req.param();
    const websites = await websiteService.getWebsitesByGroupId(env, groupId);
    return apiResponse.success(c, websites);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const createWebsite = async (c) => {
  try {
    const env = c.env;
    const { groupId } = c.req.param();
    const body = await c.req.json();
    const website = await websiteService.createWebsite(env, groupId, body);
    await syncService.backupData(env);
    return apiResponse.success(c, website, 201);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const getWebsiteById = async (c) => {
  try {
    const env = c.env;
    const { websiteId } = c.req.param();
    const website = await websiteService.getWebsiteById(env, websiteId);
    if (!website) return apiResponse.error(c, 'Website not found', 404);
    return apiResponse.success(c, website);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const updateWebsite = async (c) => {
  try {
    const env = c.env;
    const { websiteId } = c.req.param();
    const body = await c.req.json();
    const website = await websiteService.updateWebsite(env, websiteId, body);
    if (!website) return apiResponse.error(c, 'Website not found', 404);
    await syncService.backupData(env);
    return apiResponse.success(c, website);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const deleteWebsite = async (c) => {
  try {
    const env = c.env;
    const { websiteId } = c.req.param();
    const result = await websiteService.deleteWebsite(env, websiteId);
    await syncService.backupData(env);
    return apiResponse.success(c, result);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const reorderWebsites = async (c) => {
  try {
    const env = c.env;
    const body = await c.req.json();
    const websites = await websiteService.reorderWebsites(env, body);
    return apiResponse.success(c, websites);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const batchDeleteWebsites = async (c) => {
  try {
    const env = c.env;
    const body = await c.req.json();
    const count = await websiteService.batchDeleteWebsites(env, body.websiteIds || body);
    await syncService.backupData(env);
    return apiResponse.success(c, { deleted: count });
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const batchMoveWebsites = async (c) => {
  try {
    const env = c.env;
    const body = await c.req.json();
    const count = await websiteService.batchMoveWebsites(env, body.websiteIds, body.targetGroupId);
    return apiResponse.success(c, { moved: count });
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const batchImportWebsites = async (c) => {
  try {
    const env = c.env;
    const body = await c.req.json();
    const result = await websiteService.batchImportWebsites(env, body.websites, body.groupId);
    return apiResponse.success(c, result);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

module.exports = {
  getAllWebsites,
  getWebsitesByGroupId,
  createWebsite,
  getWebsiteById,
  updateWebsite,
  deleteWebsite,
  reorderWebsites,
  batchDeleteWebsites,
  batchMoveWebsites,
  batchImportWebsites,
};
