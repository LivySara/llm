function calculator(args: { expression:string }) {
    return eval(args.expression)
}

async function getWeather(args: { city: string }) {
    throw new Error('天气服务暂时不可用')
    // return {
    //     city: args.city,
    //     temperature: 28,
    //     weather: '晴',
    // }
}