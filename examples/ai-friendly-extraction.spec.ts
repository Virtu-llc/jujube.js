import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const domUtilsContent = fs.readFileSync(path.resolve(__dirname, '../vendor/domUtils.js'), 'utf-8');

test('should extract AI-friendly HTML content from Wikipedia', async ({ page }) => {
  // 访问 Wikipedia 首页
  await page.goto('https://www.wikipedia.org');

  // 注入 domUtils.js 脚本
  await page.evaluate(domUtilsContent);

  // 等待页面加载完成
  await page.waitForLoadState('networkidle');

  // 提取所有可交互元素的AI友好信息
  const aiContent = await page.evaluate(async () => {
    // @ts-ignore
    const [elements, _] = await buildTreeFromBody();

    // 筛选出可交互的元素
    const interactableElements = elements.filter((el: any) => el.interactable);

    // 构建AI友好的数据结构
    const aiData = interactableElements.map((el: any, index: number) => {
      return {
        // 元素序号（AI可以用这个序号来引用元素）
        index: index,

        // 元素的唯一ID
        id: el.id || null,

        // 元素的标签名（如 A, BUTTON, INPUT 等）
        tagName: el.tagName,

        // 元素的文本内容
        text: el.text || '',

        // 元素的位置和尺寸信息（bounding box）
        boundingBox: el.rect ? {
          x: Math.round(el.rect.x),
          y: Math.round(el.rect.y),
          width: Math.round(el.rect.width),
          height: Math.round(el.rect.height),
          // 中心点坐标（方便AI进行点击）
          centerX: Math.round(el.rect.x + el.rect.width / 2),
          centerY: Math.round(el.rect.y + el.rect.height / 2)
        } : null,

        // 元素的其他属性
        attributes: {
          href: el.attributes?.href || null,
          type: el.attributes?.type || null,
          placeholder: el.attributes?.placeholder || null,
          value: el.attributes?.value || null,
          ariaLabel: el.attributes?.['aria-label'] || null,
          title: el.attributes?.title || null,
          role: el.attributes?.role || null,
        },

        // 元素是否当前可见
        visible: el.visible !== false,

        // 元素的CSS选择器（方便定位）
        selector: el.selector || null,
      };
    });

    return {
      url: window.location.href,
      title: document.title,
      totalInteractableElements: aiData.length,
      elements: aiData,
      extractedAt: new Date().toISOString(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      }
    };
  });

  // 输出提取的信息到控制台
  console.log('\n=== AI友好的页面内容 ===');
  console.log(`页面标题: ${aiContent.title}`);
  console.log(`页面URL: ${aiContent.url}`);
  console.log(`视口尺寸: ${aiContent.viewport.width}x${aiContent.viewport.height}`);
  console.log(`可交互元素总数: ${aiContent.totalInteractableElements}\n`);

  // 显示前10个元素作为示例
  console.log('前10个可交互元素:');
  aiContent.elements.slice(0, 10).forEach((el: any) => {
    console.log(`\n[${el.index}] ${el.tagName}${el.id ? ` #${el.id}` : ''}`);
    console.log(`  文本: "${el.text.substring(0, 50)}${el.text.length > 50 ? '...' : ''}"`);
    if (el.boundingBox) {
      console.log(`  位置: (${el.boundingBox.x}, ${el.boundingBox.y})`);
      console.log(`  尺寸: ${el.boundingBox.width}x${el.boundingBox.height}`);
      console.log(`  中心点: (${el.boundingBox.centerX}, ${el.boundingBox.centerY})`);
    }
    if (el.attributes.href) {
      console.log(`  链接: ${el.attributes.href}`);
    }
  });

  // 将完整数据保存为 JSON 文件
  fs.writeFileSync(
    path.resolve(__dirname, 'ai-friendly-content.json'),
    JSON.stringify(aiContent, null, 2),
    'utf-8'
  );
  console.log('\n✓ 完整数据已保存到: examples/ai-friendly-content.json');

  // 绘制边界框并截图（可视化）
  await page.evaluate(async () => {
    // @ts-ignore
    const [elements, _] = await buildTreeFromBody();
    // @ts-ignore
    drawBoundingBoxes(elements);
  });

  await page.waitForTimeout(1000);
  await page.screenshot({
    path: 'examples/ai-friendly-screenshot.png',
    fullPage: true
  });
  console.log('✓ 截图已保存到: examples/ai-friendly-screenshot.png\n');

  // 验证提取的数据
  expect(aiContent.totalInteractableElements).toBeGreaterThan(0);
  expect(aiContent.elements.length).toBe(aiContent.totalInteractableElements);
});

// 额外示例：展示如何对特定类型的元素进行筛选
test('should filter and categorize interactive elements', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  await page.evaluate(domUtilsContent);
  await page.waitForLoadState('networkidle');

  const categorizedElements = await page.evaluate(async () => {
    // @ts-ignore
    const [elements, _] = await buildTreeFromBody();
    const interactableElements = elements.filter((el: any) => el.interactable);

    // 按类型分类元素
    const categories = {
      links: [] as any[],      // 链接
      buttons: [] as any[],    // 按钮
      inputs: [] as any[],     // 输入框
      selects: [] as any[],    // 下拉框
      others: [] as any[],     // 其他可交互元素
    };

    interactableElements.forEach((el: any) => {
      const simplified = {
        tagName: el.tagName,
        text: el.text || '',
        id: el.id || null,
        boundingBox: el.rect ? {
          centerX: Math.round(el.rect.x + el.rect.width / 2),
          centerY: Math.round(el.rect.y + el.rect.height / 2)
        } : null,
      };

      if (el.tagName === 'A') {
        categories.links.push({
          ...simplified,
          href: el.attributes?.href
        });
      } else if (el.tagName === 'BUTTON') {
        categories.buttons.push(simplified);
      } else if (el.tagName === 'INPUT') {
        categories.inputs.push({
          ...simplified,
          type: el.attributes?.type,
          placeholder: el.attributes?.placeholder
        });
      } else if (el.tagName === 'SELECT') {
        categories.selects.push(simplified);
      } else {
        categories.others.push(simplified);
      }
    });

    return categories;
  });

  console.log('\n=== 按类型分类的可交互元素 ===');
  console.log(`链接 (A): ${categorizedElements.links.length} 个`);
  console.log(`按钮 (BUTTON): ${categorizedElements.buttons.length} 个`);
  console.log(`输入框 (INPUT): ${categorizedElements.inputs.length} 个`);
  console.log(`下拉框 (SELECT): ${categorizedElements.selects.length} 个`);
  console.log(`其他: ${categorizedElements.others.length} 个\n`);

  // 显示一些链接示例
  if (categorizedElements.links.length > 0) {
    console.log('链接示例:');
    categorizedElements.links.slice(0, 5).forEach((link: any, i: number) => {
      console.log(`  ${i + 1}. "${link.text.substring(0, 40)}" -> ${link.href}`);
    });
  }

  // 保存分类数据
  fs.writeFileSync(
    path.resolve(__dirname, 'categorized-elements.json'),
    JSON.stringify(categorizedElements, null, 2),
    'utf-8'
  );
  console.log('\n✓ 分类数据已保存到: examples/categorized-elements.json\n');

  expect(categorizedElements.links.length).toBeGreaterThan(0);
});
