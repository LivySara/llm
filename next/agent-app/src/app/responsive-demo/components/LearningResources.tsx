/**
 * 学习资源组件
 * 
 * 功能说明：
 * 提供响应式布局和移动端适配的进一步学习资源链接
 * 包括官方文档、最佳实践文章、视频教程等
 * 
 * 技术要点：
 * - 使用卡片式布局展示资源分类
 * - 提供可直接点击的链接
 * - 分类清晰：文档、教程、工具、社区
 */
export default function LearningResources() {
  // 学习资源数据
  const resources = {
    documentation: [
      {
        title: "MDN Web Docs - 响应式设计",
        description: "Mozilla 开发者网络关于响应式设计的官方文档",
        url: "https://developer.mozilla.org/zh-CN/docs/Learn/CSS/CSS_layout/Responsive_Design",
        icon: "📖",
      },
      {
        title: "Tailwind CSS 官方文档 - 响应式设计",
        description: "Tailwind CSS 响应式类的完整指南",
        url: "https://tailwindcss.com/docs/responsive-design",
        icon: "🎨",
      },
      {
        title: "Next.js 官方文档 - 响应式布局",
        description: "Next.js App Router 的布局系统文档",
        url: "https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates",
        icon: "⚡",
      },
    ],
    tutorials: [
      {
        title: "CSS-Tricks - 响应式设计指南",
        description: "经典的响应式设计教程，包含大量实例",
        url: "https://css-tricks.com/guides/responsive-design/",
        icon: "📝",
      },
      {
        title: "FreeCodeCamp - 响应式 Web 设计",
        description: "免费的响应式 Web 设计课程",
        url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/",
        icon: "🎓",
      },
      {
        title: "响应式设计最佳实践",
        description: "CSDN 上的响应式设计最佳实践总结",
        url: "https://blog.csdn.net/qq_39958019/article/details/111344425",
        icon: "💡",
      },
    ],
    tools: [
      {
        title: "Responsive Design Checker",
        description: "在线工具，测试网站在不同设备上的显示效果",
        url: "https://responsivedesignchecker.com/",
        icon: "🔍",
      },
      {
        title: "Chrome DevTools - 设备模式",
        description: "Chrome 浏览器内置的响应式测试工具",
        url: "https://developer.chrome.com/docs/devtools/device-mode/",
        icon: "🛠️",
      },
      {
        title: "Can I Use - CSS 兼容性查询",
        description: "查询 CSS 属性在不同浏览器中的兼容性",
        url: "https://caniuse.com/",
        icon: "✅",
      },
    ],
    community: [
      {
        title: "Stack Overflow - 响应式设计",
        description: "开发者社区中关于响应式设计的问题和解答",
        url: "https://stackoverflow.com/questions/tagged/responsive-design",
        icon: "💬",
      },
      {
        title: "GitHub - 响应式设计优秀项目",
        description: "GitHub 上关于响应式设计的优秀开源项目",
        url: "https://github.com/topics/responsive-design",
        icon: "🐙",
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* 说明文字 */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <p className="text-blue-800 text-sm">
          以下资源可以帮助你深入学习和掌握响应式布局与移动端适配技术。
          建议按照"文档 → 教程 → 实践 → 社区"的顺序学习。
        </p>
      </div>

      {/* 文档资源 */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">📖</span> 官方文档
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.documentation.map((resource, index) => (
            <a
              key={index}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-300 group"
            >
              <div className="text-3xl mb-3">{resource.icon}</div>
              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {resource.title}
              </h4>
              <p className="mt-2 text-sm text-gray-600">
                {resource.description}
              </p>
              <div className="mt-4 text-sm text-blue-500 group-hover:text-blue-700 transition-colors">
                查看文档 →
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* 教程资源 */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">📝</span> 教程文章
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.tutorials.map((resource, index) => (
            <a
              key={index}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-green-300 transition-all duration-300 group"
            >
              <div className="text-3xl mb-3">{resource.icon}</div>
              <h4 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                {resource.title}
              </h4>
              <p className="mt-2 text-sm text-gray-600">
                {resource.description}
              </p>
              <div className="mt-4 text-sm text-green-500 group-hover:text-green-700 transition-colors">
                开始学习 →
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* 工具资源 */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🛠️</span> 开发工具
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.tools.map((resource, index) => (
            <a
              key={index}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-purple-300 transition-all duration-300 group"
            >
              <div className="text-3xl mb-3">{resource.icon}</div>
              <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                {resource.title}
              </h4>
              <p className="mt-2 text-sm text-gray-600">
                {resource.description}
              </p>
              <div className="mt-4 text-sm text-purple-500 group-hover:text-purple-700 transition-colors">
                打开工具 →
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* 社区资源 */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">💬</span> 社区资源
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.community.map((resource, index) => (
            <a
              key={index}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-orange-300 transition-all duration-300 group"
            >
              <div className="text-3xl mb-3">{resource.icon}</div>
              <h4 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                {resource.title}
              </h4>
              <p className="mt-2 text-sm text-gray-600">
                {resource.description}
              </p>
              <div className="mt-4 text-sm text-orange-500 group-hover:text-orange-700 transition-colors">
                加入讨论 →
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* 学习建议 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          💡 学习建议
        </h3>
        <div className="space-y-3 text-gray-700">
          <div className="flex items-start">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-3 mt-0.5">
              1
            </span>
            <p>
              <strong>先学理论：</strong>阅读 MDN 和 Tailwind CSS 官方文档，理解响应式设计的核心概念（媒体查询、流式布局、相对单位）。
            </p>
          </div>
          <div className="flex items-start">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-3 mt-0.5">
              2
            </span>
            <p>
              <strong>动手实践：</strong>修改本页面的代码，观察不同屏幕尺寸下的效果变化。尝试创建自己的响应式页面。
            </p>
          </div>
          <div className="flex items-start">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-3 mt-0.5">
              3
            </span>
            <p>
              <strong>使用工具：</strong>熟练使用 Chrome DevTools 的设备模式，测试页面在不同设备上的显示效果。
            </p>
          </div>
          <div className="flex items-start">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-3 mt-0.5">
              4
            </span>
            <p>
              <strong>参与社区：</strong>在 Stack Overflow 和 GitHub 上学习他人的经验，遇到问题及时寻求帮助。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
