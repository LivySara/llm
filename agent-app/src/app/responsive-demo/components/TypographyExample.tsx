/**
 * 响应式排版示例组件
 * 
 * 功能说明：
 * 展示不同屏幕尺寸下，字体大小和行高的自适应调整
 * 
 * 技术要点：
 * 1. 使用 Tailwind 的响应式字体类：text-base md:text-lg lg:text-xl
 * 2. 相对单位：rem, em 的使用
 * 3. 行高自适应：leading-relaxed, md:leading-loose
 * 4. 标题层级：h1, h2, h3 的响应式大小
 */
export default function TypographyExample() {
  return (
    <div className="space-y-6">
      {/* 技术说明卡片 */}
      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
        <h4 className="font-semibold text-orange-900 mb-2">💡 技术要点</h4>
        <ul className="text-sm text-orange-800 space-y-1">
          <li>• <code className="bg-orange-100 px-1 rounded">text-base md:text-lg lg:text-xl</code> - 响应式字体大小</li>
          <li>• <code className="bg-orange-100 px-1 rounded">leading-relaxed md:leading-loose</code> - 响应式行高</li>
          <li>• <code className="bg-orange-100 px-1 rounded">rem</code> - 相对于根字体大小的单位</li>
          <li>• <code className="bg-orange-100 px-1 rounded">em</code> - 相对于父元素字体大小的单位</li>
        </ul>
      </div>

      {/* 响应式排版示例 */}
      <div className="border-2 border-gray-200 rounded-xl p-6 space-y-8">
        {/* 标题层级示例 */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            📝 标题层级响应式示例
          </h4>
          
          <div className="space-y-4">
            {/* H1 - 页面主标题 */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                页面主标题 (H1)
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                text-3xl (手机) → text-4xl (平板) → text-5xl (PC)
              </p>
            </div>

            {/* H2 - 区块标题 */}
            <div className="border-l-4 border-green-500 pl-4">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                区块标题 (H2)
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                text-2xl (手机) → text-3xl (平板) → text-4xl (PC)
              </p>
            </div>

            {/* H3 - 子标题 */}
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900">
                子标题 (H3)
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                text-xl (手机) → text-2xl (平板) → text-3xl (PC)
              </p>
            </div>
          </div>
        </div>

        {/* 正文排版示例 */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            📄 正文排版示例
          </h4>
          
          <div className="space-y-4">
            {/* 大段落 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-base md:text-lg lg:text-xl leading-relaxed md:leading-loose text-gray-700">
                这是一段响应式正文文本。在手机端使用 <code className="bg-yellow-100 px-1 rounded">text-base</code> (16px)，
                在平板端使用 <code className="bg-yellow-100 px-1 rounded">text-lg</code> (18px)，
                在 PC 端使用 <code className="bg-yellow-100 px-1 rounded">text-xl</code> (20px)。
                同时，行高也会从 <code className="bg-yellow-100 px-1 rounded">leading-relaxed</code> (1.625)
                变为 <code className="bg-yellow-100 px-1 rounded">leading-loose</code> (2)。
              </p>
            </div>

            {/* 小字说明 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm md:text-base text-gray-600">
                这是辅助说明文本。在手机端使用 <code className="bg-yellow-100 px-1 rounded">text-sm</code> (14px)，
                在平板/PC 端使用 <code className="bg-yellow-100 px-1 rounded">text-base</code> (16px)。
              </p>
            </div>
          </div>
        </div>

        {/* REM 和 EM 单位示例 */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            📏 REM vs EM 单位对比
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* REM 单位示例 */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h5 className="font-semibold text-blue-900 mb-2">REM 单位</h5>
              <p className="text-sm text-blue-800 mb-3">
                REM 相对于根元素（html）的字体大小。<br />
                如果根字体大小是 16px，那么 1rem = 16px。
              </p>
              <div className="bg-white rounded p-3 font-mono text-sm">
                <div>html {"{ font-size: 16px; }"}</div>
                <div className="text-blue-600">.element {"{ font-size: 1rem; }"}</div>
                <div className="text-green-600">// 计算结果: 16px</div>
              </div>
            </div>

            {/* EM 单位示例 */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h5 className="font-semibold text-green-900 mb-2">EM 单位</h5>
              <p className="text-sm text-green-800 mb-3">
                EM 相对于父元素的字体大小。<br />
                如果父元素字体大小是 16px，那么 1em = 16px。
              </p>
              <div className="bg-white rounded p-3 font-mono text-sm">
                <div>parent {"{ font-size: 16px; }"}</div>
                <div className="text-green-600">.child {"{ font-size: 1em; }"}</div>
                <div className="text-blue-600">// 计算结果: 16px</div>
              </div>
            </div>
          </div>

          {/* 实际效果对比 */}
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              💡 <strong>提示：</strong>REM 更适合设置整体布局的尺寸，EM 更适合设置相对于文本的间距（如 padding、margin）。
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
{`// 响应式排版核心代码

// 1. 标题响应式大小
<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
  页面主标题
</h1>

// 2. 正文响应式大小
<p className="text-base md:text-lg leading-relaxed md:leading-loose">
  正文内容...
</p>

// 3. 使用 REM 单位（在 CSS 中）
.element {
  /* 相对于根字体大小 */
  font-size: 1rem;    /* 16px (如果根字体大小是 16px) */
  margin-bottom: 1.5rem; /* 24px */
  padding: 0.5rem;    /* 8px */
}

// 4. 使用 EM 单位（在 CSS 中）
.text {
  /* 相对于当前元素字体大小 */
  font-size: 1em;     /* 继承父元素字体大小 */
  padding: 0.5em;     /* 相对于当前字体大小 */
}`}
        </pre>
      </details>
    </div>
  );
}
