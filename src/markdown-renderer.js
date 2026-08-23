import { marked } from "https://cdn.jsdelivr.net/npm/marked@18.0.7/lib/marked.esm.js";
import createDOMPurify from "https://cdn.jsdelivr.net/npm/dompurify@3.4.13/dist/purify.es.mjs";
import katex from "https://cdn.jsdelivr.net/npm/katex@0.18.1/dist/katex.mjs";

const DOMPurify = createDOMPurify(window);

function renderMath(source, displayMode) {
  return katex.renderToString(source.trim(), {
    displayMode,
    throwOnError: false,
    strict: "ignore",
    output: "htmlAndMathml",
  });
}

marked.use({
  gfm: true,
  breaks: true,
  extensions: [
    {
      name: "displayMath",
      level: "block",
      start(source) {
        const dollarIndex = source.indexOf("$$");
        const bracketIndex = source.indexOf("\\[");
        if (dollarIndex < 0) return bracketIndex;
        if (bracketIndex < 0) return dollarIndex;
        return Math.min(dollarIndex, bracketIndex);
      },
      tokenizer(source) {
        const dollarMatch = /^\$\$([\s\S]+?)\$\$(?:\n|$)/.exec(source);
        const bracketMatch = /^\\\[([\s\S]+?)\\\](?:\n|$)/.exec(source);
        const match = dollarMatch || bracketMatch;
        if (!match) return undefined;
        return { type: "displayMath", raw: match[0], source: match[1] };
      },
      renderer(token) {
        return `${renderMath(token.source, true)}\n`;
      },
    },
    {
      name: "inlineMath",
      level: "inline",
      start(source) {
        const dollarIndex = source.indexOf("$");
        const bracketIndex = source.indexOf("\\(");
        if (dollarIndex < 0) return bracketIndex;
        if (bracketIndex < 0) return dollarIndex;
        return Math.min(dollarIndex, bracketIndex);
      },
      tokenizer(source) {
        const bracketMatch = /^\\\(([\s\S]+?)\\\)/.exec(source);
        const dollarMatch = /^\$([^$\n]+?)\$/.exec(source);
        const match = bracketMatch || dollarMatch;
        if (!match) return undefined;
        return { type: "inlineMath", raw: match[0], source: match[1] };
      },
      renderer(token) {
        return renderMath(token.source, false);
      },
    },
  ],
});

function appendCursor(root) {
  const cursor = document.createElement("span");
  cursor.className = "sim-stream-cursor";
  cursor.setAttribute("aria-hidden", "true");

  const candidates = root.querySelectorAll("p, li, pre, blockquote, h1, h2, h3, h4, h5, h6, td, th");
  const host = candidates[candidates.length - 1] || root;
  const code = host.matches("pre") ? host.querySelector("code") : null;
  (code || host).append(cursor);
}

export function renderMarkdownInto(container, source) {
  const parsed = marked.parse(source || "");
  const sanitized = DOMPurify.sanitize(parsed, {
    USE_PROFILES: { html: true, mathMl: true, svg: true, svgFilters: true },
  });

  const content = document.createElement("div");
  content.className = "sim-markdown";
  content.innerHTML = sanitized;

  content.querySelectorAll("a[href]").forEach((link) => {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });

  appendCursor(content);
  container.replaceChildren(content);
  container.scrollTop = container.scrollHeight;
}
