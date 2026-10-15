export async function onRequestPost() {
  return new Response(JSON.stringify({ok:true}), {headers:{
    'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',
    'Set-Cookie':'hhh_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
  }});
}