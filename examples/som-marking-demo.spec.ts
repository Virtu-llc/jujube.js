import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const domUtilsContent = fs.readFileSync(path.resolve(__dirname, '../vendor/domUtils.js'), 'utf-8');
const jujubeLibContent = fs.readFileSync(path.resolve(__dirname, '../dist/index.js'), 'utf-8');

/**
 * SOM (Set-of-Marks) Marking Demo
 *
 * This example demonstrates how to use Jujube.js to:
 * 1. Mark interactive elements with numbered labels (SOM)
 * 2. Get AI-friendly page content
 * 3. Click elements by their ID
 */
test('SOM marking: Mark all interactive elements on a page', async ({ page }) => {
  // Navigate to target website
  await page.goto('https://www.wikipedia.org');
  await page.waitForLoadState('networkidle');

  // Inject domUtils.js and Jujube library
  await page.evaluate(domUtilsContent);
  await page.evaluate(jujubeLibContent);

  // Initialize Jujube and mark all interactive elements
  const markedElements = await page.evaluate(async () => {
    // @ts-ignore
    const { Jujube } = window;
    const jujube = new Jujube();
    await jujube.init();

    // Mark all interactive elements with SOM labels
    const elements = await jujube.markInteractiveElements();

    return elements;
  });

  console.log('\n=== SOM Marking Demo ===');
  console.log(`Marked ${markedElements.length} interactive elements`);
  console.log('\nFirst 10 elements:');
  markedElements.slice(0, 10).forEach((el: any) => {
    console.log(`  [${el.id}] ${el.tagName}: "${el.text.substring(0, 40)}"`);
  });

  // Take screenshot to show the marked elements
  await page.screenshot({
    path: 'examples/som-marking-screenshot.png',
    fullPage: true
  });
  console.log('\n✓ Screenshot saved: examples/som-marking-screenshot.png');

  expect(markedElements.length).toBeGreaterThan(0);
});

/**
 * AI-Friendly Content Extraction Demo
 *
 * This example shows how to extract structured, AI-friendly content
 * from any webpage without visual marking.
 */
test('AI-friendly content: Extract page content without visual marks', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  await page.waitForLoadState('networkidle');

  await page.evaluate(domUtilsContent);
  await page.evaluate(jujubeLibContent);

  const pageContent = await page.evaluate(async () => {
    // @ts-ignore
    const { Jujube } = window;
    const jujube = new Jujube();
    await jujube.init();

    // Get page content without marking
    return await jujube.getPageContent();
  });

  console.log('\n=== AI-Friendly Content Demo ===');
  console.log(`Page: ${pageContent.title}`);
  console.log(`URL: ${pageContent.url}`);
  console.log(`Total Interactive Elements: ${pageContent.totalInteractableElements}`);
  console.log(`Viewport: ${pageContent.viewport.width}x${pageContent.viewport.height}`);

  // Save to JSON file
  fs.writeFileSync(
    path.resolve(__dirname, 'som-page-content.json'),
    JSON.stringify(pageContent, null, 2)
  );
  console.log('\n✓ Page content saved: examples/som-page-content.json');

  expect(pageContent.totalInteractableElements).toBeGreaterThan(0);
  expect(pageContent.elements).toHaveLength(pageContent.totalInteractableElements);
});

/**
 * Element Clicking Demo
 *
 * This example demonstrates how to click elements by their ID
 */
test('Element interaction: Click elements by ID', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  await page.waitForLoadState('networkidle');

  await page.evaluate(domUtilsContent);
  await page.evaluate(jujubeLibContent);

  // Mark elements and find a search input
  const searchInputId = await page.evaluate(async () => {
    // @ts-ignore
    const { Jujube } = window;
    const jujube = new Jujube();
    await jujube.init();

    const elements = await jujube.markInteractiveElements();

    // Find the search input element
    const searchInput = elements.find((el: any) =>
      el.tagName === 'INPUT' &&
      (el.attributes.type === 'search' || el.attributes.placeholder?.toLowerCase().includes('search'))
    );

    return searchInput?.id;
  });

  if (searchInputId !== undefined && searchInputId !== null) {
    console.log(`\n=== Element Clicking Demo ===`);
    console.log(`Found search input at ID: ${searchInputId}`);

    // Take screenshot before click
    await page.screenshot({
      path: 'examples/before-click.png'
    });
    console.log('✓ Screenshot before click: examples/before-click.png');

    // Click the search input
    await page.evaluate(async (id) => {
      // @ts-ignore
      const { jujube } = window;
      await jujube.clickElement(id);
    }, searchInputId);

    // Wait a bit for the UI to respond
    await page.waitForTimeout(500);

    // Take screenshot after click
    await page.screenshot({
      path: 'examples/after-click.png'
    });
    console.log('✓ Screenshot after click: examples/after-click.png');
    console.log('\nElement clicked successfully!');
  } else {
    console.log('\nNo search input found on this page');
  }

  expect(searchInputId).toBeDefined();
});

/**
 * Text Description Demo
 *
 * This example shows how to generate a text description suitable for AI processing
 */
test('Text description: Generate AI-friendly text description', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  await page.waitForLoadState('networkidle');

  await page.evaluate(domUtilsContent);
  await page.evaluate(jujubeLibContent);

  const textDescription = await page.evaluate(async () => {
    // @ts-ignore
    const { Jujube } = window;
    const jujube = new Jujube();
    await jujube.init();

    return await jujube.getTextDescription();
  });

  console.log('\n=== Text Description Demo ===');
  console.log(textDescription);

  // Save text description
  fs.writeFileSync(
    path.resolve(__dirname, 'page-description.txt'),
    textDescription
  );
  console.log('\n✓ Text description saved: examples/page-description.txt');

  expect(textDescription).toContain('Interactive Elements');
});

/**
 * Element Highlighting Demo
 *
 * This example shows how to highlight specific elements
 */
test('Element highlighting: Highlight specific elements', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  await page.waitForLoadState('networkidle');

  await page.evaluate(domUtilsContent);
  await page.evaluate(jujubeLibContent);

  // Mark elements and highlight the first 3
  await page.evaluate(async () => {
    // @ts-ignore
    const { Jujube } = window;
    const jujube = new Jujube();
    await jujube.init();

    await jujube.markInteractiveElements();

    // Highlight first 3 elements sequentially
    for (let i = 0; i < 3; i++) {
      await jujube.highlightElement(i, 1000);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  });

  console.log('\n=== Element Highlighting Demo ===');
  console.log('Highlighted first 3 elements');

  // Take screenshot during highlighting
  await page.screenshot({
    path: 'examples/element-highlighting.png'
  });
  console.log('✓ Screenshot saved: examples/element-highlighting.png');
});

/**
 * Practical Use Case: Search on Wikipedia
 *
 * This example demonstrates a complete workflow:
 * 1. Mark elements
 * 2. Find search input
 * 3. Click it
 * 4. Type search query
 * 5. Click search button
 */
test('Practical example: Search on Wikipedia using Jujube', async ({ page }) => {
  await page.goto('https://www.wikipedia.org');
  await page.waitForLoadState('networkidle');

  await page.evaluate(domUtilsContent);
  await page.evaluate(jujubeLibContent);

  console.log('\n=== Practical Search Example ===');

  // Step 1: Initialize and mark elements
  const elementIds = await page.evaluate(async () => {
    // @ts-ignore
    const { Jujube } = window;
    const jujube = new Jujube({ showFeedback: true });
    await jujube.init();

    const elements = await jujube.markInteractiveElements();

    // Find search input and search button
    const searchInput = elements.find((el: any) =>
      el.tagName === 'INPUT' && el.attributes.type === 'search'
    );

    const searchButton = elements.find((el: any) =>
      el.tagName === 'BUTTON' &&
      (el.attributes.type === 'submit' || el.text.toLowerCase().includes('search'))
    );

    return {
      searchInputId: searchInput?.id,
      searchButtonId: searchButton?.id,
    };
  });

  console.log(`Search input ID: ${elementIds.searchInputId}`);
  console.log(`Search button ID: ${elementIds.searchButtonId}`);

  if (elementIds.searchInputId !== undefined) {
    // Step 2: Click search input
    await page.evaluate(async (id) => {
      // @ts-ignore
      const { jujube } = window;
      await jujube.clickElement(id);
    }, elementIds.searchInputId);

    console.log('✓ Clicked search input');

    // Step 3: Type search query
    await page.keyboard.type('Artificial Intelligence', { delay: 100 });
    console.log('✓ Typed search query: "Artificial Intelligence"');

    await page.waitForTimeout(500);

    // Take final screenshot
    await page.screenshot({
      path: 'examples/search-demo.png'
    });
    console.log('✓ Screenshot saved: examples/search-demo.png');
  }

  expect(elementIds.searchInputId).toBeDefined();
});
