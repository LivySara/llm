import http from 'node:http'
import { db } from './data-base/config.js'

const PORT = Number(process.env.PORT ?? 8081)
const MAX_BODY = 1024 * 1024 // 1MB：防止被超大 body 打爆内存

/** 统一响应出口 */
function sendJson(res, status, payload) {
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
    })
    res.end(JSON.stringify(payload))
}
const ok = (res, data, status = 200) => {
    return sendJson(res, status, {
        code: 0,
        message: 'success',
        data
    })
}
const fail = (res, status, message) => {
    return sendJson(res, status, {
        code: status,
        message,
        data: null
    })
}

/** 可控的错误类型（预期错误 & bug) */
class HttpError extends Error {
    constructor(status, message) {
        super(message)
        this.status = status
    }
}

/** 边界校验：不信任任何外部输入 */
function requireId(raw) {
    const id = Number(raw)
    if(!Number.isInteger(id) || id <= 0) {
        throw new HttpError(400, `invalid id: ${raw}`)
    }
    return id
}

/** 把"流式读 body"这个异步回调，包成 Promise  */
function readJsonBody(req) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      let size = 0;
      req.on('data', (chunk) => {
        size += chunk.length;
        if (size > MAX_BODY) {
          reject(new HttpError(413, 'request body too large'));
          req.destroy(); // 立刻断开，别再收了
          return;
        }
        chunks.push(chunk);
      });
      req.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8').trim();
        if (!raw) return resolve({}); // 空 body 不视为非法
        try {
          const parsed = JSON.parse(raw);
          if (parsed === null || typeof parsed !== 'object') throw new Error();
          resolve(parsed);
        } catch {
          reject(new HttpError(400, 'body must be a JSON object'));
        }
      });
      req.on('error', reject); // 客户端中途断开
    })
}

/** repository: 唯一知道SQL的地方 */
async function findCityById(id) {
    const [rows] = await db.query('SELECT * FROM city WHERE ID = ?', [id])
    return rows[0] ?? null
}

/* Handler：只负责"拿数据"或"抛 HttpError"，绝不碰 res */
const handlers = {
  listTemplates: () => [
    { id: 1, name: '审批模板' },
    { id: 2, name: '请假模板' },
  ],

  getTemplateDetail: (_req, url) => ({
    id: requireId(url.searchParams.get('id')),
    name: '审批模板',
  }),

  async getCityDetail(_req, url) {
    const city = await findCityById(requireId(url.searchParams.get('id')));
    if (!city) throw new HttpError(404, 'city not found');
    return city;
  },

  async createTemplate(req) {
    const body = await readJsonBody(req);
    if (!body.name) throw new HttpError(400, 'name is required');
    return { id: Date.now(), ...body }; // 真实场景交给 service + repository
  },
};

/* 路由表：数据即配置，新增接口只加一行 */
const routes = [
  { method: 'GET',  path: '/template/list',   handler: handlers.listTemplates },
  { method: 'GET',  path: '/template/detail', handler: handlers.getTemplateDetail },
  { method: 'GET',  path: '/city/detail',     handler: handlers.getCityDetail },
  { method: 'POST', path: '/template/create', handler: handlers.createTemplate },
];

/* 服务器：解析 → 匹配 → 执行 → 统一出口 */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);

  const route = routes.find((r) => r.method === req.method && r.path === url.pathname);
  if (!route) {
    // 区分 404（路径不存在）与 405（路径存在但方法不对）
    const pathExists = routes.some((r) => r.path === url.pathname);
    return fail(res, pathExists ? 405 : 404, pathExists ? 'Method Not Allowed' : 'Not Found');
  }

  try {
    const data = await route.handler(req, url);
    ok(res, data, req.method === 'POST' ? 201 : 200);
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    if (status >= 500) console.error('[unhandled]', err); // 真 bug 才打完整堆栈
    else console.warn('[bad request]', err.message);
    if (!res.headersSent) {
      fail(res, status, status >= 500 ? 'Internal Server Error' : err.message);
    }
  }
})
server.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`))

/* 优雅退出：归还连接池，否则进程不会自然退出 */
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    server.close();
    await db.end();
    process.exit(0);
  });
}