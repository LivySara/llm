// import React, { useState } from 'react';
// import ChatWindow from './components/ChatWindow';
import './App.css';
// import { Input } from 'antd';

import Demo from './views/demo'

function App() {
  // const [msg, setMsg] = useState('信息')
  
  return (
    <div className="app">
        {/* <ChatWindow />
        <div>
          {msg}
          <Input placeholder='请输入信息' value={msg} onChange={(e) => setMsg(e.target.value)} />
        </div> */}
        <Demo />
    </div>
  );
}

export default App;
