import { useState } from "react"

export default function DemoFuncCom() {
    const [value, setValue] = useState(0)
    const handleChange = (e) => {
        setValue(e.target.value)
    }
    return (
        <>
        <div>{value}</div>
        <input type="text" value={value} onChange={handleChange} />
        </>
    )
}