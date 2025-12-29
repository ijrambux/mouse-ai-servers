// Vercel Serverless Function - proxy لتجاوز CORS عند الحاجة
// ضع هذا الملف في مجلد "api" في المشروع (api/proxy.js)
// ملاحظة أمان: افحص allowedDomains أو اتركه فارغاً فقط للاختبار.
import fetch from 'node-fetch';

const allowedDomains = []; // مصفوفة نطاقات مسموح بها. [] = السماح بكل الدومينات (غير مستحسن للإنتاج)

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
    if (allowedDomains.length > 0 && !allowedDomains.includes(parsed.hostname)) {
      res.status(403).send('Domain not allowed: ' + parsed.hostname);
      return;
    }

    const upstream = await fetch(decoded, { timeout: 15000 });
    if (!upstream.ok) {
      res.status(upstream.status).send('Upstream error: ' + upstream.statusText);
      return;
    }

    const contentType = upstream.headers.get('content-type') || 'text/plain; charset=utf-8';
    const text = await upstream.text();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=59');
    res.status(200).send(text);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy error: ' + (err.message || String(err)));
  }
}
