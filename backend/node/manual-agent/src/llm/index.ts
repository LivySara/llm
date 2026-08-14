import OpenAI from 'openai'

export class OpenaiClient {
   static createLlmInst() {
        const openai = new OpenAI({
            baseURL: 'https://api.deepseek.com',
            apiKey: 'DEEPSEEK_API_KEY_REMOVED'
        })
        return openai
    }
}