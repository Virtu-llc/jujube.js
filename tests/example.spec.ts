import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const domUtils = fs.readFileSync(path.resolve(__dirname, '../vendor/domUtils.js'), 'utf-8');

test('should load domUtils and new library', async ({ page }) => {
  await page.goto('about:blank');

  // Inject domUtils.js
  await page.evaluate(domUtils);

  // Check if a function from domUtils exists
  const isDomUtilsFunctionAvailable = await page.evaluate(() => {
    return typeof (window as any).isElementVisible === 'function';
  });

  expect(isDomUtilsFunctionAvailable).toBe(true);

  // You can also inject your new library here in the future
  // For example:
  // const newLibrary = fs.readFileSync(path.resolve(__dirname, '../dist/index.js'), 'utf-8');
  // await page.evaluate(newLibrary);
});
