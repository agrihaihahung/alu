const enc = new TextEncoder();
const json = (data, status=401) => new Response(JSON.stringify(data), {
  status, headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}
});
const b64urlDecode = value => {
  const normalized = value.replace(/-/g,'+').replace(/_/g,'/');
  return atob(normalized + '='.repeat((4-normalized.length%4)%4));
};
async function verifyHmac(secret, payload, signature) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), {name:'HMAC',hash:'SHA-256'}, false, ['verify']);
  const normalized = signature.replace(/-/g,'+').replace(/_/g,'/');
  const sig = Uint8Array.from(atob(normalized + '='.repeat((4-normalized.length%4)%4)), c=>c.charCodeAt(0));
  return crypto.subtle.verify('HMAC', key, sig, enc.encode(payload));
}
export async function onRequest({request,env,next}) {
  const url = new URL(request.url), path = url.pathname;
  if (path === '/login' || path === '/login/' || path === '/login/index.html' ||
      path === '/api/login' || path === '/api/logout' ||
      path === '/assets/css/login.css' || path === '/assets/js/login.js' ||
      path === '/favicon.ico') return next();
  const cookieHeader = request.headers.get('Cookie') || '';
  const match = cookieHeader.match(/(?:^|;\s*)hhh_session=([^;]+)/);
  if (match && env.HHH_SESSION_SECRET && env.HHH_USERNAME) {
    const token = match[1], dot = token.lastIndexOf('.');
    if (dot > 0) {
      const payload = token.slice(0,dot), signature = token.slice(dot+1);
      try {
        const valid = await verifyHmac(env.HHH_SESSION_SECRET, payload, signature);
        const decoded = JSON.parse(b64urlDecode(payload));
        if (valid && decoded.exp > Math.floor(Date.now()/1000) && decoded.sub === env.HHH_USERNAME) {
          const response = await next();
          const type = response.headers.get('Content-Type') || '';
          if (type.includes('text/html')) {
            return new HTMLRewriter().on('body', {
              element(el) {
                el.append(`<button id="hhhLogoutButton" type="button" style="position:fixed;right:16px;bottom:16px;z-index:9999;border:1px solid #d9e1ec;border-radius:999px;background:#fff;color:#32445c;padding:9px 14px;box-shadow:0 4px 16px #17243a18;font:600 12px Arial,sans-serif;cursor:pointer">↪ Đăng xuất</button><script>
                document.getElementById('hhhLogoutButton')?.addEventListener('click',async()=>{try{await fetch('/api/logout',{method:'POST',credentials:'same-origin'})}finally{location.replace('/login/index.html')}})
                </script>`, {html:true});
              }
            }).transform(response);
          }
          return response;
        }
      } catch (_) {}
    }
  }
  if (path.startsWith('/api/')) return json({error:'Phiên đăng nhập hết hạn hoặc chưa đăng nhập.'});
  return Response.redirect(new URL('/login/index.html?next=' + encodeURIComponent(path + url.search), url.origin), 302);
}