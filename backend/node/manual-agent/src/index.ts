import { OpenaiClient } from './llm/index.js'
import { createInterface } from 'node:readline'
import { stdin as input, stdout as output } from "node:process";
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions'
import { funTools } from './tools/index.js'

const openaiInst = OpenaiClient.createLlmInst()

const rl = createInterface({
    input,
    output
})

function askQuestion(): Promise<string> {
    return new Promise((resolve) => {
        rl.question("\n你：", (inputVal) => {
            resolve(inputVal)
        })
    })
}

const tools: ChatCompletionTool[] = [{
    type: 'function',
    function: {
        description: '计算器',
        name: 'calculator',
        parameters: {
            type: 'object',
            properties: {
                expression: {
                    type: 'string',
                    description: '数学公式，例如234*23'
                }
            },
            required: ['expression']
        }
    }
}]

async function main() {
    try {
        const messages: ChatCompletionMessageParam[] = []
        while (true) {
            let msg = ''
            // 先拿到用户输入的prompt
            msg = await askQuestion()
            messages.push({
                role: 'user',
                content: msg
            })
            const resCompletion = await openaiInst.chat.completions.create({
                messages,
                tools,
                model: "deepseek-v4-pro"
            })
            const completionMsgs = resCompletion.choices[0]?.message
            const toolCalls = completionMsgs?.tool_calls ?? []
            for (const toolItem of toolCalls) {
                const toolName = toolItem.function.name
                const args = JSON.parse(toolItem.function.arguments)
                const tool = funTools[toolName]
                const result = tool(args.expression)
                messages.push({
                    role: "tool",
                    tool_call_id: toolItem.id,
                    content: result
                })
            }
            console.log('\n模型：', completionMsgs?.content)
        }
    } catch (error) {
        
    }
}

main()