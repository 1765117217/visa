import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  basicFormFields,
  footerDisclaimer,
  navigationItems,
  simplePages,
  visaPages
} from "../data/pages/site.ts";

const projectRoot = process.cwd();

test("navigation keeps the current public route labels", () => {
  assert.deepEqual(
    navigationItems.map((item) => [item.label, item.href]),
    [
      ["首页", "/"],
      ["日本签证", "/japan"],
      ["韩国签证", "/korean"],
      ["服务价格", "/pricing"],
      ["常见问题", "/faq"],
      ["联系我们", "/contact"]
    ]
  );
});

test("native page data preserves core public content", () => {
  assert.equal(simplePages.pricing.title, "签证准备收费");
  assert.equal(simplePages.faq.items.length, 10);
  assert.equal(simplePages.documents.cards.length, 5);
  assert.equal(simplePages.contact.title, "联系我们");
  assert.match(footerDisclaimer, /不保证签证批准/);
});

test("visa page data covers Japan and Korea without HTML extraction", () => {
  assert.equal(visaPages.japan.country, "日本");
  assert.equal(visaPages.korea.country, "韩国");
  assert.equal(visaPages.japan.checklist.length, 9);
  assert.equal(visaPages.korea.checklist.length, 9);
  assert.equal(basicFormFields.length, 9);
});

test("legacy extraction bridge is not imported by app route files", () => {
  const appDir = path.join(projectRoot, "app");
  const routeFiles = fs
    .readdirSync(appDir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name === "page.tsx")
    .map((entry) => path.join(entry.parentPath || appDir, entry.name));

  for (const filePath of routeFiles) {
    const source = fs.readFileSync(filePath, "utf8");
    assert.equal(source.includes("getLegacyPage"), false, filePath);
    assert.equal(source.includes("LegacyPageClient"), false, filePath);
    assert.equal(source.includes("dangerouslySetInnerHTML"), false, filePath);
  }
});
