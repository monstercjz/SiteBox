// backend/server.js
const app = require('./app');
const constants = require('./config/constants');
const port = constants.PORT;
const { FILE_DATA ,ICONS_DIR } = require('./config/constants');
const { checkAndInitDataFiles } = require('./utils/fileHandler');
const fs = require('fs');
const path = require('path');

app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  await checkAndInitDataFiles(FILE_DATA);

  // 创建 icons 目录，如果不存在
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
    console.log(`Created icons directory at ${ICONS_DIR}`);
  }
});