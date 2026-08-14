import OpenAI from 'openai'

export class OpenaiClient {
   static createLlmInst() {
        const openai = new OpenAI({
            baseURL: 'https://api.deepseek.com',
            apiKey: 'sk-e0edc83da23b4d4bb9b028b82775ece2'
        })
        return openai
    }
}