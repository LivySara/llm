import Func from './fun-comcls/fun'
import ApiUseEffectDemo from './inner-hook-api/useEffectDemo'
import Picture1 from './state-manage/demo'

export default function ShowContent() {
    return (
        <>
            <div>函数组件使用</div>
            <Func />
            <div>useEffect-api使用</div>
            <ApiUseEffectDemo />
            <div>状态管理</div>
            <Picture1 />
        </>
    )
}