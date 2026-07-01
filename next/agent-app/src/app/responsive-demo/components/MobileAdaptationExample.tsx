/**
 * 移动端适配技术示例组件
 * 
 * 功能说明：
 * 本组件展示移动端适配的核心技术，包括：
 * 1. Viewport 配置 - 控制视口行为
 * 2. REM 适配方案 - 基于根字体大小的相对单位
 * 3. VW 适配方案 - 基于视口宽度的相对单位
 * 4. 1px 边框问题 - 高清屏下 1px 边框变粗的解决方案
 * 
 * 技术要点：
 * - Viewport meta 标签的配置方法
 * - REM 和 VW 单位的使用场景
 * - 使用 transform: scale() 解决 1px 边框问题
 * - CSS 自定义属性的使用
 */
export default function MobileAdaptationExample() {
  return (
    <div className="space-y-8">
      {/* ==================== 子区块 1: Viewport 配置 ==================== */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">
          1️⃣ Viewport 配置
        </h3>
        <p className="text-gray-600">
          Viewport meta 标签用于控制页面在移动设备上的显示方式，是移动端适配的第一步。
        </p>

        {/* Viewport 配置示例 */}
        <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-900 text-gray-300 p-6 text-sm font-mono overflow-x-auto">
            {`<!-- 在 HTML 中配置 Viewport -->
<meta
  name="viewport"
  content="
    width=device-width,        // 视口宽度等于设备宽度
    initial-scale=1.0,        // 初始缩放比例
    maximum-scale=1.0,        // 最大缩放比例
    user-scalable=no          // 是否允许用户缩放
  "
/>

// 在 Next.js 13+ 中，可以在 layout.tsx 中配置：
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};`}
          </div>

          <div className="p-6 bg-blue-50">
            <h4 className="font-semibold text-blue-900 mb-2">📖 配置说明</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>width=device-width</strong>: 让页面宽度等于设备宽度</li>
              <li>• <strong>initial-scale=1</strong>: 初始缩放比例为 1（不缩放）</li>
              <li>• <strong>maximum-scale=1</strong>: 防止用户放大（可选）</li>
              <li>• <strong>user-scalable=no</strong>: 禁止用户缩放（可选）</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ==================== 子区块 2: REM 适配方案 ==================== */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">
          2️⃣ REM 适配方案
        </h3>
        <p className="text-gray-600">
          REM 是相对于根元素（html）字体大小的单位。通过动态设置根字体大小，可以实现元素的自适应。
        </p>

        {/* REM 示例 */}
        <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-900 text-gray-300 p-6 text-sm font-mono overflow-x-auto">
            {`/* 方案 1: 手动设置根字体大小 */
/* 以 375px 设计稿为例 */
html {
  font-size: 37.5px; /* 375 / 10 = 37.5 */
}

/* 使用 REM 单位 */
.element {
  width: 10rem;  /* 375px */
  font-size: 0.32rem; /* 12px */
  margin: 0.2rem; /* 7.5px */
}

/* 方案 2: 使用 JavaScript 动态计算 */
/* 在页面加载时执行 */
const setRemUnit = () => {
  const docEl = document.documentElement;
  const viewWidth = docEl.getBoundingClientRect().width;
  docEl.style.fontSize = viewWidth / 10 + 'px';
};

// 初始化
setRemUnit();

// 窗口大小改变时重新计算
window.addEventListener('resize', setRemUnit);`}
          </div>

          <div className="p-6">
            <h4 className="font-semibold text-gray-900 mb-3">📊 REM 计算示例</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className="w-24 text-sm font-medium text-gray-700">设计稿宽度</div>
                <div className="flex-1 bg-gray-100 rounded-lg p-3 font-mono text-sm">
                  375px
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-24 text-sm font-medium text-gray-700">根字体大小</div>
                <div className="flex-1 bg-blue-50 rounded-lg p-3 font-mono text-sm text-blue-700">
                  37.5px (375 / 10)
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-24 text-sm font-medium text-gray-700">1rem =</div>
                <div className="flex-1 bg-green-50 rounded-lg p-3 font-mono text-sm text-green-700">
                  37.5px
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-24 text-sm font-medium text-gray-700">2rem =</div>
                <div className="flex-1 bg-green-50 rounded-lg p-3 font-mono text-sm text-green-700">
                  75px
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 子区块 3: VW 适配方案 ==================== */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">
          3️⃣ VW 适配方案
        </h3>
        <p className="text-gray-600">
          VW（Viewport Width）是相对于视口宽度的单位。1vw = 视口宽度的 1%。无需 JavaScript，纯 CSS 实现。
        </p>

        {/* VW 示例 */}
        <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-900 text-gray-300 p-6 text-sm font-mono overflow-x-auto">
            {`/* VW 单位示例 */
/* 1vw = 视口宽度的 1% */

.container {
  /* 视口宽度的 100% */
  width: 100vw;
}

.sidebar {
  /* 视口宽度的 25% */
  width: 25vw;
}

/* 结合 calc() 使用 */
.element {
  /* 视口宽度的 10% 加上 20px */
  width: calc(10vw + 20px);
}

/* 响应式字体大小 */
.text {
  /* 视口宽度越大，字体越大 */
  font-size: 2vw;
}

/* 常用技巧：使用 VW 实现内边距 */
.padding-box {
  padding: 2vw; /* 内边距随视口宽度变化 */
}`}
          </div>

          <div className="p-6">
            <h4 className="font-semibold text-gray-900 mb-3">📐 VW 单位可视化</h4>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-2">视口宽度 = 375px 时：</div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-20 text-xs text-gray-500">1vw =</div>
                    <div className="h-8 bg-blue-500 rounded" style={{ width: "3.75%" }}>
                      <span className="text-white text-xs px-2 py-1">3.75px</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 text-xs text-gray-500">10vw =</div>
                    <div className="h-8 bg-blue-500 rounded" style={{ width: "37.5%" }}>
                      <span className="text-white text-xs px-2 py-1">37.5px</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 text-xs text-gray-500">100vw =</div>
                    <div className="h-8 bg-blue-500 rounded w-full">
                      <span className="text-white text-xs px-2 py-1">375px (全宽)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 子区块 4: 1px 边框问题 ==================== */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">
          4️⃣ 1px 边框问题
        </h3>
        <p className="text-gray-600">
          在高清屏（Retina）下，CSS 的 1px 边框会显得较粗。这是因为物理像素和逻辑像素的差异导致的。
        </p>

        {/* 1px 边框问题示例 */}
        <div className="border-2 border-gray-200 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-4">🔍 问题对比</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 问题展示 */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-red-600">❌ 问题：普通 1px 边框</h5>
              <div className="border border-gray-400 rounded-lg p-4 h-24 flex items-center justify-center">
                <span className="text-sm text-gray-600">border: 1px solid #000</span>
              </div>
              <p className="text-xs text-red-600">
                在高清屏下会显得较粗（可能是 2px 或 3px）
              </p>
            </div>

            {/* 解决方案展示 */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-green-600">✅ 解决：使用 transform 缩放</h5>
              <div className="relative h-24 flex items-center justify-center">
                {/* 使用伪元素 + transform 实现真正的 1px */}
                <div className="relative w-32 h-16">
                  <div className="absolute inset-0 border border-transparent rounded-lg">
                    <div className="absolute inset-0 border-gray-400 rounded-lg"
                      style={{
                        clipPath: "inset(0 0 0 0)",
                      }}
                    />
                  </div>
                  {/* 实际解决方案示意 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm text-gray-600">transform: scale()</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-green-600">
                使用伪元素 + transform: scale(0.5) 实现真正的 1px
              </p>
            </div>
          </div>

          {/* 解决方案代码 */}
          <div className="mt-6 bg-gray-900 text-gray-300 p-6 text-sm font-mono overflow-x-auto rounded-lg">
            {`/* 解决方案：使用伪元素 + transform */
.border-1px {
  position: relative;
}

.border-1px::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background-color: #000;
  
  /* 在高清屏下缩放 0.5 倍 */
  transform: scaleY(0.5);
  transform-origin: 0 0;
}

/* 更通用的解决方案 */
/* 兼容不同设备像素比的边框 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 2dppx) {
  .border-1px::after {
    transform: scaleY(0.5);
  }
}

@media (-webkit-min-device-pixel-ratio: 3), (min-resolution: 3dppx) {
  .border-1px::after {
    transform: scaleY(0.33);
  }
}`}
          </div>
        </div>
      </div>

      {/* 总结卡片 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 mb-3">📌 移动端适配技术总结</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded-lg p-4">
            <div className="font-medium text-blue-600 mb-2">Viewport</div>
            <div className="text-gray-600">控制视口行为，移动端适配的第一步</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="font-medium text-green-600 mb-2">REM</div>
            <div className="text-gray-600">基于根字体大小，需要 JS 动态计算</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="font-medium text-purple-600 mb-2">VW</div>
            <div className="text-gray-600">基于视口宽度，纯 CSS 实现，更推荐</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="font-medium text-orange-600 mb-2">1px 边框</div>
            <div className="text-gray-600">使用 transform: scale() 解决高清屏问题</div>
          </div>
        </div>
      </div>
    </div>
  );
}
