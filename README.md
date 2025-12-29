```markdown
# MOUSE AI IPTV Merge — جاهز للنشر على Vercel

المحتويات:
- index.html — الواجهة الرئيسية (يستخدم fetchM3U مع fallback إلى /api/proxy)
- api/proxy.js — دالة Vercel Serverless Proxy (لتجاوز CORS عند تحميل M3U)
- vercel.json — إعداد نشر Vercel
- manifest.json — تعريف PWA
- sw.js — Service Worker لتخزين واجهة التطبيق محلياً

تشغيل ونشر سريع على Vercel:
1. ضع كل الملفات في مستودع GitHub.
2. افتح vercel.com → Import Project → اختر المستودع.
   - Framework: Other
   - Build Command: (اتركه فارغاً)
   - Output Directory: `.`
3. انشر المشروع. بعد النشر:
   - دامنه سيكون your-project.vercel.app
   - الواجهة ستستخدم دالة البروكسي عند فشل جلب ملفات M3U مباشرة بسبب CORS.

ملاحظات مهمة:
- api/proxy.js يسمح الآن بالوصول إلى أي نطاق إذا تركت `allowedDomains = []`. لأمان أفضل اضف نطاقات موثوقة فقط.
- Service Worker يعمل فقط عبر HTTP/HTTPS — لا تعمل PWA إذا فتحت index.html مباشرة من ملف system (file://).
- لتجاوز مشاكل CORS عند جلب m3u من iptv-org أو مصادر أخرى نستخدم `/api/proxy?url=ENCODED_URL`.

تلميحات للتشغيل المحلي:
- شغّل خادم بسيط داخل مجلد المشروع:
  - Python 3: `python -m http.server 8000`
  - افتح: http://localhost:8000

إذا رغبت، أستطيع:
- تعديل api/proxy.js ليقبل قائمة allowedDomains التي تزوّدها.
- إضافة خطوة نشر تلقائي (GitHub Actions) أو ملف Docker + Nginx.
- تحسين واجهة المستخدم (فحص صحة السيرفرات، health-check، أو Virtualized list للقنوات الكبيرة).

أرسل لي أي ملف تريد تغييره أو أي نطاقات تريد إضافتها إلى `allowedDomains` وسأحدّث الملفات فوراً.
```
