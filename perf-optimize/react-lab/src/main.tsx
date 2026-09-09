import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

// 刻意不启用 StrictMode：StrictMode 在开发环境下会重复执行渲染，
// 会干扰本实验室的「渲染次数 / 渲染耗时」观测数据。
createRoot(document.getElementById('root')!).render(<App />)
