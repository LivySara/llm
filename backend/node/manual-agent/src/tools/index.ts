import type { ChatCompletionTool } from 'openai/resources/chat/completions'

function calculator(args: { expression:string }) {
    return eval(args.expression)
}

async function getWeather(args: { city: string }) {
    // throw new Error('天气服务暂时不可用')
    return {
        city: args.city,
        temperature: 28,
        weather: '晴',
    }
}

// 第一版：给代码执行的工具函数定义一套、让LLM了解有哪些工具定义一套 【导致】不好维护（比如函数名可能会写错误）
export const funTools = {
    calculator,
    getWeather
}
export const funcToolSchema: ChatCompletionTool[] = [
{
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
{
    type: 'function',
    function: {
        name: 'getWeather',
        description: '查询指定城市的天气',
        parameters: {
            type: 'object',
            properties: {
                city: {
                    type: 'string',
                    description: '城市名称，例如北京'
                }
            },
            required: ['city']
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
// 缺点：这个每次都得人工写，不好维护，易写错
const toolRegistry2: toolRegistryType = {
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
    },
    getWeather: {
        schema: {
            type: 'function',
            function: {
                name: 'getWeather',
                description: '查询指定城市的天气',
                parameters: {
                    type: 'object',
                    properties: {
                        city: {
                            type: 'string',
                            description: '城市名称，例如北京'
                        }
                    },
                    required: ['city']
                }
            }
        },
        execute: getWeather
    }
}

// 第三版：读取每个tool的元信息，代码生成toolRegistry
const tools = [
    {
        name: 'calculator',
        description: '计算数学表达式',
        parameters: {
            type: 'object',
            properties: {
                expression: {
                    type: 'string',
                    description: '数学公式，例如 234*23'
                }
            },
            required: ['expression']
        },
        // json schema 可以针对性校验
        // validate(args: any) {
        //     let errMsg = ''
        //     if(typeof args.expression === 'undefined') {
        //         errMsg = 'expression 参数必填'
        //     }
        //     if(typeof args.expression !== 'string') {
        //         errMsg = 'expression 参数数据类型是 字符串'
        //     }
        //     if(errMsg) {
        //         throw new Error(errMsg)
        //     }
        // },
        execute: calculator
    },
    {
        name: 'getWeather',
        description: '查询指定城市的天气',
        parameters: {
            type: 'object',
            properties: {
                city: {
                    type: 'string',
                    description: '城市名称，例如北京'
                }
            },
            required: ['city']
        },
        // json schema 可以针对性校验
        // validate(args: any) {
        //     let errMsg = ''
        //     if(typeof args.city === 'undefined') {
        //         errMsg = 'city 参数必填'
        //     } else if(typeof args.city === 'string') {
        //         errMsg = 'city 参数数据类型是 数字'
        //     }
        //     if(errMsg) {
        //         throw new Error(errMsg)
        //     }
        // },
        execute: getWeather
    }
]
const toolRegistry = Object.fromEntries(
    tools.map(tool => [
        tool.name,
        {
            schema: {
                type: 'function',
                function: {
                    name: tool.name,
                    description: tool.description,
                    parameters: tool.parameters
                }
            },
            // validate: tool.validate,
            execute: tool.execute
        }
    ])
)

export function getToolSchemas() {
    return Object.values(toolRegistry).map(tool => tool.schema)
}

export function getTool(name: string) {
    return toolRegistry[name]
}