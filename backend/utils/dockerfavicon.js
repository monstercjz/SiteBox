const path = require('path');
// const fileHandler = require('../utils/fileHandler');

const fs = require('fs');
const { ICONS_DOCKER_DIR } = require('../config/constants');
/**
 * 递归获取目录中的所有文件路径
 * @param {string} dir - 目录路径
 * @returns {string[]} - 文件路径列表
 */
const getAllFilesInDirectory = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      // 如果是目录，则递归遍历
      results = results.concat(getAllFilesInDirectory(filePath));
    } else {
      // 如果是文件，则添加到结果中
      results.push(filePath);
    }
  });
  
  return results;
};
/**
 * 处理图标逻辑
 * @param {string} name - Docker 项目的名称
 * @param {string} displayName - Docker 项目的显示名称
 * @returns {Promise<string>} - 图标路径
 */
//匹配第一个
// const processFavicon = async (name, displayName,url) => {
//     const iconsDir = ICONS_DOCKER_DIR; // 图标目录
  
//     // 检查目录是否存在
//     if (!fs.existsSync(iconsDir)) {
//       console.log(`图标目录不存在: ${iconsDir}`);
//       return fetchDefaultFavicon(name,url); // 返回默认图标
//     }
  
//     // 获取目录中的所有文件
//     const allFiles = getAllFilesInDirectory(iconsDir);
  
//     // 检查是否有匹配的图标文件
//     const possibleNames = [displayName, name].filter(Boolean); // 使用 displayName 和 name 进行匹配
//     for (const filePath of allFiles) {
//         const fileName = path.basename(filePath).toLowerCase(); // 转换为小写
//         // const fileName = path.basename(filePath); // 获取文件名
//       for (const nameToCheck of possibleNames) {
//         if (fileName.includes(nameToCheck.toLowerCase())) { // 转换为小写后比较
//         // if (fileName.includes(nameToCheck)) {
//             console.log(`Found matching icon: ${filePath}`);
//           return `/data/icons/public/${path.relative(iconsDir, filePath).replace(/\\/g, '/')}`; // 返回第一个匹配的相对路径
//         }
//       }
//     }
  
//     // 如果没有匹配的图标文件，返回默认图标
//     return fetchDefaultFavicon(name,url);
//   };
//排序匹配
const processFavicon = async (name, displayName) => {
    const iconsDir = ICONS_DOCKER_DIR;; // 图标目录
  
    // 检查目录是否存在
    if (!fs.existsSync(iconsDir)) {
      console.log(`图标目录不存在: ${iconsDir}`);
    //   return fetchDefaultFavicon(name); // 返回默认图标
    }
  
    // 获取目录中的所有文件
    const allFiles = getAllFilesInDirectory(iconsDir);
  
    // 收集所有匹配的文件
    const possibleNames = [displayName, name].filter(Boolean); // 使用 displayName 和 name 进行匹配
    const matchedFiles = allFiles.filter(filePath => {
      const fileName = path.basename(filePath);
      return possibleNames.some(nameToCheck => fileName.includes(nameToCheck));
    });
  
    if (matchedFiles.length > 0) {
      // 按文件名排序（例如字母顺序）
      matchedFiles.sort((a, b) => path.basename(a).localeCompare(path.basename(b)));
      return `/data/icons/public/${path.relative(iconsDir, matchedFiles[0]).replace(/\\/g, '/')}`; // 返回第一个匹配的相对路径
    }
  
    // 如果没有匹配的图标文件，返回默认图标
    return `/data/icons/Docker.png.ico`;
  };
/**
 * 获取默认图标
 * @param {string} name - Docker 项目的名称
 * @returns {string} - 默认图标路径
 */
// const fetchDefaultFavicon = async (name) => {
//   try {
//     const faviconUrl = `/data/icons/Docker.png.ico`;
//     return faviconUrl;
//   } catch (error) {
//     console.log(`无法获取 favicon for name ${name}: ${error.message}`);
    
//   }
// };
module.exports = {
    processFavicon,
  };