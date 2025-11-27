import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const domUtilsContent = fs.readFileSync(path.resolve(__dirname, '../vendor/domUtils.js'), 'utf-8');

test('should extract AI-friendly HTML content from Wikipedia', async ({ page }) => {
  // Navigate to Wikipedia homepage
  await page.goto('https://www.wikipedia.org');

  // Inject domUtils.js script
  await page.evaluate(domUtilsContent);

  // Wait for page to finish loading
  await page.waitForLoadState('networkidle');

  // Extract AI-friendly information of all interactive elements
  const aiContent = await page.evaluate(async () => {
    // @ts-ignore
    const [elements, _] = await buildTreeFromBody();

    // Filter out interactive elements
    const interactableElements = elements.filter((el: any) => el.interactable);

    // Build AI-friendly data structure
    const aiData = interactableElements.map((el: any, index: number) => {
      return {
        // Element index (AI can use this index to reference elements)
        index: index,

        // Element's unique ID
        id: el.id || null,

        // Element's tag name (e.g., A, BUTTON, INPUT, etc.)
        tagName: el.tagName,

        // Element's text content
        text: el.text || '',

        // Element's position and size information (bounding box)
        boundingBox: el.rect ? {
          x: Math.round(el.rect.x),
          y: Math.round(el.rect.y),
          width: Math.round(el.rect.width),
          height: Math.round(el.rect.height),
          // Center point coordinates (convenient for AI to click)
          centerX: Math.round(el.rect.x + el.rect.width / 2),
          centerY: Math.round(el.rect.y + el.rect.height / 2)
        } : null,

        // Element's other attributes
        attributes: {
          href: el.attributes?.href || null,
          type: el.attributes?.type || null,
          placeholder: el.attributes?.placeholder || null,
          value: el.attributes?.value || null,
          ariaLabel: el.attributes?.['aria-label'] || null,
          title: el.attributes?.title || null,
          role: el.attributes?.role || null,
        },

        // Whether element is currently visible
        visible: el.visible !== false,

        // Element's CSS selector (convenient for locating)
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

  // Output extracted information to console
  console.log('\n=== AI-Friendly Page Content ===');
  console.log(`Page Title: ${aiContent.title}`);
  console.log(`Page URL: ${aiContent.url}`);
  console.log(`Viewport Size: ${aiContent.viewport.width}x${aiContent.viewport.height}`);
  console.log(`Total Interactive Elements: ${aiContent.totalInteractableElements}\n`);

  // Display first 10 elements as examples
  console.log('First 10 Interactive Elements:');
  aiContent.elements.slice(0, 10).forEach((el: any) => {
    console.log(`\n[${el.index}] ${el.tagName}${el.id ? ` #${el.id}` : ''}`);
    console.log(`  Text: "${el.text.substring(0, 50)}${el.text.length > 50 ? '...' : ''}"`);
    if (el.boundingBox) {
      console.log(`  Position: (${el.boundingBox.x}, ${el.boundingBox.y})`);
      console.log(`  Size: ${el.boundingBox.width}x${el.boundingBox.height}`);
      console.log(`  Center: (${el.boundingBox.centerX}, ${el.boundingBox.centerY})`);
    }
    if (el.attributes.href) {
      console.log(`  Link: ${el.attributes.href}`);
    }
  });

  // Save complete data as JSON file
  fs.writeFileSync(
    path.resolve(__dirname, 'ai-friendly-content.json'),
    JSON.stringify(aiContent, null, 2),
    'utf-8'
  );
  console.log('\n✓ Complete data saved to: examples/ai-friendly-content.json');

  // Draw bounding boxes and take screenshot (visualization)
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
  console.log('✓ Screenshot saved to: examples/ai-friendly-screenshot.png\n');

  // Verify extracted data
  expect(aiContent.totalInteractableElements).toBeGreaterThan(0);
  expect(aiContent.elements.length).toBe(aiContent.totalInteractableElements);
});

// Additional example: demonstrates how to filter elements by specific types
test('should filter and categorize interactive elements', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  await page.evaluate(domUtilsContent);
  await page.waitForLoadState('networkidle');

  const categorizedElements = await page.evaluate(async () => {
    // @ts-ignore
    const [elements, _] = await buildTreeFromBody();
    const interactableElements = elements.filter((el: any) => el.interactable);

    // Categorize elements by type
    const categories = {
      links: [] as any[],      // Links
      buttons: [] as any[],    // Buttons
      inputs: [] as any[],     // Input fields
      selects: [] as any[],    // Select dropdowns
      others: [] as any[],     // Other interactive elements
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

  console.log('\n=== Interactive Elements Categorized by Type ===');
  console.log(`Links (A): ${categorizedElements.links.length}`);
  console.log(`Buttons (BUTTON): ${categorizedElements.buttons.length}`);
  console.log(`Inputs (INPUT): ${categorizedElements.inputs.length}`);
  console.log(`Selects (SELECT): ${categorizedElements.selects.length}`);
  console.log(`Others: ${categorizedElements.others.length}\n`);

  // Display some link examples
  if (categorizedElements.links.length > 0) {
    console.log('Link Examples:');
    categorizedElements.links.slice(0, 5).forEach((link: any, i: number) => {
      console.log(`  ${i + 1}. "${link.text.substring(0, 40)}" -> ${link.href}`);
    });
  }

  // Save categorized data
  fs.writeFileSync(
    path.resolve(__dirname, 'categorized-elements.json'),
    JSON.stringify(categorizedElements, null, 2),
    'utf-8'
  );
  console.log('\n✓ Categorized data saved to: examples/categorized-elements.json\n');

  expect(categorizedElements.links.length).toBeGreaterThan(0);
});
