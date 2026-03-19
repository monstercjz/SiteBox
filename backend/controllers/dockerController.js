// backend/controllers/dockerController.js
const dockerService = require('../services/dockerService');
const syncService = require('../services/syncService');
const apiResponse = require('../utils/apiResponse');

const getAlldockers = async (c) => {
  try {
    const env = c.env;
    const dockers = await dockerService.getAlldockers(env);
    return apiResponse.success(c, dockers);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const getdockersByGroupId = async (c) => {
  try {
    const env = c.env;
    const { groupId } = c.req.param();
    const dockers = await dockerService.getdockersByGroupId(env, groupId);
    return apiResponse.success(c, dockers);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const createDocker = async (c) => {
  try {
    const env = c.env;
    const params = c.req.param();
    const body = await c.req.json();
    const groupId = params.groupId || body.groupId;
    const docker = await dockerService.createDocker(env, groupId, body.dockerData || body);
    await syncService.backupData(env);
    return apiResponse.success(c, docker, 201);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const getdockerById = async (c) => {
  try {
    const env = c.env;
    const { dockerId } = c.req.param();
    const docker = await dockerService.getdockerById(env, dockerId);
    if (!docker) return apiResponse.error(c, 'Docker record not found', 404);
    return apiResponse.success(c, docker);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const updateDocker = async (c) => {
  try {
    const env = c.env;
    const { dockerId } = c.req.param();
    const body = await c.req.json();
    const docker = await dockerService.updateDocker(env, dockerId, body.dockerData || body);
    await syncService.backupData(env);
    return apiResponse.success(c, docker);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const deleteDocker = async (c) => {
  try {
    const env = c.env;
    const { dockerId } = c.req.param();
    const result = await dockerService.deleteDocker(env, dockerId);
    await syncService.backupData(env);
    return apiResponse.success(c, result);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const getAllServerRealdockerinfo = async (c) => {
  try {
    const env = c.env;
    const info = await dockerService.getAllServerRealdockerinfo(env);
    return apiResponse.success(c, info);
  } catch (err) {
    return apiResponse.error(c, err.message, 503);
  }
};

const getRecordRealdockerinfo = async (c) => {
  try {
    const env = c.env;
    const info = await dockerService.getRecordRealdockerinfo(env);
    return apiResponse.success(c, info);
  } catch (err) {
    return apiResponse.error(c, err.message, 503);
  }
};

const getRealdockerinfobyId = async (c) => {
  try {
    const env = c.env;
    const params = c.req.param();
    const dockerItemId = params.dockerItemId || params.dockerId;
    const info = await dockerService.getRealdockerinfobyId(env, dockerItemId);
    return apiResponse.success(c, info);
  } catch (err) {
    return apiResponse.error(c, err.message, 503);
  }
};

const startDocker = async (c) => {
  try {
    const env = c.env;
    const params = c.req.param();
    const dockerItemId = params.dockerItemId || params.dockerId;
    const result = await dockerService.startDocker(env, dockerItemId);
    return apiResponse.success(c, result);
  } catch (err) {
    return apiResponse.error(c, err.message, 503);
  }
};

const stopDocker = async (c) => {
  try {
    const env = c.env;
    const params = c.req.param();
    const dockerItemId = params.dockerItemId || params.dockerId;
    const result = await dockerService.stopDocker(env, dockerItemId);
    return apiResponse.success(c, result);
  } catch (err) {
    return apiResponse.error(c, err.message, 503);
  }
};

const restartDocker = async (c) => {
  try {
    const env = c.env;
    const params = c.req.param();
    const dockerItemId = params.dockerItemId || params.dockerId;
    const result = await dockerService.restartDocker(env, dockerItemId);
    return apiResponse.success(c, result);
  } catch (err) {
    return apiResponse.error(c, err.message, 503);
  }
};

module.exports = {
  getAlldockers,
  getdockersByGroupId,
  createDocker,
  getdockerById,
  updateDocker,
  deleteDocker,
  getAllServerRealdockerinfo,
  getRecordRealdockerinfo,
  getRealdockerinfobyId,
  startDocker,
  stopDocker,
  restartDocker,
};
