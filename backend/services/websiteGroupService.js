'use strict';

// backend/services/websiteGroupService.js
const abstractGroupService = require('./abstractGroupService');
const { WEBSITE_GROUP_TYPE } = require('../config/constants');

const getAllGroups = async (env) => {
  return abstractGroupService.getAllGroups(env, WEBSITE_GROUP_TYPE);
};

const createGroup = async (env, groupData) => {
  return abstractGroupService.createGroup(env, WEBSITE_GROUP_TYPE, groupData);
};

const getGroupById = async (env, groupId) => {
  return abstractGroupService.getGroupById(env, groupId);
};

const updateGroup = async (env, groupId, groupData) => {
  return abstractGroupService.updateGroup(env, groupId, groupData);
};

const deleteGroup = async (env, groupId) => {
  return abstractGroupService.deleteGroup(env, groupId);
};

const reorderGroups = async (env, reorderData) => {
  return abstractGroupService.reorderGroups(env, reorderData);
};

module.exports = {
  getAllGroups,
  createGroup,
  getGroupById,
  updateGroup,
  deleteGroup,
  reorderGroups,
};
