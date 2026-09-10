import fs from "node:fs";
import path from "node:path";

const targets = {
  "src/pages/admin/categories/CategoriesPage.tsx":
    "max-w-4xl mx-auto space-y-5",
  "src/pages/admin/Coupons.tsx": "max-w-7xl mx-auto space-y-6",
  "src/pages/admin/dashboard/DashboardPage.tsx":
    "max-w-7xl mx-auto space-y-5 md:space-y-6",
  "src/pages/admin/HeroSlides.tsx": "max-w-7xl mx-auto space-y-6",
  "src/pages/admin/LegalPages.tsx": "max-w-7xl mx-auto space-y-6",
  "src/pages/admin/orders/OrdersPage.tsx":
    "max-w-7xl mx-auto space-y-6 md:space-y-8",
  "src/pages/admin/products/ProductsPage.tsx": "max-w-7xl mx-auto space-y-5",
  "src/pages/admin/reviews/ReviewsPage.tsx": "max-w-7xl mx-auto space-y-5",
  "src/pages/admin/settings/SettingsPage.tsx": "max-w-4xl mx-auto space-y-5",
};

for (const [rel, newCls] of Object.entries(targets)) {
  const abs = path.resolve(rel);
  if (!fs.existsSync(abs)) {
    console.warn("MISSING:", rel);
    continue;
  }

  let src = fs.readFileSync(abs, "utf8");
  const original = src;

  // Some files have 2 wrappers (loading + main render) — loop to fix each.
  let iterations = 0;
  while (iterations++ < 10) {
    const idIdx = src.indexOf('id="main-content"');
    if (idIdx === -1) break;

    // Back up to find the opening `<` of this tag
    let tagStart = idIdx;
    while (tagStart > 0 && src[tagStart] !== "<") tagStart--;

    // Find the `>` that closes the opening tag
    const gtIdx = src.indexOf(">", idIdx);
    if (gtIdx === -1) break;

    // Special case: the LegalPages error state centers its content
    const openTag = src.slice(tagStart, gtIdx);
    const isCenteredErrorState =
      openTag.includes("flex items-center justify-center");

    const cls = isCenteredErrorState
      ? "min-h-[60vh] flex items-center justify-center"
      : newCls;

    // Replace the opening tag with a clean <div>
    src =
      src.slice(0, tagStart) +
      `<div className="${cls}">` +
      src.slice(gtIdx + 1);

    // Replace the matching closing tag
    const closeIdx = src.indexOf("</main>", tagStart);
    if (closeIdx === -1) break;

    src =
      src.slice(0, closeIdx) +
      "</div>" +
      src.slice(closeIdx + "</main>".length);
  }

  if (src !== original) {
    fs.writeFileSync(abs, src, "utf8");
    console.log("✓ patched:", rel);
  } else {
    console.log("· unchanged:", rel);
  }
}

console.log("\nDone.");