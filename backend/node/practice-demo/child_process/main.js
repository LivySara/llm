const { Worker } = require('worker_threads');

console.log('主线程开始');

const worker = new Worker('./worker.js');

worker.on('message', (result) => {
  console.log('计算结果：', result);
});

console.log('主线程继续干自己的事情');