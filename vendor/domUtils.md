# domUtils.js 文档

`domUtils.js` 是一个强大的 JavaScript 库，旨在简化复杂的 DOM 操作、元素可见性检查和交互性判断。它借鉴了 Playwright 的内部实现，提供了许多高级功能，可用于分析和操作网页。

## 核心功能

以下是 `domUtils.js` 提供的一些核心类和函数：

### `Rect` 类

用于处理元素几何矩形的实用工具。

- `Rect.create(x1, y1, x2, y2)`: 创建一个矩形对象。
- `Rect.translate(rect, x, y)`: 平移一个矩形。
- `Rect.intersects(rect1, rect2)`: 判断两个矩形是否相交。

### `DomUtils` 类

一组用于 DOM 操作的静态方法。

- `DomUtils.getVisibleClientRect(element, testChildren)`: 获取元素的可见客户端矩形。它比原生的 `getBoundingClientRect` 更可靠，因为它会考虑元素的可见性、子元素等多种因素。
- `DomUtils.clearVisibleClientRectCache()`: 清除 `getVisibleClientRect` 的缓存。

### 可见性与交互性检查

- `isElementVisible(element)`: 检查元素是否对用户可见。这不仅仅是检查 `display: none`，还会考虑元素的尺寸、透明度、位置以及父元素的可见性。

- `isInteractable(element, hoverStylesMap)`: 判断元素是否可交互（例如，可点击或可输入）。它会考虑元素的可见性、是否被禁用、`pointer-events` 样式以及是否有点击事件监听器等。`hoverStylesMap` 是一个通过 `getHoverStylesMap()` 生成的、包含 `:hover` 样式的映射。

### DOM 树构建

- `buildTreeFromBody(frame, frame_index)`: 从 `document.body` 开始，构建一个简化的、只包含可见和可交互元素的树形结构。这对于创建页面的简洁表示非常有用。

### 滚动控制

- `scrollToNextPage(draw_boxes, ...)`: 向下滚动一个视口的高度。
- `safeScrollToTop(draw_boxes, ...)`: 安全地滚动到页面顶部。
- `isWindowScrollable()`: 检查窗口是否可以滚动。

### 调试与可视化

- `drawBoundingBoxes(elements)`: 在页面上为指定的元素绘制边界框，这对于调试和可视化非常有用。
- `buildElementsAndDrawBoundingBoxes(...)`: 构建元素树并立即绘制边界框。
- `removeBoundingBoxes()`: 移除所有绘制的边界框。

## 如何使用

### 与 Playwright 结合使用

您可以轻松地将 `domUtils.js` 注入到由 Playwright 控制的页面中，然后在页面上下文中执行其函数。

1.  **读取库文件**:
    在您的测试脚本中，首先使用 `fs` 模块读取 `domUtils.js` 的内容。

2.  **注入脚本**:
    使用 `page.evaluate()` 或 `page.addScriptTag()` 将脚本注入到页面中。

**示例：**

下面的示例演示了如何在 Playwright 测试中检查元素的可见性。

```typescript
// tests/your-test.spec.ts
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// 1. 读取 domUtils.js 的内容
const domUtilsContent = fs.readFileSync(path.resolve(__dirname, '../vendor/domUtils.js'), 'utf-8');

test('should use domUtils in Playwright', async ({ page }) => {
  await page.goto('https://example.com');

  // 2. 将脚本注入页面
  await page.evaluate(domUtilsContent);

  // 3. 在页面上下文中调用 domUtils.js 中的函数
  const isBodyVisible = await page.evaluate(() => {
    const body = document.querySelector('body');
    // 调用 isElementVisible 函数
    return isElementVisible(body);
  });

  expect(isBodyVisible).toBe(true);

  // 您甚至可以绘制边界框进行调试
  await page.evaluate(() => {
    // @ts-ignore
    buildElementsAndDrawBoundingBoxes();
  });

  // 暂停以查看边界框
  await page.waitForTimeout(5000);
});
```

### 独立使用

您也可以直接在浏览器环境中使用 `domUtils.js`。

1.  **通过 `<script>` 标签加载**:
    在您的 HTML 文件中，通过 `<script>` 标签引入 `domUtils.js`。

    ```html
    <!DOCTYPE html>
    <html>
    <head>
      <title>Test Page</title>
    </head>
    <body>
      <button id="my-button">Click Me</button>
      <script src="path/to/your/vendor/domUtils.js"></script>
      <script>
        // 现在所有函数都已在全局作用域中可用
        const button = document.getElementById('my-button');
        console.log('Is button visible?', isElementVisible(button));
      </script>
    </body>
    </html>
    ```

2.  **在浏览器控制台中粘贴**:
    打开任何网页的开发者工具，将 `domUtils.js` 的全部内容粘贴到控制台中，然后按 Enter。之后，您就可以直接调用 `isElementVisible`、`buildTreeFromBody` 等函数了。
