'use strict';

// backend/services/dockerGroupService.js
const abstractGroupService = require('./abstractGroupService');
const { DOCKER_GROUP_TYPE } = require('../config/constants');

const getAllGroups = async (env) => {
  return abstractGroupService.getAllGroups(env, DOCKER_GROUP_TYPE);
};

const createGroup = async (env, groupData) => {
  return abstractGroupService.createGroup(env, DOCKER_GROUP_TYPE, groupData);
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
