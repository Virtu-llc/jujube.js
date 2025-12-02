/**
 * Jujube.js - AI-Friendly Web Automation Library
 *
 * A powerful library for extracting interactive elements from web pages
 * and providing AI-friendly interfaces for browser automation.
 *
 * @example
 * ```typescript
 * import { Jujube } from 'jujube.js';
 *
 * const jujube = new Jujube();
 * await jujube.init();
 *
 * // Mark all interactive elements with SOM (Set-of-Marks) labels
 * await jujube.markInteractiveElements();
 *
 * // Get AI-friendly content
 * const content = await jujube.getPageContent();
 *
 * // Click an element by its ID
 * await jujube.clickElement(5);
 * ```
 */

export interface ElementInfo {
  /** Element index/ID for reference */
  id: number;
  /** HTML tag name (e.g., 'A', 'BUTTON', 'INPUT') */
  tagName: string;
  /** Text content of the element */
  text: string;
  /** Bounding box coordinates and dimensions */
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
    centerX: number;
    centerY: number;
  } | null;
  /** Element attributes (href, type, placeholder, etc.) */
  attributes: {
    href?: string | null;
    type?: string | null;
    placeholder?: string | null;
    value?: string | null;
    ariaLabel?: string | null;
    title?: string | null;
    role?: string | null;
    [key: string]: any;
  };
  /** Whether the element is currently visible */
  visible: boolean;
  /** CSS selector for the element */
  selector?: string | null;
  /** XPath to locate the element */
  xpath?: string | null;
}

export interface PageContent {
  /** Current page URL */
  url: string;
  /** Page title */
  title: string;
  /** Total number of interactive elements */
  totalInteractableElements: number;
  /** Array of interactive elements */
  elements: ElementInfo[];
  /** Timestamp of extraction */
  extractedAt: string;
  /** Viewport size */
  viewport: {
    width: number;
    height: number;
  };
}

export interface JujubeOptions {
  /** Whether to show visual feedback for interactions */
  showFeedback?: boolean;
  /** Custom DOM utils script content (if not using default) */
  domUtilsScript?: string;
}

/**
 * Main Jujube class for AI-friendly web automation
 */
export class Jujube {
  private initialized = false;
  private options: JujubeOptions;
  private markedElements: ElementInfo[] = [];

  constructor(options: JujubeOptions = {}) {
    this.options = {
      showFeedback: true,
      ...options,
    };
  }

  /**
   * Initialize the library by injecting required scripts
   * Must be called before using other methods
   */
  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      throw new Error('Jujube.js must be run in a browser environment');
    }

    // Check if domUtils is already available
    if (typeof (window as any).buildTreeFromBody === 'undefined') {
      throw new Error(
        'domUtils.js is not loaded. Please ensure domUtils.js is injected before initializing Jujube.'
      );
    }

    this.initialized = true;
  }

  /**
   * Mark all interactive elements on the page with SOM (Set-of-Marks) labels
   * Returns the list of marked elements
   */
  async markInteractiveElements(): Promise<ElementInfo[]> {
    this.ensureInitialized();

    const content = await this.getPageContent();
    this.markedElements = content.elements;

    // Draw bounding boxes with numbers
    await this.drawSOMMarks(this.markedElements);

    return this.markedElements;
  }

  /**
   * Get AI-friendly page content including all interactive elements
   */
  async getPageContent(): Promise<PageContent> {
    this.ensureInitialized();

    const result = await (window as any).buildTreeFromBody();
    const [elements, _] = result;

    const interactableElements = elements.filter((el: any) => el.interactable);

    const formattedElements: ElementInfo[] = interactableElements.map((el: any, index: number) => {
      return {
        id: index,
        tagName: el.tagName,
        text: el.text || '',
        boundingBox: el.rect ? {
          x: Math.round(el.rect.x),
          y: Math.round(el.rect.y),
          width: Math.round(el.rect.width),
          height: Math.round(el.rect.height),
          centerX: Math.round(el.rect.x + el.rect.width / 2),
          centerY: Math.round(el.rect.y + el.rect.height / 2),
        } : null,
        attributes: {
          href: el.attributes?.href || null,
          type: el.attributes?.type || null,
          placeholder: el.attributes?.placeholder || null,
          value: el.attributes?.value || null,
          ariaLabel: el.attributes?.['aria-label'] || null,
          title: el.attributes?.title || null,
          role: el.attributes?.role || null,
        },
        visible: el.visible !== false,
        selector: el.selector || null,
      };
    });

    return {
      url: window.location.href,
      title: document.title,
      totalInteractableElements: formattedElements.length,
      elements: formattedElements,
      extractedAt: new Date().toISOString(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };
  }

  /**
   * Click an element by its ID (index)
   */
  async clickElement(id: number): Promise<void> {
    this.ensureInitialized();

    if (this.markedElements.length === 0) {
      // Need to fetch elements first
      await this.markInteractiveElements();
    }

    const element = this.markedElements[id];
    if (!element) {
      throw new Error(`Element with ID ${id} not found`);
    }

    if (!element.boundingBox) {
      throw new Error(`Element with ID ${id} has no bounding box`);
    }

    // Simulate a click at the center of the element
    const { centerX, centerY } = element.boundingBox;

    // Find the actual DOM element at these coordinates
    const domElement = document.elementFromPoint(centerX, centerY);

    if (!domElement) {
      throw new Error(`No DOM element found at coordinates (${centerX}, ${centerY})`);
    }

    // Highlight before clicking if feedback is enabled
    if (this.options.showFeedback) {
      await this.highlightElement(id);
      await this.sleep(300);
    }

    // Trigger click event
    if (domElement instanceof HTMLElement) {
      domElement.click();
    } else {
      // Fallback to dispatching a click event
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      domElement.dispatchEvent(clickEvent);
    }
  }

  /**
   * Get information about a specific element by ID
   */
  getElementInfo(id: number): ElementInfo | null {
    this.ensureInitialized();

    if (this.markedElements.length === 0) {
      return null;
    }

    return this.markedElements[id] || null;
  }

  /**
   * Highlight a specific element temporarily
   */
  async highlightElement(id: number, duration = 500): Promise<void> {
    this.ensureInitialized();

    const element = this.markedElements[id];
    if (!element || !element.boundingBox) {
      return;
    }

    const { x, y, width, height } = element.boundingBox;

    // Create highlight overlay
    const highlight = document.createElement('div');
    highlight.id = 'jujube-highlight';
    highlight.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: ${width}px;
      height: ${height}px;
      border: 3px solid #ff6b6b;
      background-color: rgba(255, 107, 107, 0.2);
      pointer-events: none;
      z-index: 2147483646;
      animation: jujube-pulse 0.3s ease-in-out;
    `;

    // Add animation
    if (!document.getElementById('jujube-highlight-style')) {
      const style = document.createElement('style');
      style.id = 'jujube-highlight-style';
      style.textContent = `
        @keyframes jujube-pulse {
          0% { transform: scale(1); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(highlight);

    // Remove after duration
    await this.sleep(duration);
    highlight.remove();
  }

  /**
   * Clear all SOM marks from the page
   */
  clearMarks(): void {
    this.ensureInitialized();

    // Remove bounding box container
    const container = document.getElementById('boundingBoxContainer');
    if (container) {
      container.remove();
    }

    // Clear stored elements
    this.markedElements = [];
  }

  /**
   * Get text description of the page suitable for AI processing
   */
  async getTextDescription(): Promise<string> {
    this.ensureInitialized();

    const content = await this.getPageContent();
    const lines: string[] = [];

    lines.push(`Page: ${content.title}`);
    lines.push(`URL: ${content.url}`);
    lines.push(`Interactive Elements: ${content.totalInteractableElements}`);
    lines.push('');

    // Group elements by type
    const byType: { [key: string]: ElementInfo[] } = {};
    content.elements.forEach(el => {
      if (!byType[el.tagName]) {
        byType[el.tagName] = [];
      }
      byType[el.tagName].push(el);
    });

    // Generate text description
    Object.keys(byType).sort().forEach(tagName => {
      lines.push(`${tagName} elements (${byType[tagName].length}):`);
      byType[tagName].forEach(el => {
        const text = el.text ? `"${el.text.substring(0, 50)}"` : '';
        const href = el.attributes.href ? ` -> ${el.attributes.href}` : '';
        lines.push(`  [${el.id}] ${text}${href}`);
      });
      lines.push('');
    });

    return lines.join('\n');
  }

  /**
   * Export current page data as JSON
   */
  async exportAsJSON(): Promise<string> {
    const content = await this.getPageContent();
    return JSON.stringify(content, null, 2);
  }

  // Private helper methods

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('Jujube is not initialized. Call init() first.');
    }
  }

  private async drawSOMMarks(elements: ElementInfo[]): Promise<void> {
    // Remove existing marks
    this.clearMarks();

    // Create container for marks
    const container = document.createElement('div');
    container.id = 'boundingBoxContainer';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2147483647;
    `;

    // Draw each element with its ID
    elements.forEach((element) => {
      if (!element.boundingBox) return;

      const { x, y, width, height, centerX, centerY } = element.boundingBox;

      // Bounding box
      const box = document.createElement('div');
      box.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: ${width}px;
        height: ${height}px;
        border: 2px solid #4CAF50;
        background-color: rgba(76, 175, 80, 0.1);
        pointer-events: none;
      `;

      // ID label
      const label = document.createElement('div');
      label.textContent = `${element.id}`;
      label.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y - 20}px;
        background-color: #4CAF50;
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 12px;
        font-weight: bold;
        font-family: monospace;
        pointer-events: none;
      `;

      container.appendChild(box);
      container.appendChild(label);
    });

    document.body.appendChild(container);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export a singleton instance for convenience
export const jujube = new Jujube();

// Export default
export default Jujube;
