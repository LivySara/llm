import { OpenaiClient } from './llm/index.js'
import { createInterface } from 'node:readline'
import { stdin as input, stdout as output } from "node:process";
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import { getToolSchemas, getTool } from './tools/index.js'

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

const MAX_STEPS = 20

async function main() {
    try {
        // 有多轮上下文记忆
        const messages: ChatCompletionMessageParam[] = []
        while (true) {
            let msg = ''
            // 先拿到用户输入的prompt
            msg = await askQuestion()
            messages.push({
                role: 'user',
                content: msg
            })
            let step = 0
            let completed = false
            while (step < MAX_STEPS) {
                step++
                const resCompletion = await openaiInst.chat.completions.create({
                    messages,
                    tools: getToolSchemas(),
                    model: "deepseek-v4-pro"
                })

                console.log('\n========== Agent Loop ==========')

                const completionMsgs = resCompletion.choices[0]?.message
                if (!completionMsgs) {
                    throw new Error('LLM 没有返回 message')
                }
                messages.push(completionMsgs)

                console.log('LLM:', completionMsgs.content)
                console.log(
                    'Tool Calls:',
                    completionMsgs.tool_calls?.map(item => item.type === 'function'
                        ? item.function.name
                        : item.type
                    )
                )

                const toolCalls = completionMsgs?.tool_calls ?? []
                // LLM 判断任务完成
                if (!toolCalls.length) {
                    console.log('\n模型：', completionMsgs?.content)
                    completed = true
                    break
                }
                // Runtime 执行 Tool
                for (const toolItem of toolCalls) {
                    if(toolItem.type !== 'function') {
                        continue
                    }
                    let result: unknown
                    try {
                        const args = JSON.parse(toolItem.function.arguments)
                        const tool = getTool(toolItem.function.name)
                        if(!tool) {
                            throw new Error(`Tool 不存在：${toolItem.function.name}`)
                        }
                        // tool.validate(args)
                        result = await tool.execute(args)
                    } catch (error) {
                        result = {
                            success: false,
                            error: error instanceof Error
                                ? error.message
                                : String(error)
                        }
                        console.log(`\ntool回调失败结果：`, result)
                    }
                    messages.push({
                        role: "tool",
                        tool_call_id: toolItem.id,
                        content: JSON.stringify(result)
                    })
                }
            }

            if(!completed) {
                console.log(
                    `\nAgent 达到最大执行步数 ${MAX_STEPS}，任务未完成`
                )
            }
        }
    } catch (error) {
        console.error(error)
    }
}

main()