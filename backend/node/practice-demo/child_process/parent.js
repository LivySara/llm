const { spawn } = require('child_process');

console.log('我是父进程');

const child = spawn('node', ['child.js']);

child.stdout.on('data', (data) => {
  console.log('收到子进程消息：', data.toString());
});

console.log('父进程继续执行');