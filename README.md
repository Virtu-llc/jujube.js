# Jujube.js 🍒

An AI-friendly web automation library that transforms chaotic HTML into clean, structured data for intelligent agents. Jujube.js provides a simple yet powerful API for browser automation, element extraction, and interactive web page analysis.

**Key Features:**
- **SOM (Set-of-Marks) Labeling**: Mark interactive elements with numbered labels for easy AI reference
- **AI-Friendly Content Extraction**: Get structured JSON data of all interactive elements
- **Element Interaction**: Click, highlight, and interact with elements by ID
- **Text Descriptions**: Generate human/AI-readable page descriptions
- **TypeScript Support**: Full type safety and IntelliSense support
- **Framework Agnostic**: Works with Playwright, Puppeteer, or standalone in browsers

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core API](#core-api)
- [Usage Examples](#usage-examples)
- [Browser Integration](#browser-integration)
- [Development](#development)

## Installation

```bash
npm install jujube.js
```

Or build from source:

```bash
git clone https://github.com/Virtu-llc/jujube.js.git
cd jujube.js
npm install
npm run build
```

## Quick Start

### In Playwright/Puppeteer

```typescript
import { test } from '@playwright/test';
import * as fs from 'fs';

const domUtilsContent = fs.readFileSync('./vendor/domUtils.js', 'utf-8');
const jujubeContent = fs.readFileSync('./dist/index.js', 'utf-8');

test('mark and interact with elements', async ({ page }) => {
  await page.goto('https://example.com');

  // Inject dependencies
  await page.evaluate(domUtilsContent);
  await page.evaluate(jujubeContent);

  // Use Jujube
  const result = await page.evaluate(async () => {
    const { Jujube } = window;
    const jujube = new Jujube();
    await jujube.init();

    // Mark all interactive elements with SOM labels
    const elements = await jujube.markInteractiveElements();

    // Click element with ID 5
    await jujube.clickElement(5);

    return elements;
  });

  console.log(`Found ${result.length} interactive elements`);
});
```

### In Browser

```html
<!DOCTYPE html>
<html>
<head>
  <title>Jujube.js Demo</title>
</head>
<body>
  <script src="vendor/domUtils.js"></script>
  <script src="dist/index.js"></script>
  <script>
    (async () => {
      const jujube = new window.Jujube();
      await jujube.init();

      // Mark interactive elements
      const elements = await jujube.markInteractiveElements();
      console.log(`Found ${elements.length} elements`);

      // Get AI-friendly content
      const content = await jujube.getPageContent();
      console.log(content);
    })();
  </script>
</body>
</html>
```

## Core API

### Class: `Jujube`

The main class for AI-friendly web automation.

#### Constructor

```typescript
new Jujube(options?: JujubeOptions)
```

**Options:**
- `showFeedback?: boolean` - Show visual feedback for interactions (default: `true`)

#### Methods

##### `init(): Promise<void>`

Initialize the library. Must be called before using other methods.

```typescript
const jujube = new Jujube();
await jujube.init();
```

##### `markInteractiveElements(): Promise<ElementInfo[]>`

Mark all interactive elements on the page with SOM (Set-of-Marks) labels. Each element gets a numbered label displayed on the page.

```typescript
const elements = await jujube.markInteractiveElements();
console.log(`Marked ${elements.length} elements`);
```

**Returns:** Array of `ElementInfo` objects

##### `getPageContent(): Promise<PageContent>`

Extract AI-friendly structured content from the page without visual marking.

```typescript
const content = await jujube.getPageContent();
console.log(content.totalInteractableElements); // Number of interactive elements
console.log(content.elements); // Array of element data
```

**Returns:** `PageContent` object with:
- `url`: Current page URL
- `title`: Page title
- `totalInteractableElements`: Count of interactive elements
- `elements`: Array of element information
- `extractedAt`: ISO timestamp
- `viewport`: Viewport dimensions

##### `clickElement(id: number): Promise<void>`

Click an element by its ID (index). Shows visual feedback if enabled.

```typescript
await jujube.clickElement(5); // Click element with ID 5
```

##### `getElementInfo(id: number): ElementInfo | null`

Get information about a specific element by ID.

```typescript
const element = jujube.getElementInfo(3);
console.log(element.text); // Element text content
console.log(element.boundingBox); // Position and size
```

##### `highlightElement(id: number, duration?: number): Promise<void>`

Temporarily highlight a specific element. Default duration is 500ms.

```typescript
await jujube.highlightElement(7, 1000); // Highlight for 1 second
```

##### `clearMarks(): void`

Remove all SOM marks from the page.

```typescript
jujube.clearMarks();
```

##### `getTextDescription(): Promise<string>`

Generate a human/AI-readable text description of the page.

```typescript
const description = await jujube.getTextDescription();
console.log(description);
// Output:
// Page: Wikipedia
// URL: https://www.wikipedia.org
// Interactive Elements: 42
//
// A elements (15):
//   [0] "English" -> https://en.wikipedia.org/
//   [1] "Español" -> https://es.wikipedia.org/
// ...
```

##### `exportAsJSON(): Promise<string>`

Export current page data as formatted JSON string.

```typescript
const json = await jujube.exportAsJSON();
fs.writeFileSync('page-data.json', json);
```

### Types

#### `ElementInfo`

Information about an interactive element:

```typescript
interface ElementInfo {
  id: number;                    // Element index for reference
  tagName: string;               // HTML tag (e.g., 'BUTTON', 'A', 'INPUT')
  text: string;                  // Text content
  boundingBox: {                 // Position and size
    x: number;
    y: number;
    width: number;
    height: number;
    centerX: number;             // Center point X (for clicking)
    centerY: number;             // Center point Y (for clicking)
  } | null;
  attributes: {                  // HTML attributes
    href?: string | null;
    type?: string | null;
    placeholder?: string | null;
    value?: string | null;
    ariaLabel?: string | null;
    title?: string | null;
    role?: string | null;
  };
  visible: boolean;              // Whether element is visible
  selector?: string | null;      // CSS selector
}
```

## Project Structure

```
.
├── dist/                # 编译后的 JavaScript 输出目录
├── node_modules/        # 项目依赖
├── src/                 # TypeScript 源代码
│   └── index.ts         # 库的入口文件
├── tests/               # Playwright 测试文件
│   └── example.spec.ts  # 示例测试
├── vendor/              # 第三方或遗留的 JavaScript 文件
│   └── domUtils.js      # 现有的 dom-utils 库
├── package.json         # 项目元数据和依赖
└── tsconfig.json        # TypeScript 配置文件
```

## 快速入门

1.  **安装依赖**:
    ```bash
    npm install
    ```

2.  **构建项目**:
    编译 `src` 目录下的 TypeScript 代码，并输出到 `dist` 目录。
    ```bash
    npm run build
    ```

3.  **运行测试**:
    使用 Playwright 运行测试，验证库的功能。
    ```bash
    npm test
    ```

## Usage Examples

### 1. SOM (Set-of-Marks) Marking Demo

The SOM marking example demonstrates the core functionality of Jujube.js:

```bash
npm test examples/som-marking-demo.spec.ts
```

This example includes:
- **SOM Marking**: Mark all interactive elements with numbered labels
- **AI-Friendly Content Extraction**: Get structured data without visual marks
- **Element Clicking**: Click elements by their ID
- **Text Description**: Generate human/AI-readable descriptions
- **Element Highlighting**: Highlight specific elements
- **Practical Use Case**: Complete Wikipedia search workflow

**Output Example:**

```
=== SOM Marking Demo ===
Marked 42 interactive elements

First 10 elements:
  [0] A: "English"
  [1] A: "日本語"
  [2] A: "Español"
  [3] INPUT: ""
  [4] BUTTON: "Search"
  ...
```

### 2. AI-Friendly Content Extraction

Extract structured data from any website:

```bash
npm test examples/ai-friendly-extraction.spec.ts
```

This example shows how to:
- Extract all interactive elements with detailed information
- Get element IDs, tag names, text content
- Capture precise position coordinates and bounding boxes
- Get center point coordinates (convenient for AI clicking)
- Retrieve relevant attributes (href, type, placeholder, etc.)
- Save data as structured JSON (`examples/ai-friendly-content.json`)
- Categorize elements by type (links, buttons, inputs, etc.)
- Generate visualization screenshots with bounding boxes

**JSON Output Format:**

```json
{
  "url": "https://www.wikipedia.org",
  "title": "Wikipedia",
  "totalInteractableElements": 42,
  "elements": [
    {
      "id": 0,
      "tagName": "INPUT",
      "text": "",
      "boundingBox": {
        "x": 100,
        "y": 200,
        "width": 300,
        "height": 40,
        "centerX": 250,
        "centerY": 220
      },
      "attributes": {
        "type": "search",
        "placeholder": "Search Wikipedia"
      },
      "visible": true
    }
  ],
  "extractedAt": "2024-01-01T00:00:00.000Z",
  "viewport": {
    "width": 1280,
    "height": 720
  }
}
```

**Use Cases:**
- Automated testing and web scraping
- AI-driven web interaction
- Page structure analysis
- Accessibility checking

### 3. Browser Usage Example

Open `examples/browser-usage.html` in a browser to see an interactive demo:

```bash
# Build the library first
npm run build

# Then open the HTML file in your browser
open examples/browser-usage.html
```

This interactive demo page includes:
- Visual buttons to mark elements, extract content, and generate descriptions
- Sample interactive elements (cards, forms, links)
- Console commands for advanced usage:
  ```javascript
  // Click element with ID 5
  jujubeClickElement(5);

  // Highlight element with ID 3
  jujubeHighlightElement(3, 1000);
  ```

## 开发

您可以在 `src/index.ts` 中开始编写您的库代码。每当您做出更改时，请记得运行构建和测试命令以确保一切正常。
