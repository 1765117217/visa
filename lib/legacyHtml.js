import fs from "node:fs";
import path from "node:path";

const ROUTE_REPLACEMENTS = [
  ["index.html", "/"],
  ["japan.html", "/japan"],
  ["korean.html", "/korean"],
  ["japan-form.html", "/japan-form"],
  ["pricing.html", "/pricing"],
  ["faq.html", "/faq"],
  ["documents.html", "/documents"],
  ["Contact.html", "/contact"]
];

function rewriteLegacyPaths(value) {
  let nextValue = value
    .replaceAll("shared.css", "")
    .replaceAll("page-1.png", "/page-1.png")
    .replaceAll("page-2.png", "/page-2.png");

  for (const [from, to] of ROUTE_REPLACEMENTS) {
    nextValue = nextValue.replaceAll(from, to);
  }

  return nextValue;
}

function rewriteLegacyScript(script) {
  const rewrittenScript = rewriteLegacyPaths(script).replace(/\b(const|let)\s+/g, "var ");
  const functionNames = Array.from(
    new Set([...rewrittenScript.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g)].map((match) => match[1]))
  );

  if (functionNames.length === 0) {
    return rewrittenScript;
  }

  const exports = functionNames
    .map((name) => `if (typeof ${name} === "function") window.${name} = ${name};`)
    .join("\n");

  return `(function(){\n${rewrittenScript}\n${exports}\n})();`;
}

function extractBody(html) {
  const styles = [];
  html.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_, style) => {
    if (style.trim()) styles.push(`<style>${rewriteLegacyPaths(style)}</style>`);
    return "";
  });

  const match = html.match(/<body([^>]*)>([\s\S]*?)<\/body>/i);
  if (!match) {
    return { bodyClassName: "", bodyHtml: rewriteLegacyPaths(html), scripts: [] };
  }

  const bodyAttrs = match[1] || "";
  const classMatch = bodyAttrs.match(/class=["']([^"']+)["']/i);
  const bodyClassName = classMatch ? classMatch[1] : "";
  const scripts = [];
  let bodyHtml = match[2].replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, (_, script) => {
    if (script.trim()) scripts.push(rewriteLegacyScript(script));
    return "";
  });

  bodyHtml = bodyHtml.replace(/<script\b[^>]*src=["'][^"']+["'][^>]*>\s*<\/script>/gi, "");

  return {
    bodyClassName,
    bodyHtml: `${styles.join("")}${rewriteLegacyPaths(bodyHtml)}`,
    scripts
  };
}

export function getLegacyPage(fileName) {
  const filePath = getLegacyFilePath(fileName);
  const html = fs.readFileSync(filePath, "utf8");
  return extractBody(html);
}

function getLegacyFilePath(fileName) {
  switch (fileName) {
    case "index.html":
      return path.join(process.cwd(), "index.html");
    case "japan.html":
      return path.join(process.cwd(), "japan.html");
    case "korean.html":
      return path.join(process.cwd(), "korean.html");
    case "japan-form.html":
      return path.join(process.cwd(), "japan-form.html");
    case "pricing.html":
      return path.join(process.cwd(), "pricing.html");
    case "faq.html":
      return path.join(process.cwd(), "faq.html");
    case "documents.html":
      return path.join(process.cwd(), "documents.html");
    case "Contact.html":
      return path.join(process.cwd(), "Contact.html");
    default:
      throw new Error(`Unknown legacy page: ${fileName}`);
  }
}
