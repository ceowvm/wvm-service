const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let tool="competitors",lastPayload,rows=[],cols=[],token=0,pTimer,eTimer,startTime;
const regions=[["ady","Республика Адыгея"],["altai-rep","Республика Алтай"],["bash","Республика Башкортостан"],["bury","Республика Бурятия"],["dag","Республика Дагестан"],["ing","Республика Ингушетия"],["kab","Кабардино-Балкарская Республика"],["kalm","Республика Калмыкия"],["karach","Карачаево-Черкесская Республика"],["karel","Республика Карелия"],["komi","Республика Коми"],["mari","Республика Марий Эл"],["mord","Республика Мордовия"],["sakha","Республика Саха (Якутия)"],["ossetia","Республика Северная Осетия — Алания"],["tatar","Республика Татарстан"],["tyva","Республика Тыва"],["udm","Удмуртская Республика"],["khak","Республика Хакасия"],["chech","Чеченская Республика"],["chuv","Чувашская Республика"],["altai-krai","Алтайский край"],["zab","Забайкальский край"],["kam","Камчатский край"],["krasnodar","Краснодарский край"],["krasnoyarsk","Красноярский край"],["perm","Пермский край"],["prim","Приморский край"],["stav","Ставропольский край"],["khab","Хабаровский край"],["amur","Амурская область"],["arkh","Архангельская область"],["astr","Астраханская область"],["belg","Белгородская область"],["bry","Брянская область"],["vlad","Владимирская область"],["volg","Волгоградская область"],["volog","Вологодская область"],["vor","Воронежская область"],["ivan","Ивановская область"],["irk","Иркутская область"],["kalin","Калининградская область"],["kaluga","Калужская область"],["kem","Кемеровская область — Кузбасс"],["kirov","Кировская область"],["kost","Костромская область"],["kurg","Курганская область"],["kursk","Курская область"],["len","Ленинградская область"],["lip","Липецкая область"],["mag","Магаданская область"],["mos-ob","Московская область"],["mur","Мурманская область"],["nnov","Нижегородская область"],["novg","Новгородская область"],["novosib","Новосибирская область"],["omsk","Омская область"],["oren","Оренбургская область"],["orel","Орловская область"],["penza","Пензенская область"],["pskov","Псковская область"],["rost","Ростовская область"],["ryaz","Рязанская область"],["sam","Самарская область"],["sarat","Саратовская область"],["sakhalin","Сахалинская область"],["sverd","Свердловская область"],["smol","Смоленская область"],["tamb","Тамбовская область"],["tver","Тверская область"],["tomsk","Томская область"],["tula","Тульская область"],["tyumen","Тюменская область"],["ulyan","Ульяновская область"],["chel","Челябинская область"],["yar","Ярославская область"],["moscow","Москва"],["spb","Санкт-Петербург"],["jew","Еврейская автономная область"],["nen","Ненецкий автономный округ"],["khmao","Ханты-Мансийский автономный округ — Югра"],["chuk","Чукотский автономный округ"],["yanao","Ямало-Ненецкий автономный округ"]];
const languages=[["lang-ru","Русский"],["lang-en","Английский"],["lang-es","Испанский"],["lang-pt","Португальский"],["lang-de","Немецкий"],["lang-fr","Французский"],["lang-it","Итальянский"],["lang-tr","Турецкий"],["lang-ar","Арабский"],["lang-hi","Хинди"],["lang-zh","Китайский"],["lang-ja","Японский"],["lang-ko","Корейский"],["lang-id","Индонезийский"],["lang-vi","Вьетнамский"],["lang-th","Тайский"],["lang-pl","Польский"],["lang-uk","Украинский"],["lang-nl","Нидерландский"],["lang-sv","Шведский"],["lang-no","Норвежский"],["lang-da","Датский"],["lang-fi","Финский"],["lang-cs","Чешский"],["lang-ro","Румынский"],["lang-el","Греческий"],["lang-he","Иврит"],["lang-fa","Персидский"],["lang-bn","Бенгальский"],["lang-ms","Малайский"]];
const competitorTargets=new Map(),youtubeTargets=new Map();
const clamp=(v,a,b,d)=>{v=parseInt(v,10);return Number.isNaN(v)?d:Math.min(b,Math.max(a,v));};
const lookup=(list,id)=>list.find(([x])=>x===id)?.[1]||id;
function fillSelects(){
 $("#cRegionSelect").innerHTML='<option value="">Добавить регион России</option>'+regions.map(([id,l])=>`<option value="${id}">${l}</option>`).join("");
 $("#youtubeTargetSelect").innerHTML='<option value="">Добавить язык канала</option>'+languages.map(([id,l])=>`<option value="${id}">${l}</option>`).join("");
}
function renderSelected(sel,map){
 const el=$(sel); el.innerHTML=[...map.values()].map(x=>`<div class="selected-item" data-id="${x.id}"><span title="${x.label}">${x.label}</span><input class="target-count" type="number" min="1" max="50" value="${x.count}"><button type="button" class="remove-target">×</button></div>`).join("");
 el.querySelectorAll(".target-count").forEach(i=>i.addEventListener("input",()=>{map.get(i.closest(".selected-item").dataset.id).count=clamp(i.value,1,50,5);updateSummary();}));
 el.querySelectorAll(".remove-target").forEach(b=>b.addEventListener("click",()=>{map.delete(b.closest(".selected-item").dataset.id);renderSelected(sel,map);updateSummary();}));
}
function addCompetitorRegion(){const id=$("#cRegionSelect").value;if(!id)return;if(!competitorTargets.has(id))competitorTargets.set(id,{id,label:lookup(regions,id),count:5});$("#cRegionSelect").value="";renderSelected("#competitorRegions",competitorTargets);updateSummary();}
function addYoutubeTarget(){const id=$("#youtubeTargetSelect").value;if(!id)return;if(!youtubeTargets.has(id))youtubeTargets.set(id,{id,label:lookup(languages,id),count:5});$("#youtubeTargetSelect").value="";renderSelected("#youtubeTargets",youtubeTargets);updateSummary();}
function payload(){
 if(tool==="competitors")return{tool,niche:$("#cNiche").value.trim(),regions:[...competitorTargets.values()],extraColumns:[]};
 if(tool==="youtube")return{tool,niche:$("#yNiche").value.trim(),targets:[...youtubeTargets.values()].map(x=>({type:"language",id:x.id,label:x.label,count:clamp(x.count,1,50,5)})),extraColumns:$$(".extra:checked").map(x=>x.value)};
 return{tool,query:$("#tQuery").value.trim(),count:clamp($("#tCount").value,1,100,20),language:$("#tLanguage").value,minSubscribers:clamp($("#tMinSubs").value,0,1000000000,0),maxSubscribers:$("#tMaxSubs").value?clamp($("#tMaxSubs").value,0,1000000000,0):null,activity:$("#tActivity").value,filters:$$(".t-filter:checked").map(x=>x.value),extraColumns:$$(".t-extra:checked").map(x=>x.value)};
}
function requestedCount(p){return p.tool==="competitors"?(p.regions||[]).reduce((s,x)=>s+x.count,0):p.tool==="youtube"?(p.targets||[]).reduce((s,x)=>s+x.count,0):p.count||0;}
function credits(p){
 const n=requestedCount(p);if(!n)return 0;const margin=3,fx=90;
 if(p.tool==="competitors")return Math.max(9,Math.ceil((.004+n*.0045+Math.ceil(n/4)*.01)*margin*fx));
 if(p.tool==="youtube")return Math.max(12,Math.ceil((.006+n*(.0055+(p.extraColumns||[]).length*.0018)+Math.ceil(n/3)*.01)*margin*fx));
 const extras=(p.extraColumns||[]).length,filters=(p.filters||[]).length;
 const estimatedApiRub=2.5+n*.14+extras*n*.025+filters*.35;
 return Math.max(15,Math.ceil(estimatedApiRub*margin));
}
function updateSummary(){
 const p=payload(),n=requestedCount(p);const names={competitors:"Анализ конкурентов",youtube:"Анализ YouTube-каналов",telegram:"Поиск Telegram-каналов"};
 $("#summaryType").textContent=names[p.tool];
 if(p.tool==="competitors"){$("#summaryTargetsTitle").textContent="Регионы и количество компаний";$("#summaryTargets").innerHTML=p.regions.length?p.regions.map(x=>`<li>${x.label} — ${x.count}</li>`).join(""):"<li>Выберите хотя бы один регион</li>";$("#summaryCount").textContent=`${n} компаний`;}
 else if(p.tool==="youtube"){$("#summaryTargetsTitle").textContent="Языки и количество каналов";$("#summaryTargets").innerHTML=p.targets.length?p.targets.map(x=>`<li>${x.label} — ${x.count}</li>`).join(""):"<li>Выберите хотя бы один язык</li>";$("#summaryCount").textContent=`${n} каналов`;}
 else{$("#summaryTargetsTitle").textContent="Параметры Telegram";$("#summaryTargets").innerHTML=`<li>${p.query||"Укажите тематику"}</li><li>${p.language==="any"?"Любой язык":$("#tLanguage").selectedOptions[0].text}</li><li>От ${p.minSubscribers.toLocaleString("ru-RU")} подписчиков</li>`;$("#summaryCount").textContent=`${n} каналов`;}
 $("#credits").textContent=credits(p);
}
function switchTool(next){
 tool=next;$$('.tool-card').forEach(c=>{const a=c.dataset.tool===tool;c.classList.toggle('active',a);c.querySelector('.selector').textContent=a?'✓':'';});
 $("#competitorsForm").classList.toggle("hidden",tool!=="competitors");$("#youtubeForm").classList.toggle("hidden",tool!=="youtube");$("#telegramForm").classList.toggle("hidden",tool!=="telegram");
 $("#sectionSubtitle").textContent={competitors:"Анализ конкурентов",youtube:"Анализ YouTube-каналов",telegram:"Поиск Telegram-каналов"}[tool];updateSummary();
}
function showError(error){clearInterval(pTimer);clearInterval(eTimer);$("#status").classList.add("hidden");$("#results").classList.add("hidden");$("#errorText").textContent=error.message||"Произошла ошибка.";$("#error").classList.remove("hidden");$("#error").scrollIntoView({behavior:"smooth"});}
async function post(url,data){const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});const text=await r.text();let json={};try{json=text?JSON.parse(text):{}}catch{throw new Error(`Некорректный ответ сервера (${r.status}).`)}if(!r.ok)throw new Error(json.error||`Ошибка сервера: ${r.status}`);return json;}
async function run(p){
 if(p.tool==="telegram"){showError(new Error("Интерфейс Telegram готов. Для запуска поиска нужно подключить серверный Telegram API ID и API Hash."));return;}
 lastPayload=p;$("#submit").disabled=true;$("#submit").textContent="Анализируем…";
 try{const started=await post("/api/analysis/start",p);if(!started.taskId)throw new Error("Нет идентификатора задачи.");showError(new Error("Задача запущена, но сервер статусов недоступен в версии GitHub Pages."));}catch(e){showError(e)}finally{$("#submit").disabled=false;$("#submit").innerHTML='Запустить анализ <span>↗</span>';}
}
fillSelects();competitorTargets.set("moscow",{id:"moscow",label:"Москва",count:10});renderSelected("#competitorRegions",competitorTargets);
$("#addCompetitorRegion").addEventListener("click",addCompetitorRegion);$("#addYoutubeTarget").addEventListener("click",addYoutubeTarget);$("#cRegionSelect").addEventListener("change",addCompetitorRegion);$("#youtubeTargetSelect").addEventListener("change",addYoutubeTarget);
$$(".tool-card").forEach(c=>c.addEventListener("click",()=>switchTool(c.dataset.tool)));document.addEventListener("input",updateSummary);document.addEventListener("change",updateSummary);
$("#form").addEventListener("submit",e=>{e.preventDefault();const p=payload();const error=p.tool==="competitors"&&!p.niche?"Укажите нишу или тематику.":p.tool==="competitors"&&!p.regions.length?"Выберите хотя бы один регион.":p.tool==="youtube"&&!p.niche?"Укажите нишу или тематику.":p.tool==="youtube"&&!p.targets.length?"Выберите хотя бы один язык.":p.tool==="telegram"&&!p.query?"Укажите тематику или ключевые слова.":"";error?showError(new Error(error)):run(p);});
$("#retry").addEventListener("click",()=>lastPayload&&run(lastPayload));$("#download").addEventListener("click",()=>{if(!rows.length)return;});updateSummary();