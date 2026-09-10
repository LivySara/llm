import OpenAI from 'openai'

// 密钥只从环境变量读取，禁止硬编码进代码仓库
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com'

export class OpenaiClient {
   static createLlmInst() {
        if (!DEEPSEEK_API_KEY) {
            throw new Error(
                '缺少环境变量 DEEPSEEK_API_KEY：请复制 .env.example 为 .env 并填入自己的密钥'
            )
        }
        const openai = new OpenAI({
            baseURL: DEEPSEEK_BASE_URL,
            apiKey: DEEPSEEK_API_KEY
        })
        return openai
    }
}
