// backend/services/userService.js
const { execSQL, queryOne, queryAll } = require('../utils/fileHandler');

/**
 * 读取单个设置项
 */
const getSetting = async (env, key) => {
  const row = await queryOne(env, 'SELECT value FROM user_settings WHERE key = ?', [key]);
  return row ? row.value : null;
};

/**
 * 写入单个设置项（upsert）
 */
const setSetting = async (env, key, value) => {
  await execSQL(
    env,
    'INSERT INTO user_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [key, typeof value === 'string' ? value : JSON.stringify(value)]
  );
};

/**
 * 获取所有用户设置（返回 key-value 对象）
 */
const getSettings = async (env) => {
  try {
    const rows = await queryAll(env, 'SELECT key, value FROM user_settings');
    const settings = {};
    for (const row of rows) {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch {
        settings[row.key] = row.value;
      }
    }
    return settings;
  } catch (error) {
    console.error('Failed to get settings:', error);
    return {};
  }
};

/**
 * 批量更新用户设置
 */
const updateSettings = async (env, settingsData) => {
  for (const [key, value] of Object.entries(settingsData)) {
    await setSetting(env, key, value);
  }
  return getSettings(env);
};

module.exports = {
  getSetting,
  setSetting,
  getSettings,
  updateSettings,
};
