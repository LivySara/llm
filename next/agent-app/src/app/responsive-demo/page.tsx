import { Metadata } from "next";
import NavbarExample from "./components/NavbarExample";
import GridExample from "./components/GridExample";
import FormExample from "./components/FormExample";
import MobileAdaptationExample from "./components/MobileAdaptationExample";
import TypographyExample from "./components/TypographyExample";
import LearningResources from "./components/LearningResources";

/**
 * 页面元数据配置
 * 设置页面标题和描述，有助于 SEO
 */
export const metadata: Metadata = {
  title: "响应式布局学习示例 - AI Agent",
  description: "学习响应式布局和移动端适配的最佳实践",
};

/**
 * 响应式布局学习示例页面
 * 
 * 本页面展示了响应式布局的核心技术和移动端适配方案，包括：
 * 1. 响应式导航栏 - 移动端汉堡菜单，PC端水平菜单
 * 2. 响应式卡片网格 - 不同屏幕尺寸的列数变化
 * 3. 响应式表单 - 移动端垂直布局，PC端水平布局
 * 4. 移动端适配技术 - Viewport、REM、VW、1px边框问题
 * 5. 响应式排版 - 字体大小自适应
 * 
 * 技术要点：
 * - 使用 Tailwind CSS 的响应式类（sm:, md:, lg:, xl:）
 * - 移动优先（Mobile First）开发思路
 * - 相对单位（rem, em, vw, vh）的使用
 * - 媒体查询的实际应用
 */
export default function ResponsiveDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 页面标题区域 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            响应式布局学习示例
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            通过实际案例学习 PC / 手机 / 平板 多端适配技术
          </p>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* 学习指南区块 */}
        <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            📚 学习指南
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* 核心概念卡片 1 */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                响应式布局
              </h3>
              <p className="text-blue-700 text-sm">
                使用媒体查询、流式布局和相对单位，让页面自适应不同屏幕尺寸
              </p>
            </div>

            {/* 核心概念卡片 2 */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                移动端适配
              </h3>
              <p className="text-green-700 text-sm">
                Viewport 配置、REM/VW 单位、1px 边框问题等移动端专属技术
              </p>
            </div>

            {/* 核心概念卡片 3 */}
            <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                Tailwind CSS
              </h3>
              <p className="text-purple-700 text-sm">
                利用 Tailwind 的响应式类快速实现多端适配，提升开发效率
              </p>
            </div>
          </div>

          {/* 学习路径说明 */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              💡 学习路径
            </h3>
            <ol className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                  1
                </span>
                <span>理解响应式布局的核心概念：媒体查询、流式布局、相对单位</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                  2
                </span>
                <span>学习 Tailwind CSS 的响应式类：sm:, md:, lg:, xl:</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                  3
                </span>
                <span>掌握移动端适配技术：Viewport、REM、VW、1px 边框</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                  4
                </span>
                <span>通过实际案例练习，尝试修改代码观察效果</span>
              </li>
            </ol>
          </div>
        </section>

        {/* 示例区块 1: 响应式导航栏 */}
        <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            🧭 示例 1: 响应式导航栏
          </h2>
          <p className="text-gray-600 mb-6">
            展示移动端汉堡菜单和 PC 端水平菜单的切换效果
          </p>
          <NavbarExample />
        </section>

        {/* 示例区块 2: 响应式卡片网格 */}
        <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            🃏 示例 2: 响应式卡片网格
          </h2>
          <p className="text-gray-600 mb-6">
            不同屏幕尺寸下，卡片列数自动调整（1列 → 2列 → 3列 → 4列）
          </p>
          <GridExample />
        </section>

        {/* 示例区块 3: 响应式表单 */}
        <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            📝 示例 3: 响应式表单
          </h2>
          <p className="text-gray-600 mb-6">
            移动端垂直排列，平板/PC 端水平排列的表单布局
          </p>
          <FormExample />
        </section>

        {/* 示例区块 4: 移动端适配技术 */}
        <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            📱 示例 4: 移动端适配技术
          </h2>
          <p className="text-gray-600 mb-6">
            Viewport 配置、REM/VW 单位、1px 边框问题的解决方案
          </p>
          <MobileAdaptationExample />
        </section>

        {/* 示例区块 5: 响应式排版 */}
        <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            🔤 示例 5: 响应式排版
          </h2>
          <p className="text-gray-600 mb-6">
            不同屏幕尺寸下，字体大小和行高的自适应调整
          </p>
          <TypographyExample />
        </section>

        {/* 学习资源区块 */}
        <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            📖 进一步学习资源
          </h2>
          <LearningResources />
        </section>
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-400">
            © 2026 AI Agent - 响应式布局学习示例
          </p>
          <p className="text-center text-gray-500 text-sm mt-2">
            尝试调整浏览器窗口大小，观察页面的响应式变化！
          </p>
        </div>
      </footer>
    </div>
  );
}
