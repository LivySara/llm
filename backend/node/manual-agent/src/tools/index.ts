import type { ChatCompletionTool } from 'openai/resources/chat/completions'

function calculator(args: { expression:string }) {
    return eval(args.expression)
}

// 第一版：给代码执行的工具函数定义一套、让LLM了解有哪些工具定义一套 【导致】不好维护（比如函数名可能会写错误）
export const funTools = {
    calculator
}
export const funcToolSchema: ChatCompletionTool[] = [{
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

// 第二版：工具函数、给LLM定义统一放置
type ToolExecute = (args: any) => unknown | Promise<unknown>
interface toolRegistryType {
    [key: string]: {
        schema: ChatCompletionTool,
        execute: ToolExecute
    }
}
const toolRegistry: toolRegistryType = {
    calculator: {
        schema: {
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
        },
        execute: calculator
    }
}

export function getToolSchemas() {
    return Object.values(toolRegistry).map(tool => tool.schema)
}

export function getTool(name: string) {
    return toolRegistry[name]
}