const json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra }
});
const enc = new TextEncoder();
const b64url = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
async function hmac(secret, value) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), {name:'HMAC',hash:'SHA-256'}, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(value)));
}
async function derivePasswordHash(password, saltHex) {
  const salt = Uint8Array.from(saltHex.match(/.{2}/g) || [], x => parseInt(x,16));
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:310000}, key, 256);
  return [...new Uint8Array(bits)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
export async function onRequestPost({ request, env }) {
  if (!env.HHH_USERNAME || !env.HHH_PASSWORD_HASH || !env.HHH_SESSION_SECRET)
    return json({error:'Máy chủ chưa được cấu hình tài khoản đăng nhập.'}, 503);
  let body;
  try { body = await request.json(); } catch { return json({error:'Dữ liệu đăng nhập không hợp lệ.'},400); }
  const username = String(body.username || '').trim(), password = String(body.password || '');
  if (username.length > 120 || password.length > 1024) return json({error:'Thông tin đăng nhập không hợp lệ.'},400);
  const parts = env.HHH_PASSWORD_HASH.split(':');
  if (parts.length !== 2 || !/^[a-f0-9]{32,128}$/i.test(parts[0]) || !/^[a-f0-9]{64}$/i.test(parts[1]))
    return json({error:'Cấu hình mật khẩu trên máy chủ không hợp lệ.'},503);
  const computed = await derivePasswordHash(password, parts[0]);
  if (username !== env.HHH_USERNAME || computed !== parts[1].toLowerCase())
    return json({error:'Tên đăng nhập hoặc mật khẩu chưa chính xác.'},401);
  const now = Math.floor(Date.now()/1000);
  const payload = b64url(enc.encode(JSON.stringify({sub:username,iat:now,exp:now+8*60*60})));
  const signature = await hmac(env.HHH_SESSION_SECRET, payload);
  return json({ok:true},200,{'Set-Cookie':`hhh_session=${payload}.${signature}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800`});
}