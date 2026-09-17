const { exec } = require('child_process');

exec('node -v', (error, stdout, stderr) => {
  console.log('Node版本：', stdout);
});