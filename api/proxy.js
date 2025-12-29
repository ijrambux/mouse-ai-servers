// استبدل fetchM3U الأصلية بهذه الدالة في index.html (client)
async function fetchM3U(url, useProxy = false, timeoutMs = 15000) {
  try {
    const finalUrl = useProxy ? `/api/proxy?url=${encodeURIComponent(url)}` : url;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(finalUrl, { signal: controller.signal });
    clearTimeout(id);

    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status} ${res.statusText}` };
    }
    const text = await res.text();
    return { ok: true, text };
  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  }
}

// مثال استخدام مع fallback تلقائي
async function loadM3UAndInsert(url) {
  // محاولة مباشرة
  let r = await fetchM3U(url, false);
  if (!r.ok) {
    console.warn('Direct fetch failed:', r.error, 'Trying proxy...');
    // حاول مع البروكسي المحلي (Vercel function)
    r = await fetchM3U(url, true);
    if (!r.ok) {
      // عرض خطأ واضح للمستخدم
      showNotification(`فشل تحميل المايلو (${r.error}). جرب الاستيراد يدوياً أو تأكد من CORS أو استخدم proxy.`, 'error');
      return;
    }
  }
  // إذا نجح: parse and cache
  const parsed = parseM3U(r.text, url);
  parsedM3UCache[url] = parsed;
  localStorage.setItem('m3u_cache', JSON.stringify(parsedM3UCache));
  rebuildAllChannels();
  renderChannels();
  showNotification(`تم تحميل ${parsed.length} قناة من ${url}`, 'success');
}
