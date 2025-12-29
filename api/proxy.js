// بسيط وآمن نسبياً: يسمح بجلب محتوى فقط من قائمة allowedDomains
// قم بتعديل allowedDomains حسب حاجتك أو اجعلها فارغة للسماح بالكل (غير مستحسن لأسباب أمان).
import fetch from 'node-fetch';

const allowedDomains = [
  'iptv-org.github.io',
  'cdn3.wowza.com',
  'example.com' // اضف هنا المجالات الموثوقة لديك
];

// مسموح أيضاً جعل allowedDomains=[] للسماح المؤقت (تحذير أمني)
export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) {
    res.status(400).send('Missing url parameter');
    return;
  }

  let decoded;
  try { decoded = decodeURIComponent(url); } catch(e) { decoded = url; }

  try {
    const parsed = new URL(decoded);
    // أجري تحقق بسيط على النطاق
    if (allowedDomains.length > 0 && !allowedDomains.includes(parsed.hostname)) {
      res.status(403).send('Domain not allowed: ' + parsed.hostname);
      return;
    }

    // Fetch the remote resource
    const upstream = await fetch(decoded, { timeout: 15000 });
    if (!upstream.ok) {
      res.status(upstream.status).send('Upstream error: ' + upstream.statusText);
      return;
    }

    // نصحة: نمرّر المحتوى كما هو مع رؤوس مناسبة
    const text = await upstream.text();
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'text/plain; charset=utf-8');
    // اسمح بالوصول من الموقع نفسه (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=59');
    res.status(200).send(text);
  } catch (err) {
    res.status(500).send('Proxy error: ' + (err.message || err.toString()));
  }
}
