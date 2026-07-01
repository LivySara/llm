import { useEffect, useState } from "react";

export default function ApiUseEffectDemo() {
    const [counter, setCounter] = useState(0)
    useEffect(() => {
        console.log('effect')
    })
    return (
        <>
            <div>{counter}</div>
            <button onClick={() => setCounter(counter+1)}>+</button>
        </>
    )
}