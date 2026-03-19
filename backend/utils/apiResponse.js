// backend/utils/apiResponse.js
// Hono 版本：返回 Response 对象（c.json() 已经是 Response，这里提供辅助函数供 controller 调用）

/**
 * 成功响应辅助
 * @param {import('hono').Context} c
 * @param {*} data
 * @param {number} statusCode
 */
const success = (c, data, statusCode = 200) => {
  return c.json({ success: true, data }, statusCode);
};

/**
 * 错误响应辅助
 * @param {import('hono').Context} c
 * @param {string} message
 * @param {number} statusCode
 */
const error = (c, message, statusCode = 500) => {
  return c.json({ success: false, error: message }, statusCode);
};

module.exports = { success, error };
