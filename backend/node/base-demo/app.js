import http from 'node:http'
// import { URL } from 'node:url';

// 启动http服务器
// createServer里回调函数，用来定义：收到HTTP请求后要干什么
const server = http.createServer((req, res) => {
    if(req.method === 'GET') {
        if( req.url === '/template/list') {
            const data = {
                code: 0,
                message: 'success',
                data: [
                    {
                        id: 1,
                        name: '审批模板'
                    },
                    {
                        id: 2,
                        name: '请假模板'
                    }
                ]
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data))
            return
        }
        if(req.url === '/template/detail') {
            const url = new URL(req.url, 'http://localhost')
            const id = url.searchParams.get('id')
            const data = {
                code: 0,
                message: 'success',
                data: [
                    {
                        id: Number(id),
                        name: '审批模板'
                    },
                ]
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data))
            return
        }
    }
    if(req.method === 'POST') {
        if( req.url === '/template/create') {
            let body = ''
            req.on('data', (chunk) => {
                body += chunk
            })
            req.on('end', () => {
                const dataBody = JSON.parse(body);
                const data = {
                    code: 0,
                    message: 'success',
                    data: dataBody
                }
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data))
            })
            return
        }
    }
    res.statusCode = 404;
    res.end('Not Found');
});

// 监听
server.listen(8081);


// 真正查询数据库
// 弄清楚需要gateway