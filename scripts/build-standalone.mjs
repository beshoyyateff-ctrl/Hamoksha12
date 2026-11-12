import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const distHtmlPath = path.join(rootDir, 'dist', 'index.html');
const indexHtmlPath = path.join(rootDir, 'index.html');
const capturePath = path.join(rootDir, 'dist', '.standalone-capture.json');

if (!fs.existsSync(distHtmlPath)) {
  console.error('dist/index.html does not exist. Run vite build first.');
  process.exit(1);
}

let rawCss = '';
let rawJs = '';

if (fs.existsSync(capturePath)) {
  const captured = JSON.parse(fs.readFileSync(capturePath, 'utf-8'));
  rawCss = captured.css || '';
  rawJs = captured.js || '';
}

if (!rawCss || !rawJs) {
  const distHtml = fs.readFileSync(distHtmlPath, 'utf-8');
  if (!rawCss) {
    const styleMatch = distHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/);
    if (!styleMatch) {
      console.error('Could not locate compiled CSS in dist/index.html');
      process.exit(1);
    }
    rawCss = styleMatch[1];
  }
  if (!rawJs) {
    const moduleMatch = distHtml.match(/<script type="module"[^>]*>([\s\S]*?)<\/script>/);
    if (!moduleMatch) {
      console.error('Could not locate compiled JavaScript in dist/index.html');
      process.exit(1);
    }
    rawJs = moduleMatch[1];
  }
}

// Escape any closing script/style tag sequences inside inline bundles so HTML parsers never truncate them
const safeCss = rawCss.replace(/<\/style/gi, '<\\/style');
const safeJs = rawJs.replace(/<\/script/gi, '<\\/script');

function buildCleanHtml({ includeMarkers }) {
  const styleBlock = includeMarkers
    ? `<!-- START_STANDALONE_STYLE -->
    <style id="hamoksha-compiled-css">__CSS_PLACEHOLDER__</style>
    <!-- END_STANDALONE_STYLE -->`
    : `<style id="hamoksha-compiled-css">__CSS_PLACEHOLDER__</style>`;

  const scriptBlock = includeMarkers
    ? `<!-- START_STANDALONE_BUNDLE -->
    <script id="hamoksha-compiled-js">__JS_PLACEHOLDER__</script>
    <!-- END_STANDALONE_BUNDLE -->`
    : `<script id="hamoksha-compiled-js">__JS_PLACEHOLDER__</script>`;

  const template = `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <title>حموكشة للدعاية وإعلانات المشروعات الصغيرة</title>
    <meta name="description" content="الموقع الرسمي لحموكشة المتخصص في عمل الإعلانات ودعم وتكبير المشروعات الصغيرة والناشئة في محافظة سوهاج وجهينة ومراكزها." />
    <meta property="og:title" content="حموكشة للدعاية وإعلانات المشروعات الصغيرة" />
    <meta property="og:description" content="الموقع الرسمي لحموكشة المتخصص في عمل الإعلانات ودعم وتكبير المشروعات الصغيرة والناشئة في محافظة سوهاج وجهينة ومراكزها." />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="ar_EG" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="حموكشة للدعاية وإعلانات المشروعات الصغيرة" />
    <meta name="twitter:description" content="الموقع الرسمي لحموكشة المتخصص في عمل الإعلانات ودعم وتكبير المشروعات الصغيرة والناشئة في محافظة سوهاج وجهينة ومراكزها." />

    <!-- Google Fonts: Cairo & Alexandria for modern Arabic typography -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;600;700;800;900&family=Cairo:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">

    <!-- Schema.org Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "حموكشة للدعاية والإعلانات",
      "description": "عمل الإعلانات للمحلات ودعم المشروعات الجديدة والصغيرة",
      "telephone": "+201226438938",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "جهينة الغربية",
        "addressRegion": "محافظة سوهاج",
        "addressCountry": "EG"
      },
      "areaServed": [
        "جهينة الغربية", "جهينة الشرقية", "طهطا", "طما", "المراغة",
        "سوهاج", "أخميم", "ساقلتة", "المنشأة", "جرجا", "البلينا", "دار السلام", "العسيرات"
      ],
      "url": "https://wa.me/201226438938"
    }
    </script>

    <!-- Theme Color: Deep Olive-Lemon Base with Primary Lemon Yellow Accent -->
    <meta name="theme-color" content="#151c07" />
    ${styleBlock}
  </head>
  <body class="bg-[var(--bg-page)] text-[var(--text-on-dark)] font-sans selection:bg-[var(--lemon-primary)] selection:text-[var(--text-on-lemon)] min-h-screen">
    <div id="root"></div>
    ${scriptBlock}
  </body>
</html>
`;

  const cssMarker = '__CSS_PLACEHOLDER__';
  const jsMarker = '__JS_PLACEHOLDER__';
  const cssIdx = template.indexOf(cssMarker);
  let out = template.slice(0, cssIdx) + safeCss + template.slice(cssIdx + cssMarker.length);
  const jsIdx = out.indexOf(jsMarker);
  out = out.slice(0, jsIdx) + safeJs + out.slice(jsIdx + jsMarker.length);
  return out;
}

fs.writeFileSync(indexHtmlPath, buildCleanHtml({ includeMarkers: true }), 'utf-8');
console.log('[Standalone Sync] Rewrote root index.html directly with full compiled site');

fs.writeFileSync(distHtmlPath, buildCleanHtml({ includeMarkers: false }), 'utf-8');
console.log('[Standalone Sync] Wrote optimized production dist/index.html cleanly');
