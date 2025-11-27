# Jujube.js

Jujube.js is a TypeScript library designed to provide a clean and powerful API for manipulating the browser DOM. It distills chaotic HTML structures into clear, agent-friendly page structures, providing your AI agents with a stable interface to perceive and control any webpage through only the Chrome DevTools Protocol (CDP).

This project integrates with Playwright, allowing you to inject and test your library in a real browser environment.

## Core Features

- **Browser Operations**: Provides convenient functions to query and manipulate DOM elements.
- **TypeScript Support**: Fully written in TypeScript, offering first-class type safety.
- **Playwright Integration**: Uses Playwright for end-to-end testing, ensuring library reliability in real browsers.

## Project Structure

```
.
├── dist/                # Compiled JavaScript output directory
├── node_modules/        # Project dependencies
├── src/                 # TypeScript source code
│   └── index.ts         # Library entry point
├── tests/               # Playwright test files
│   └── example.spec.ts  # Example tests
├── vendor/              # Third-party or legacy JavaScript files
│   └── domUtils.js      # Existing dom-utils library
├── package.json         # Project metadata and dependencies
└── tsconfig.json        # TypeScript configuration file
```

## Quick Start

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Build Project**:
    Compile TypeScript code from the `src` directory and output to the `dist` directory.
    ```bash
    npm run build
    ```

3.  **Run Tests**:
    Run tests using Playwright to verify library functionality.
    ```bash
    npm test
    ```

## Examples

### AI-Friendly HTML Content Extraction

The project provides a complete example demonstrating how to extract AI-friendly structured content from any website:

```bash
npm test examples/ai-friendly-extraction.spec.ts
```

This example will:
- Visit the target website and extract all interactive elements
- Retrieve detailed information for each element:
  - Element ID, tag name, text content
  - Precise position coordinates and dimensions (bounding box)
  - Center point coordinates (convenient for AI to perform click operations)
  - Related attributes (href, type, placeholder, etc.)
- Save data as structured JSON format (`examples/ai-friendly-content.json`)
- Categorize elements by type (links, buttons, input fields, etc.)
- Generate a visualization screenshot showing bounding boxes for all elements

**Output Example:**

```json
{
  "url": "https://www.wikipedia.org",
  "title": "Wikipedia",
  "totalInteractableElements": 42,
  "elements": [
    {
      "index": 0,
      "id": "searchInput",
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
      }
    }
  ]
}
```

This format is perfect for AI agents to understand and interact with webpages, and can be directly used for:
- Automated testing and web scraping
- AI-driven web interactions
- Page structure analysis and accessibility checks

## Development

You can start writing your library code in `src/index.ts`. Whenever you make changes, remember to run the build and test commands to ensure everything works correctly.
