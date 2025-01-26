const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/groups',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  }
};

const req = http.request(options, res => {
  console.log(`状态码: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', chunk => {
    console.log(`响应主体: ${chunk}`);
  });
});

req.on('error', error => {
  console.error(`请求失败: ${error.message}`);
});

const postData = JSON.stringify({
  name: '通过Node创建的分组'
});

req.write(postData);
req.end();