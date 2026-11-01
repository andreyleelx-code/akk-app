// Local dictionaries: no translation service receives questionnaire data.
const supported=['ru','kk','en','ko'];
let language='ru';try{language=localStorage.getItem('akk2:language')||'ru'}catch{}if(!supported.includes(language))language='ru';
const dictionaries=await fetch(new URL('./translations.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('Dictionary unavailable');return r.json()}).catch(()=>({}));
const originals=new WeakMap(),attributes=new WeakMap();
const normalize=s=>s.replace(/\s+/g,' ').trim();
function lookup(text){if(language==='ru')return text;const dict=dictionaries[language]||{};if(dict[text])return dict[text];const upper=text===text.toUpperCase()&&/[А-ЯЁ]/.test(text);if(upper){const key=Object.keys(dict).find(k=>k.toUpperCase()===text);if(key)return dict[key].toUpperCase()}return null}
function translate(text){const clean=normalize(text);let value=lookup(clean);if(value===null){const match=clean.match(/^(.*?)(\s*[↗→↓⌄↻*]+)$/u);if(match){const base=lookup(match[1].trim());if(base)value=base+match[2]}}
 if(value===null){value=clean;for(const part of clean.split(/( · |: | \/ )/)){const found=lookup(part);if(found)value=value.replace(part,found)}
 for(const prefix of ['Мои отклики','Ваше избранное','Найдено:','Совпало интересов:','Подбор по вашим интересам:']){if(value.startsWith(prefix)){const t=lookup(prefix);if(t)value=t+value.slice(prefix.length)}}}
 return text.replace(text.trim(),value||clean)}
function pass(){observer.disconnect();document.documentElement.lang=language;
 document.querySelectorAll('option').forEach(o=>{if(!o.hasAttribute('value'))o.value=o.textContent});
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){const parent=node.parentElement;if(!parent||parent.closest('script,style,[data-no-translate],.member-card p,.member-card h3,textarea,option[value="ru"],option[value="kk"],option[value="en"],option[value="ko"]'))continue;if(!normalize(node.nodeValue))continue;let record=originals.get(node);if(!record||node.nodeValue!==record.last)record={source:node.nodeValue};const output=translate(record.source);record.last=output;originals.set(node,record);if(node.nodeValue!==output)node.nodeValue=output}
 document.querySelectorAll('[aria-label],[placeholder],[title]').forEach(el=>{if(el.closest('[data-no-translate]'))return;let records=attributes.get(el)||{};for(const attr of ['aria-label','placeholder','title']){if(!el.hasAttribute(attr))continue;let r=records[attr],v=el.getAttribute(attr);if(!r||v!==r.last)r={source:v};r.last=translate(r.source);records[attr]=r;if(v!==r.last)el.setAttribute(attr,r.last)}attributes.set(el,records)});
 const select=document.getElementById('language-select');if(select)select.value=language;
 observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','placeholder','title']});}
let scheduled=false;const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;pass()})});
document.addEventListener('change',e=>{if(e.target.id==='language-select'){language=e.target.value;try{localStorage.setItem('akk2:language',language)}catch{}pass()}});
pass();
