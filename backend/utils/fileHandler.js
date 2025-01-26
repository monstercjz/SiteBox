// backend/utils/fileHandler.js
const fs = require('fs').promises;

const readData = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { groups: [], websites: [] };
    }
    throw error;
  }
};

const writeData = async (filePath, data) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    throw error;
  }
};


const checkAndInitDataFiles = async (fileData) => {
  
  for (const filePath of Object.keys(fileData)) {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      if (data.trim() === '') {
        await fs.writeFile(filePath, JSON.stringify(fileData[filePath], null, 2));
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fs.writeFile(filePath, JSON.stringify(fileData[filePath], null, 2));
      } else {
        throw error;
      }
    }
  }
};
module.exports = {
  readData,
  writeData,
  checkAndInitDataFiles
};