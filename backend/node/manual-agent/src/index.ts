import 'dotenv/config'
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

const AGENT_ROLE_MSG: ChatCompletionMessageParam = {
    role: "system",
    content: `你是一个通用智能Agent，能够根据用户问题判断是否调用可用工具。遵守下面规则：
1. 仔细理解用户目标，判断是否需要使用工具获取信息；不需要工具就直接回答用户。
2. 允许一次并行调用多个工具。
3. 拿到工具返回结果后，结合结果推理。不要重复调用相同工具获取一模一样的信息。
4. 如果工具返回报错信息，分析失败原因，不要盲目重试。
5. 当已经收集足够信息完成用户目标时，直接输出最终答案，不要再调用任何工具。
6. 不要编造不存在的数据；如果信息不足，如实告知用户。
7. 不要无限循环调用工具，信息足够就停止。`
}

async function main() {
    try {
        // 有多轮上下文记忆
        const messages: ChatCompletionMessageParam[] = [AGENT_ROLE_MSG]
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