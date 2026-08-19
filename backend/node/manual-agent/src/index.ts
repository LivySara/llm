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
type ToolName = keyof typeof funTools

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
            while (true) {
                const resCompletion = await openaiInst.chat.completions.create({
                    messages,
                    tools,
                    model: "deepseek-v4-pro"
                })
                const completionMsgs = resCompletion.choices[0]?.message
                if (!completionMsgs) {
                    throw new Error('LLM 没有返回 message')
                }
                messages.push(completionMsgs)
                const toolCalls = completionMsgs?.tool_calls ?? []
                console.log('toolCalls：', toolCalls)
                if (!toolCalls.length) {
                    console.log('\n模型：', completionMsgs?.content)
                    break
                }
                for (const toolItem of toolCalls) {
                    if(toolItem.type !== 'function') {
                        continue
                    }
                    const toolName = toolItem.function.name as ToolName
                    const args = JSON.parse(toolItem.function.arguments)
                    const tool = funTools[toolName]
                    const result = tool(args.expression)
                    messages.push({
                        role: "tool",
                        tool_call_id: toolItem.id,
                        content: String(result)
                    })
                }
            }
        }
    } catch (error) {
        
    }
}

main()