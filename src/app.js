import {articles,checkedOn,release,sources} from './data.js';
import {createRenderer} from './render.js';
const main=document.querySelector('main'),base=new URL(document.querySelector('base').href).pathname;
const page=createRenderer({articles,checkedOn,release,sources},base);
function route(){const u=new URL(location.href);u.pathname='/'+u.pathname.slice(base.length);return u;}
function render(){main.innerHTML=page(route());document.title=(main.querySelector('h1')?.textContent||'首页')+' · 绿梦：时空之声 Wiki';document.querySelector('link[rel=canonical]').href=location.origin+base+route().pathname.replace(/^\//,'');document.querySelectorAll('.sidebar a,.topbar nav a').forEach(a=>{if(new URL(a.href).pathname===location.pathname)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});bindSearch();window.scrollTo({top:0});}
function navigate(url,replace=false){history[replace?'replaceState':'pushState'](null,'',url);render();main.focus({preventScroll:true});}
function search(event){event.preventDefault();const form=new FormData(event.currentTarget),params=new URLSearchParams();for(const key of ['q','category']){const value=String(form.get(key)||'').trim();if(value)params.set(key,value.slice(0,120));}navigate(base+'catalog/'+(params.size?'?'+params:''));}
function bindSearch(){main.querySelectorAll('form[role=search]').forEach(form=>form.addEventListener('submit',search));}
document.addEventListener('click',event=>{const a=event.target.closest('a');if(!a||a.target||a.download||event.button||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;const url=new URL(a.href);if(url.origin!==location.origin||!url.pathname.startsWith(base)||url.hash)return;event.preventDefault();navigate(url);});
document.querySelector('.skip').addEventListener('click',event=>{event.preventDefault();main.focus();main.scrollIntoView();});document.querySelector('.header-search').addEventListener('submit',search);window.addEventListener('popstate',render);
if(location.hash.startsWith('#/')){const old=new URL(location.hash.slice(1),location.origin),p=old.pathname.replace(/^\//,'').replace(/\/$/,'');navigate(base+(p?p+'/':'')+old.search,true);}else render();
