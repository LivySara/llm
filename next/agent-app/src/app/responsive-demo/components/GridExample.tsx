/**
 * 响应式卡片网格示例组件
 * 
 * 功能说明：
 * - 手机端（< 640px）：1列布局
 * - 平板端（≥ 640px）：2列布局
 * - 小型PC（≥ 1024px）：3列布局
 * - 大型PC（≥ 1280px）：4列布局
 * 
 * 技术要点：
 * 1. 使用 Tailwind 的 Grid 布局：grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
 * 2. Gap 设置：gap-4 md:gap-6 实现响应式间距
 * 3. 卡片悬停效果：transform hover:scale-105 transition-all
 * 4. 移动优先：默认样式针对最小屏幕，逐步增强
 */
export default function GridExample() {
  // 示例卡片数据
  const cards = [
    {
      id: 1,
      title: "响应式布局",
      description: "使用媒体查询和流式布局，让页面自适应不同屏幕尺寸",
      icon: "📱",
      color: "blue",
    },
    {
      id: 2,
      title: "Tailwind CSS",
      description: "利用 Tailwind 的响应式类快速实现多端适配",
      icon: "🎨",
      color: "purple",
    },
    {
      id: 3,
      title: "移动端适配",
      description: "Viewport 配置、REM/VW 单位、1px 边框问题解决",
      icon: "🎯",
      color: "green",
    },
    {
      id: 4,
      title: "Flexbox 布局",
      description: "弹性盒子布局，轻松实现元素的对齐和分布",
      icon: "📦",
      color: "orange",
    },
    {
      id: 5,
      title: "Grid 布局",
      description: "二维网格布局系统，创建复杂的响应式布局",
      icon: "🔲",
      color: "pink",
    },
    {
      id: 6,
      title: "媒体查询",
      description: "CSS 媒体查询，针对不同设备和屏幕尺寸应用不同样式",
      icon: "📺",
      color: "indigo",
    },
    {
      id: 7,
      title: "相对单位",
      description: "使用 rem、em、vw、vh 等相对单位实现弹性布局",
      icon: "📏",
      color: "teal",
    },
    {
      id: 8,
      title: "断点系统",
      description: "定义不同屏幕尺寸的分界点，应用不同的样式规则",
      icon: "✂️",
      color: "red",
    },
  ];

  // 颜色映射
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    green: "bg-green-50 border-green-200 text-green-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    pink: "bg-pink-50 border-pink-200 text-pink-700",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
    teal: "bg-teal-50 border-teal-200 text-teal-700",
    red: "bg-red-50 border-red-200 text-red-700",
  };

  return (
    <div className="space-y-6">
      {/* 技术说明卡片 */}
      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
        <h4 className="font-semibold text-green-900 mb-2">💡 技术要点</h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• <code className="bg-green-100 px-1 rounded">grid-cols-1</code> - 默认 1 列（手机端）</li>
          <li>• <code className="bg-green-100 px-1 rounded">sm:grid-cols-2</code> - ≥ 640px 时 2 列</li>
          <li>• <code className="bg-green-100 px-1 rounded">lg:grid-cols-3</code> - ≥ 1024px 时 3 列</li>
          <li>• <code className="bg-green-100 px-1 rounded">xl:grid-cols-4</code> - ≥ 1280px 时 4 列</li>
        </ul>
      </div>

      {/* 响应式网格布局 */}
      <div className="border-2 border-gray-200 rounded-xl p-6">
        {/* 网格容器 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`
                ${colorClasses[card.color]}
                border rounded-xl p-6
                hover:shadow-lg hover:-translate-y-1
                transition-all duration-300
                cursor-pointer
              `}
            >
              {/* 图标 */}
              <div className="text-4xl mb-4">{card.icon}</div>
              
              {/* 标题 */}
              <h3 className="text-lg font-bold mb-2">{card.title}</h3>
              
              {/* 描述 */}
              <p className="text-sm opacity-80">{card.description}</p>
              
              {/* 悬停提示 */}
              <div className="mt-4 text-xs opacity-0 hover:opacity-100 transition-opacity">
                👆 点击查看详情 →
              </div>
            </div>
          ))}
        </div>

        {/* 响应式说明 */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">📊 响应式列数说明</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center">
              <span className="inline-block w-24 font-mono text-xs bg-gray-200 px-2 py-1 rounded">
                &lt; 640px
              </span>
              <span className="ml-3">📱 手机端：1 列布局</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-24 font-mono text-xs bg-blue-200 px-2 py-1 rounded">
                ≥ 640px
              </span>
              <span className="ml-3">📱 平板端：2 列布局</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-24 font-mono text-xs bg-green-200 px-2 py-1 rounded">
                ≥ 1024px
              </span>
              <span className="ml-3">💻 小型PC：3 列布局</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-24 font-mono text-xs bg-purple-200 px-2 py-1 rounded">
                ≥ 1280px
              </span>
              <span className="ml-3">🖥️ 大型PC：4 列布局</span>
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
{`// 响应式网格布局核心代码
// grid-cols-1: 默认 1 列（移动端优先）
// sm:grid-cols-2: 平板端 2 列
// lg:grid-cols-3: 小型PC 3 列
// xl:grid-cols-4: 大型PC 4 列
// gap-4: 间距 1rem
// md:gap-6: 平板以上间距 1.5rem

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
  {cards.map(card => (
    <div className="border rounded-xl p-6 hover:shadow-lg transition">
      <div className="text-4xl">{card.icon}</div>
      <h3>{card.title}</h3>
      <p>{card.description}</p>
    </div>
  ))}
</div>`}
        </pre>
      </details>
    </div>
  );
}
