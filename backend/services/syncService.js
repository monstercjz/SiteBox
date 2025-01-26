// backend/services/syncService.js
const fileHandler = require('../utils/fileHandler');
const { v4: uuidv4 } = require('uuid');

const { WEBSITE_DATA_FILE_PATH } = require('../config/constants');
const { HISTORY_DATA_FILE_PATH } = require('../config/constants');
const ARCHIVE_SUCCESS_MESSAGE = 'Websites info archived successfully';

/**
 * @description 导出数据
 */
const exportData = async () => {
  const data = await fileHandler.readData(WEBSITE_DATA_FILE_PATH);
  console.log('Websites info exported successfully',data);
  return {
    groups: data.groups,
    websites: data.websites,
    nextGroupId: data.nextGroupId,
    nextWebsiteId: data.nextWebsiteId,
  };
};

/**
 *  @description 导入数据
 */
const importData = async (importData) => {
    await backupData();
    await fileHandler.writeData(WEBSITE_DATA_FILE_PATH, importData);
};

/**
 * @description 恢复到指定版本
 */
const restoreData = async (versionId) => {
    const historyData = await fileHandler.readData(historyFilePath);
    const version = (historyData.versions || []).find(version => version.versionId === versionId);
    if (!version) {
        throw new Error('Version not found');
    }
    await fileHandler.writeData(WEBSITE_DATA_FILE_PATH, version.data);
};

/**
 * @description 记录网站信息
 * @description 记录网站信息
 */
const moveToTrash = async (websiteIds) => {
    try {
        // 读取网站数据
        const data = await fileHandler.readData(WEBSITE_DATA_FILE_PATH);
        if (!data || !data.websites) {
            throw new Error('Invalid website data');
        }
        
        // 读取历史数据
        const historyData = await fileHandler.readData(HISTORY_DATA_FILE_PATH);
        const existingWebsiteInfos = historyData?.websiteInfos || [];

        // 如果 websiteIds 不是数组，则转换为数组
        const idsArray = Array.isArray(websiteIds) ? websiteIds : [websiteIds];
        const websitesToDelete = new Set(idsArray);
        const websiteInfos = [];

        // 获取所有网站
        const websites = data.websites;

        // 循环处理每个网站 ID
        for (const websiteId of idsArray) {
            const website = websites.find(item => item.id === websiteId);
            // 如果网站不存在，则输出错误信息并跳过
            if (!website) {
                console.error(`Website with id ${websiteId} not found`);
                continue;
            }
            // 提取网站信息
            const websiteInfo = `${website.name}+${website.url}+${website.description}`;
            websiteInfos.push(websiteInfo);
        }

        // 将网站信息添加到历史数据
        historyData.websiteInfos = [...existingWebsiteInfos, ...websiteInfos];

        // 从网站数据中删除已归档的网站
        data.websites = websites.filter(website => !websitesToDelete.has(website.id));

        // 写入历史数据
        await fileHandler.writeData(HISTORY_DATA_FILE_PATH, historyData);

        // 写入网站数据
        await fileHandler.writeData(WEBSITE_DATA_FILE_PATH, data);

        return { message: ARCHIVE_SUCCESS_MESSAGE };
    } catch (error) {
        console.error('Error archiving websites:', error);
        throw error; // 重新抛出异常以便调用者处理
    }
};

const path = require('path');
const fs = require('fs').promises;

const BACKUP_DIR = path.join(__dirname, '../data/backups'); // 备份文件存放目录
const MAX_BACKUP_VERSIONS = 5; // 最大备份版本数

/**
 * @description 备份 sites-data.json 文件
 */
const backupData = async () => {
  try {
    const data = await fileHandler.readData(WEBSITE_DATA_FILE_PATH);
    // Get current time in China timezone (UTC+8)
    const now = new Date();
    const chinaTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const timestamp = chinaTime.toISOString().replace(/:/g, '-').replace('T', '_');
    const backupFilename = path.join(BACKUP_DIR, `sites-data-backup-${timestamp}.json`);

    // 确保备份目录存在
    await fs.mkdir(BACKUP_DIR, { recursive: true });

    await fileHandler.writeData(backupFilename, data);

    // 清理旧备份文件，只保留最新 MAX_BACKUP_VERSIONS 个
    await cleanupOldBackups();

    console.log('sites-data.json backed up successfully');
  } catch (error) {
    console.error('Error backing up sites-data.json:', error);
    throw error;
  }
};

/**
 * @description 清理旧备份文件，只保留最新的 MAX_BACKUP_VERSIONS 个
 */
const cleanupOldBackups = async () => {
  try {
    const files = await fs.readdir(BACKUP_DIR);
    const backupFilesWithStats = await Promise.all(
      files
        .filter(file => file.startsWith('sites-data-backup-') && file.endsWith('.json'))
        .map(async file => {
          const filePath = path.join(BACKUP_DIR, file);
          const stats = await fs.stat(filePath);
          return { 
            name: file,
            path: filePath,
            time: stats.mtime.getTime()
          };
        })
    );

    const now = Date.now();
    const FIVE_MINUTES = 5 * 60 * 1000;
    
    // Keep all backups from last 5 minutes
    const recentBackups = backupFilesWithStats.filter(f => now - f.time < FIVE_MINUTES);
    
    // For older backups, keep only latest 5
    const oldBackups = backupFilesWithStats
      .filter(f => now - f.time >= FIVE_MINUTES)
      .sort((a, b) => b.time - a.time) // Sort newest first
      .slice(MAX_BACKUP_VERSIONS); // Keep only latest 5

    // Files to delete are old backups beyond the limit
    const filesToDelete = oldBackups;

    for (const file of filesToDelete) {
      await fs.unlink(file.path);
      console.log(`Deleted old backup file: ${file.name}`);
    }
  } catch (error) {
    console.error('Error cleaning up old backups:', error);
  }
};

module.exports = {
  exportData,
  importData,
  restoreData,
  moveToTrash,
  backupData
};
