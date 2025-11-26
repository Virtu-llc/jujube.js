# Jujube.js

Jujube.js 是一个 TypeScript 库，旨在提供一套简洁、强大的 API 来操作浏览器 DOM。它将混乱的 HTML 结构提炼为清晰、对智能体友好的页面结构，为您的 AI 智能体提供一个稳定的界面，仅通过 Chrome DevTools Protocol (CDP) 就能感知和控制任何网页。

该项目与 Playwright 集成，允许您在真实的浏览器环境中注入和测试您的库。

## 核心特性

- **浏览器操作**: 提供便利的函数来查询和操作 DOM 元素。
- **TypeScript 支持**: 完全用 TypeScript 编写，提供一流的类型安全。
- **Playwright 集成**: 使用 Playwright 进行端到端测试，确保库在真实浏览器中的可靠性。

## 项目结构

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

## 开发

您可以在 `src/index.ts` 中开始编写您的库代码。每当您做出更改时，请记得运行构建和测试命令以确保一切正常。
