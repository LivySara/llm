/**
 * 响应式表单示例组件
 * 
 * 功能说明：
 * - 手机端（< 768px）：垂直排列，标签在上，输入框全宽
 * - 平板/PC端（≥ 768px）：水平排列，标签和输入框并排
 * 
 * 技术要点：
 * 1. 使用 Tailwind 的响应式类：flex-col md:flex-row
 * 2. 标签宽度：w-full md:w-24 md:text-right
 * 3. 输入框宽度：w-full md:flex-1
 * 4. 间距调整：space-y-4 md:space-y-0 md:space-x-4
 */
export default function FormExample() {
  return (
    <div className="space-y-6">
      {/* 技术说明卡片 */}
      <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
        <h4 className="font-semibold text-purple-900 mb-2">💡 技术要点</h4>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• <code className="bg-purple-100 px-1 rounded">flex-col md:flex-row</code> - 移动端垂直，PC端水平</li>
          <li>• <code className="bg-purple-100 px-1 rounded">w-full md:w-24</code> - 移动端全宽，PC端固定宽度</li>
          <li>• <code className="bg-purple-100 px-1 rounded">md:text-right</code> - PC端标签右对齐</li>
          <li>• <code className="bg-purple-100 px-1 rounded">space-y-4 md:space-x-4 md:space-y-0</code> - 响应式间距</li>
        </ul>
      </div>

      {/* 响应式表单示例 */}
      <div className="border-2 border-gray-200 rounded-xl p-6">
        <form className="space-y-6">
          {/* 姓名字段 */}
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
            <label
              htmlFor="name"
              className="text-sm font-medium text-gray-700 md:w-24 md:text-right md:flex-shrink-0"
            >
              姓名
            </label>
            <input
              type="text"
              id="name"
              placeholder="请输入姓名"
              className="w-full md:flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          {/* 邮箱字段 */}
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 md:w-24 md:text-right md:flex-shrink-0"
            >
              邮箱
            </label>
            <input
              type="email"
              id="email"
              placeholder="example@email.com"
              className="w-full md:flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          {/* 消息字段 */}
          <div className="flex flex-col md:flex-row md:items-start space-y-2 md:space-y-0 md:space-x-4">
            <label
              htmlFor="message"
              className="text-sm font-medium text-gray-700 md:w-24 md:text-right md:flex-shrink-0 md:pt-2"
            >
              消息
            </label>
            <textarea
              id="message"
              rows={4}
              placeholder="请输入您的消息..."
              className="w-full md:flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
            />
          </div>

          {/* 按钮组 */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 md:ml-28">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 transition-colors cursor-pointer"
            >
              提交
            </button>
            <button
              type="reset"
              className="w-full sm:w-auto px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:ring-4 focus:ring-gray-300 transition-colors cursor-pointer"
            >
              重置
            </button>
          </div>
        </form>

        {/* 响应式说明 */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">📝 响应式行为说明</h4>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start">
              <span className="inline-block w-20 flex-shrink-0 font-medium text-purple-600">手机端:</span>
              <span>
                <div>• 标签在上，输入框在下（垂直排列）</div>
                <div>• 输入框全宽显示</div>
              </span>
            </div>
            <div className="flex items-start">
              <span className="inline-block w-20 flex-shrink-0 font-medium text-purple-600">平板/PC:</span>
              <span>
                <div>• 标签和输入框并排（水平排列）</div>
                <div>• 标签固定宽度并右对齐</div>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 代码示例 */}
      <details className="bg-gray-900 rounded-xl overflow-hidden">
        <summary className="px-6 py-4 text-white cursor-pointer hover:bg-gray-800 transition-colors">
          📄 查看代码示例
        </summary>
        <pre className="p-6 text-sm text-gray-300 overflow-x-auto">
{`// 响应式表单布局核心代码
// flex-col: 垂直排列（移动端）
// md:flex-row: 水平排列（PC端）
// md:items-center: PC端垂直居中
// w-full: 移动端全宽
// md:w-24: PC端固定宽度
// md:text-right: PC端文字右对齐

<div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
  <label className="w-full md:w-24 md:text-right md:flex-shrink-0">
    姓名
  </label>
  <input
    type="text"
    className="w-full md:flex-1 px-4 py-2 border rounded-lg"
  />
</div>`}
        </pre>
      </details>
    </div>
  );
}
