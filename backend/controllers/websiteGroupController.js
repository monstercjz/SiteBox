// backend/controllers/websiteGroupController.js
const websiteGroupService = require('../services/websiteGroupService');
const syncService = require('../services/syncService');
const apiResponse = require('../utils/apiResponse');

const getAllGroups = async (c) => {
  try {
    const env = c.env;
    const groups = await websiteGroupService.getAllGroups(env);
    return apiResponse.success(c, groups);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const createGroup = async (c) => {
  try {
    const env = c.env;
    const body = await c.req.json();
    const group = await websiteGroupService.createGroup(env, body);
    await syncService.backupData(env);
    return apiResponse.success(c, group, 201);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const getGroupById = async (c) => {
  try {
    const env = c.env;
    const { groupId } = c.req.param();
    const group = await websiteGroupService.getGroupById(env, groupId);
    if (!group) return apiResponse.error(c, 'Group not found', 404);
    return apiResponse.success(c, group);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const updateGroup = async (c) => {
  try {
    const env = c.env;
    const { groupId } = c.req.param();
    const body = await c.req.json();
    const group = await websiteGroupService.updateGroup(env, groupId, body);
    if (!group) return apiResponse.error(c, 'Group not found', 404);
    await syncService.backupData(env);
    return apiResponse.success(c, group);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const deleteGroup = async (c) => {
  try {
    const env = c.env;
    const { groupId } = c.req.param();
    const result = await websiteGroupService.deleteGroup(env, groupId);
    if (!result) return apiResponse.error(c, 'Group not found', 404);
    await syncService.backupData(env);
    return apiResponse.success(c, { message: 'Group deleted successfully' });
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const reorderGroups = async (c) => {
  try {
    const env = c.env;
    const body = await c.req.json();
    const groups = await websiteGroupService.reorderGroups(env, body);
    return apiResponse.success(c, groups);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

module.exports = { getAllGroups, createGroup, getGroupById, updateGroup, deleteGroup, reorderGroups };
