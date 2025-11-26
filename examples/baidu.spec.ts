import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const domUtilsContent = fs.readFileSync(path.resolve(__dirname, '../vendor/domUtils.js'), 'utf-8');

test('should draw bounding boxes on baidu.com and take a screenshot', async ({ page }) => {
  await page.goto('https://www.baidu.com');

  // Inject the domUtils.js script
  await page.evaluate(domUtilsContent);

  // Wait for the page to load completely
  await page.waitForLoadState('networkidle');

  // Draw bounding boxes and get the count of interactable elements
  const interactableElementsCount = await page.evaluate(async () => {
    // @ts-ignore
    const [elements, _] = await buildTreeFromBody();
    const interactableElements = elements.filter((el: any) => el.interactable);
    
    // Log the elements for debugging purposes
    console.log(`Found ${interactableElements.length} interactable elements.`);
    console.log(interactableElements.map((el: any) => ({ id: el.id, tagName: el.tagName, text: el.text })));

    // @ts-ignore
    drawBoundingBoxes(elements);
    return interactableElements.length;
  });

  console.log(`Playwright received: Found ${interactableElementsCount} interactable elements.`);

  // Wait for a moment to ensure the boxes are rendered before taking the screenshot
  await page.waitForTimeout(1000);

  // Debugging: Check if the bounding boxes are created and visible
  const debugInfo = await page.evaluate(() => {
    const container = document.getElementById('boundingBoxContainer');
    if (!container) {
      return { containerExists: false };
    }

    const firstBox = container.querySelector('div[style*="border"]');
    if (!firstBox) {
      return { containerExists: true, boxExists: false };
    }

    const containerStyle = window.getComputedStyle(container);
    const boxStyle = window.getComputedStyle(firstBox);

    return {
      containerExists: true,
      boxExists: true,
      containerStyle: {
        display: containerStyle.display,
        visibility: containerStyle.visibility,
        opacity: containerStyle.opacity,
        zIndex: containerStyle.zIndex,
      },
      boxStyle: {
        display: boxStyle.display,
        visibility: boxStyle.visibility,
        opacity: boxStyle.opacity,
        zIndex: boxStyle.zIndex,
        border: boxStyle.border,
      },
    };
  });

  console.log('--- Debug Info ---');
  console.log(debugInfo);
  console.log('------------------');

  // Take a screenshot and save it
  await page.screenshot({ path: 'examples/baidu-screenshot.png' });
});
