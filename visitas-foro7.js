// visitas-foro7.js — Contador de visitas para paginas de Foro 7
(function(){
var SB='https://nzpujmlienzfetqcgsxz.supabase.co';
var K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cHVqbWxpZW56ZmV0cWNnc3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2ODYzMzYsImV4cCI6MjA5MDI2MjMzNn0.xl3lsb-KYj5tVLKTnzpbsdEGoV9ySnswH4eyRuyEH1s';
var H={'apikey':K,'Authorization':'Bearer '+K,'Content-Type':'application/json'};
var SITE_SLUG=window.FORO7_SITE_SLUG||'foro7';
function sid(){var s=localStorage.getItem('foro7_sid');if(!s){s=crypto.randomUUID();localStorage.setItem('foro7_sid',s);}return s;}
var widget=document.createElement('div');
widget.style.cssText='position:fixed;bottom:16px;right:16px;background:rgba(0,0,0,.7);color:#fff;padding:6px 14px;border-radius:20px;font-size:.8rem;z-index:9000;backdrop-filter:blur(4px);pointer-events:none;';
widget.textContent='\uD83D\uDC41 \u2026';
document.body.appendChild(widget);
async function init(){
  try{
    var r=await fetch(SB+'/rest/v1/eventos?slug=eq.'+SITE_SLUG+'&select=id&limit=1',{headers:H});
    var d=await r.json();
    if(!d[0]||!d[0].id){widget.remove();return;}
    var eid=d[0].id;
    var pagina=location.pathname.replace(/^\/|\/$/g,'').replace(/\.html$/,'')||'index';
    fetch(SB+'/rest/v1/visitas',{method:'POST',headers:Object.assign({},H,{'Prefer':'return=minimal'}),body:JSON.stringify({evento_id:eid,pagina:pagina,session_id:sid()})});
    var c=await fetch(SB+'/rest/v1/visitas?evento_id=eq.'+eid+'&select=id',{headers:Object.assign({},H,{'Prefer':'count=exact','Range-Unit':'items','Range':'0-0'})});
    var range=c.headers.get('content-range')||'';
    var total=parseInt((range.split('/')[1])||'0')||0;
    widget.textContent='\uD83D\uDC41 '+total.toLocaleString('es-MX');
  }catch(e){widget.remove();}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();
