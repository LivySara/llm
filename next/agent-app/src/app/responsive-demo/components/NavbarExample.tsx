"use client";

import { useState } from "react";

/**
 * 响应式导航栏示例组件
 * 
 * 功能说明：
 * - 移动端（< 768px）：显示汉堡菜单按钮，点击展开/收起菜单
 * - 平板端（≥ 768px）：显示简化水平菜单
 * - PC端（≥ 1024px）：显示完整水平菜单 + 用户信息
 * 
 * 技术要点：
 * 1. 使用 Tailwind 的响应式类：md:hidden, lg:flex 等
 * 2. 移动端优先（Mobile First）开发思路
 * 3. useState 管理菜单展开/收起状态
 * 4. 使用 React 的 "use client" 指令启用客户端交互
 */
export default function NavbarExample() {
  // 控制移动端菜单展开/收起的状态
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* 技术说明卡片 */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <h4 className="font-semibold text-blue-900 mb-2">💡 技术要点</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <code className="bg-blue-100 px-1 rounded">md:hidden</code> - 在中等屏幕隐藏元素</li>
          <li>• <code className="bg-blue-100 px-1 rounded">lg:flex</code> - 在大屏幕显示 flex 布局</li>
          <li>• <code className="bg-blue-100 px-1 rounded">absolute md:relative</code> - 移动端绝对定位，平板端相对定位</li>
        </ul>
      </div>

      {/* 导航栏实际示例 */}
      <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
        {/* 导航栏 */}
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex-shrink-0">
                <span className="text-2xl font-bold text-blue-600">🤖 AI Agent</span>
              </div>

              {/* 桌面端菜单 - 在中等屏幕以上显示 */}
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <a
                    href="#"
                    className="text-gray-700 hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    首页
                  </a>
                  <a
                    href="#"
                    className="text-gray-700 hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    功能
                  </a>
                  <a
                    href="#"
                    className="text-gray-700 hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    关于
                  </a>
                  {/* 仅在大型屏幕显示的额外菜单项 */}
                  <a
                    href="#"
                    className="hidden lg:inline-block text-gray-700 hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    文档
                  </a>
                  <a
                    href="#"
                    className="hidden lg:inline-block text-gray-700 hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    社区
                  </a>
                </div>
              </div>

              {/* 用户信息 - 仅在大型屏幕显示 */}
              <div className="hidden lg:flex items-center space-x-4">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  登录
                </button>
              </div>

              {/* 移动端汉堡菜单按钮 - 在中等屏幕以下显示 */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
                  aria-expanded={isMenuOpen}
                >
                  <span className="sr-only">打开主菜单</span>
                  {/* 汉堡菜单图标 */}
                  <svg
                    className={`${isMenuOpen ? "hidden" : "block"} h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                  {/* 关闭图标 */}
                  <svg
                    className={`${isMenuOpen ? "block" : "hidden"} h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* 移动端下拉菜单 */}
          <div className={`${isMenuOpen ? "block" : "hidden"} md:hidden`}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              <a
                href="#"
                className="text-gray-700 hover:bg-blue-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                首页
              </a>
              <a
                href="#"
                className="text-gray-700 hover:bg-blue-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                功能
              </a>
              <a
                href="#"
                className="text-gray-700 hover:bg-blue-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                关于
              </a>
              <a
                href="#"
                className="text-gray-700 hover:bg-blue-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                文档
              </a>
              <a
                href="#"
                className="text-gray-700 hover:bg-blue-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                社区
              </a>
              <button className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-base font-medium transition-colors">
                登录
              </button>
            </div>
          </div>
        </nav>

        {/* 示例说明区域 */}
        <div className="bg-gray-50 p-6">
          <h4 className="font-semibold text-gray-900 mb-3">📱 响应式行为说明</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-start">
              <span className="inline-block w-20 flex-shrink-0 font-medium text-blue-600">手机端:</span>
              <span>显示汉堡菜单按钮，点击展开下拉菜单</span>
            </div>
            <div className="flex items-start">
              <span className="inline-block w-20 flex-shrink-0 font-medium text-blue-600">平板端:</span>
              <span>显示水平菜单（首页、功能、关于），隐藏"文档"和"社区"</span>
            </div>
            <div className="flex items-start">
              <span className="inline-block w-20 flex-shrink-0 font-medium text-blue-600">PC端:</span>
              <span>显示完整水平菜单 + 登录按钮</span>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              💡 <strong>提示：</strong>尝试调整浏览器窗口大小，观察导航栏的变化！
            </p>
          </div>
        </div>
      </div>

      {/* 代码示例 */}
      <details className="bg-gray-900 rounded-xl overflow-hidden">
        <summary className="px-6 py-4 text-white cursor-pointer hover:bg-gray-800 transition-colors">
          📄 查看代码示例
        </summary>
        <pre className="p-6 text-sm text-gray-300 overflow-x-auto">
{`// 关键 Tailwind 响应式类说明
// hidden md:block - 在小型屏幕隐藏，在中等屏幕显示为块级元素
// md:hidden - 在中等屏幕隐藏
// hidden lg:flex - 在大型屏幕显示为 flex 布局

<nav className="bg-white shadow-md">
  <div className="flex items-center justify-between">
    {/* Logo */}
    <div>🤖 AI Agent</div>
    
    {/* 桌面端菜单 - 中等屏幕以上显示 */}
    <div className="hidden md:block">
      <a>首页</a>
      <a>功能</a>
      <a>关于</a>
    </div>
    
    {/* 移动端汉堡菜单 - 中等屏幕以下显示 */}
    <div className="md:hidden">
      <button onClick={...}>☰</button>
    </div>
  </div>
  
  {/* 移动端下拉菜单 */}
  <div className="md:hidden">
    {/* 菜单项 */}
  </div>
</nav>`}
        </pre>
      </details>
    </div>
  );
}
