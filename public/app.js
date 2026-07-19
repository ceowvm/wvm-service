const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

let tool = "competitors";
let lastPayload;
let rows = [];
let cols = [];
let token = 0;
let pTimer;
let eTimer;
let startTime;

const regions = [
  ["ady", "Республика Адыгея"],
  ["altai-rep", "Республика Алтай"],
  ["bash", "Республика Башкортостан"],
  ["bury", "Республика Бурятия"],
  ["dag", "Республика Дагестан"],
  ["ing", "Республика Ингушетия"],
  ["kab", "Кабардино-Балкарская Республика"],
  ["kalm", "Республика Калмыкия"],
  ["karach", "Карачаево-Черкесская Республика"],
  ["karel", "Республика Карелия"],
  ["komi", "Республика Коми"],
  ["mari", "Республика Марий Эл"],
  ["mord", "Республика Мордовия"],
  ["sakha", "Республика Саха (Якутия)"],
  ["ossetia", "Республика Северная Осетия — Алания"],
  ["tatar", "Республика Татарстан"],
  ["tyva", "Республика Тыва"],
  ["udm", "Удмуртская Республика"],
  ["khak", "Республика Хакасия"],
  ["chech", "Чеченская Республика"],
  ["chuv", "Чувашская Республика"],
  ["altai-krai", "Алтайский край"],
  ["zab", "Забайкальский край"],
  ["kam", "Камчатский край"],
  ["krasnodar", "Краснодарский край"],
  ["krasnoyarsk", "Красноярский край"],
  ["perm", "Пермский край"],
  ["prim", "Приморский край"],
  ["stav", "Ставропольский край"],
  ["khab", "Хабаровский край"],
  ["amur", "Амурская область"],
  ["arkh", "Архангельская область"],
  ["astr", "Астраханская область"],
  ["belg", "Белгородская область"],
  ["bry", "Брянская область"],
  ["vlad", "Владимирская область"],
  ["volg", "Волгоградская область"],
  ["volog", "Вологодская область"],
  ["vor", "Воронежская область"],
  ["ivan", "Ивановская область"],
  ["irk", "Иркутская область"],
  ["kalin", "Калининградская область"],
  ["kaluga", "Калужская область"],
  ["kem", "Кемеровская область — Кузбасс"],
  ["kirov", "Кировская область"],
  ["kost", "Костромская область"],
  ["kurg", "Курганская область"],
  ["kursk", "Курская область"],
  ["len", "Ленинградская область"],
  ["lip", "Липецкая область"],
  ["mag", "Магаданская область"],
  ["mos-ob", "Московская область"],
  ["mur", "Мурманская область"],
  ["nnov", "Нижегородская область"],
  ["novg", "Новгородская область"],
  ["novosib", "Новосибирская область"],
  ["omsk", "Омская область"],
  ["oren", "Оренбургская область"],
  ["orel", "Орловская область"],
  ["penza", "Пензенская область"],
  ["pskov", "Псковская область"],
  ["rost", "Ростовская область"],
  ["ryaz", "Рязанская область"],
  ["sam", "Самарская область"],
  ["sarat", "Саратовская область"],
  ["sakhalin", "Сахалинская область"],
  ["sverd", "Свердловская область"],
  ["smol", "Смоленская область"],
  ["tamb", "Тамбовская область"],
  ["tver", "Тверская область"],
  ["tomsk", "Томская область"],
  ["tula", "Тульская область"],
  ["tyumen", "Тюменская область"],
  ["ulyan", "Ульяновская область"],
  ["chel", "Челябинская область"],
  ["yar", "Ярославская область"],
  ["moscow", "Москва"],
  ["spb", "Санкт-Петербург"],
  ["jew", "Еврейская автономная область"],
  ["nen", "Ненецкий автономный округ"],
  ["khmao", "Ханты-Мансийский автономный округ — Югра"],
  ["chuk", "Чукотский автономный округ"],
  ["yanao", "Ямало-Ненецкий автономный округ"]
];

const languages = [
  ["lang-ru", "Русский"], ["lang-en", "Английский"], ["lang-es", "Испанский"],
  ["lang-pt", "Португальский"], ["lang-de", "Немецкий"], ["lang-fr", "Французский"],
  ["lang-it", "Итальянский"], ["lang-tr", "Турецкий"], ["lang-ar", "Арабский"],
  ["lang-hi", "Хинди"], ["lang-zh", "Китайский"], ["lang-ja", "Японский"],
  ["lang-ko", "Корейский"], ["lang-id", "Индонезийский"], ["lang-vi", "Вьетнамский"],
  ["lang-th", "Тайский"], ["lang-pl", "Польский"], ["lang-uk", "Украинский"],
  ["lang-nl", "Нидерландский"], ["lang-sv", "Шведский"], ["lang-no", "Норвежский"],
  ["lang-da", "Датский"], ["lang-fi", "Финский"], ["lang-cs", "Чешский"],
  ["lang-ro", "Румынский"], ["lang-el", "Греческий"], ["lang-he", "Иврит"],
  ["lang-fa", "Персидский"], ["lang-bn", "Бенгальский"], ["lang-ms", "Малайский"]
];

const competitorTargets = new Map();
const youtubeTargets = new Map();

function fillSelects() {
  $("#cRegionSelect").innerHTML = '<option value="">Добавить регион России</option>' +
    regions.map(([id, label]) => `<option value="${id}">${label}</option>`).join("");

  $("#youtubeTargetSelect").innerHTML = '<option value="">Добавить язык канала</option>' +
    languages.map(([id, label]) => `<option value="${id}">${label}</option>`).join("");
}

function lookup(list, id) {
  return list.find(([x]) => x === id)?.[1] || id;
}

function clamp(v, a, b, d) {
  v = parseInt(v, 10);
  return Number.isNaN(v) ? d : Math.min(b, Math.max(a, v));
}

function renderSelected(container, map, kind) {
  const el = $(container);
  el.innerHTML = [...map.values()].map((x) => `
    <div class="selected-item" data-id="${x.id}">
      <span title="${x.label}">${x.label}</span>
      <input class="target-count" type="number" min="1" max="50" value="${x.count}" aria-label="Количество для ${x.label}">
      <button type="button" class="remove-target" aria-label="Удалить ${x.label}">×</button>
    </div>`).join("");

  el.querySelectorAll(".target-count").forEach((input) => {
    input.addEventListener("input", () => {
      const id = input.closest(".selected-item").dataset.id;
      map.get(id).count = clamp(input.value, 1, 50, 5);
      updateSummary();
    });
  });
  el.querySelectorAll(".remove-target").forEach((button) => {
    button.addEventListener("click", () => {
      map.delete(button.closest(".selected-item").dataset.id);
      renderSelected(container, map, kind);
      updateSummary();
    });
  });
}

function addCompetitorRegion() {
  const id = $("#cRegionSelect").value;
  if (!id) return;
  if (!competitorTargets.has(id)) competitorTargets.set(id, { id, label: lookup(regions, id), count: 5 });
  $("#cRegionSelect").value = "";
  renderSelected("#competitorRegions", competitorTargets, "region");
  updateSummary();
}

function addYoutubeTarget() {
  const id = $("#youtubeTargetSelect").value;
  if (!id) return;
  const label = lookup(languages, id);
  if (!youtubeTargets.has(id)) youtubeTargets.set(id, { id, type: "language", code: id, label, count: 5 });
  $("#youtubeTargetSelect").value = "";
  renderSelected("#youtubeTargets", youtubeTargets, "youtube");
  updateSummary();
}

function payload() {
  if (tool === "competitors") {
    return {
      tool,
      niche: $("#cNiche").value.trim(),
      regions: [...competitorTargets.values()].map((x) => ({ id: x.id, label: x.label, count: clamp(x.count, 1, 50, 5) })),
      extraColumns: []
    };
  }
  return {
    tool,
    niche: $("#yNiche").value.trim(),
    targets: [...youtubeTargets.values()].map((x) => ({ type: x.type, id: x.code, label: x.label, count: clamp(x.count, 1, 50, 5) })),
    extraColumns: $$(".extra:checked").map((x) => x.value)
  };
}

function requestedCount(p) {
  return p.tool === "competitors"
    ? (p.regions || []).reduce((s, x) => s + x.count, 0)
    : (p.targets || []).reduce((s, x) => s + x.count, 0);
}

function credits(p) {
  const fx = 90;
  const margin = 3;
  const n = requestedCount(p);
  if (!n) return 0;
  if (p.tool === "competitors") return Math.max(9, Math.ceil((0.004 + n * 0.0045 + Math.ceil(n / 4) * 0.01) * margin * fx));
  const extras = (p.extraColumns || []).length;
  return Math.max(12, Math.ceil((0.006 + n * (0.0055 + extras * 0.0018) + Math.ceil(n / 3) * 0.01) * margin * fx));
}

function updateSummary() {
  const p = payload();
  const items = p.tool === "competitors" ? p.regions : p.targets;
  $("#summaryType").textContent = p.tool === "competitors" ? "Анализ конкурентов" : "Анализ YouTube-каналов";
  $("#summaryTargetsTitle").textContent = p.tool === "competitors" ? "Регионы и количество компаний" : "Языки и количество каналов";
  $("#summaryTargets").innerHTML = items.length
    ? items.map((x) => `<li>${x.label} — ${x.count}</li>`).join("")
    : `<li>${p.tool === "competitors" ? "Выберите хотя бы один регион" : "Выберите хотя бы один язык"}</li>`;
  $("#summaryCount").textContent = `${requestedCount(p)} ${p.tool === "competitors" ? "компаний" : "каналов"}`;
  $("#credits").textContent = credits(p);
}

function switchTool(next) {
  tool = next;
  $$(".tool-card").forEach((card) => {
    const active = card.dataset.tool === tool;
    card.classList.toggle("active", active);
    card.querySelector(".selector").textContent = active ? "✓" : "";
  });
  $("#competitorsForm").classList.toggle("hidden", tool !== "competitors");
  $("#youtubeForm").classList.toggle("hidden", tool !== "youtube");
  $("#sectionSubtitle").textContent = tool === "competitors" ? "Анализ конкурентов" : "Анализ YouTube-каналов";
  updateSummary();
}

function progress(attemptNo) {
  clearInterval(pTimer); clearInterval(eTimer); startTime = Date.now();
  $("#status").classList.remove("hidden"); $("#results").classList.add("hidden"); $("#error").classList.add("hidden");
  $("#attempt").textContent = `Попытка ${attemptNo} из 3`;
  let p = 5; setProg(p, "Запускаем исследование", "Создаём фоновую задачу.");
  pTimer = setInterval(() => {
    p = Math.min(91, p + (p < 45 ? 4 : p < 75 ? 2 : 1));
    setProg(p, p < 30 ? "Ищем релевантные источники" : p < 65 ? "Собираем и проверяем данные" : "Формируем итоговую таблицу", p < 65 ? "Отсеиваем дубли и неподтверждённые данные." : "Задача выполняется в фоне. Не закрывайте вкладку.");
  }, 3500);
  eTimer = setInterval(() => $("#elapsed").textContent = `${Math.floor((Date.now() - startTime) / 1000)} сек.`, 1000);
  $("#status").scrollIntoView({ behavior: "smooth" });
}

function setProg(p, title, description) {
  $("#percent").textContent = `${p}%`; $("#bar").style.width = `${p}%`; $("#statusTitle").textContent = title; $("#statusText").textContent = description;
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function post(url, data, timeout = 30000) {
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { method: "POST", signal: controller.signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const text = await response.text(); let json = {};
    try { json = text ? JSON.parse(text) : {}; } catch { throw Object.assign(new Error(`Некорректный ответ сервера (${response.status}).`), { retryable: true }); }
    if (!response.ok) throw Object.assign(new Error(json.error || `Ошибка сервера: ${response.status}`), { retryable: json.retryable !== false && [408, 429, 500, 502, 503, 504].includes(response.status) });
    return json;
  } catch (error) {
    if (error.name === "AbortError") throw Object.assign(new Error("Сервер отвечает дольше обычного."), { retryable: true });
    throw error;
  } finally { clearTimeout(timer); }
}

async function poll(id, p, myToken) {
  const deadline = Date.now() + 9 * 60 * 1000; let transient = 0; let empty = 0;
  while (Date.now() < deadline) {
    if (myToken !== token) throw new Error("Запущена новая задача.");
    await sleep(3500);
    try {
      const data = await post("/api/analysis/status", { taskId: id, payload: p }, 25000);
      if (!data.status) { if (++empty <= 4) continue; throw Object.assign(new Error("Сервер не вернул статус задачи."), { retryable: true }); }
      empty = 0; transient = 0;
      if (["queued", "in_progress"].includes(data.status)) continue;
      if (data.status === "completed") {
        if (!Array.isArray(data.rows) || !data.rows.length) throw Object.assign(new Error("Подтверждённые результаты не найдены."), { retryable: false });
        return data;
      }
      throw Object.assign(new Error(data.error || "Задача завершилась с технической ошибкой."), { retryable: data.retryable !== false });
    } catch (error) {
      if (error.retryable && transient < 5) { transient++; $("#statusText").textContent = `Временная задержка. Продолжаем ждать — повтор ${transient} из 5.`; await sleep(2500 * transient); continue; }
      throw error;
    }
  }
  throw Object.assign(new Error("Анализ выполняется дольше девяти минут. Уменьшите объём запроса."), { retryable: true });
}

async function execute(p, myToken) {
  let last;
  for (let attempt = 1; attempt <= 3; attempt++) {
    progress(attempt);
    try {
      const started = await post("/api/analysis/start", p);
      if (!started.taskId) throw Object.assign(new Error("Нет идентификатора задачи."), { retryable: true });
      return await poll(started.taskId, p, myToken);
    } catch (error) {
      last = error;
      if (!error.retryable || attempt === 3) throw error;
      $("#statusText").textContent = `Временная ошибка. Запускаем попытку ${attempt + 1} из 3…`;
      await sleep(3500 * attempt);
    }
  }
  throw last;
}

function esc(v) { return String(v ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"); }
function render(data, p) {
  rows = data.rows; cols = data.columns;
  $("#thead").innerHTML = `<tr>${cols.map((c) => `<th>${esc(c.label)}</th>`).join("")}</tr>`;
  $("#tbody").innerHTML = rows.map((row) => `<tr>${cols.map((c) => { const value = row[c.key] ?? "Не найдено"; return `<td>${c.type === "url" && /^https?:/i.test(value) ? `<a href="${esc(value)}" target="_blank" rel="noopener">${esc(value)}</a>` : esc(value)}</td>`; }).join("")}</tr>`).join("");
  $("#meta").textContent = `Получено ${rows.length} из ${requestedCount(p)}. Оценка: ${credits(p)} кредитов.`;
  setProg(100, "Анализ завершён", "Готовим результат."); clearInterval(pTimer); clearInterval(eTimer); $("#results").classList.remove("hidden");
  setTimeout(() => { $("#status").classList.add("hidden"); $("#results").scrollIntoView({ behavior: "smooth" }); }, 500);
}
function showError(error) {
  clearInterval(pTimer); clearInterval(eTimer); $("#status").classList.add("hidden"); $("#results").classList.add("hidden");
  $("#errorText").textContent = error.message || "Произошла временная ошибка."; $("#error").classList.remove("hidden"); $("#error").scrollIntoView({ behavior: "smooth" });
}
async function run(p) {
  const myToken = ++token; lastPayload = p; $("#submit").disabled = true; $("#submit").innerHTML = "Анализируем…";
  try { const data = await execute(p, myToken); if (myToken === token) render(data, p); }
  catch (error) { if (myToken === token) showError(error); }
  finally { if (myToken === token) { $("#submit").disabled = false; $("#submit").innerHTML = 'Запустить анализ <span>↗</span>'; } }
}

fillSelects();
competitorTargets.set("moscow", { id: "moscow", label: "Москва", count: 10 });
renderSelected("#competitorRegions", competitorTargets, "region");

$("#addCompetitorRegion").addEventListener("click", addCompetitorRegion);
$("#addYoutubeTarget").addEventListener("click", addYoutubeTarget);
$("#cRegionSelect").addEventListener("change", addCompetitorRegion);
$("#youtubeTargetSelect").addEventListener("change", addYoutubeTarget);
$$(".tool-card").forEach((card) => card.addEventListener("click", () => switchTool(card.dataset.tool)));
document.addEventListener("input", updateSummary);
document.addEventListener("change", updateSummary);

$("#form").addEventListener("submit", (event) => {
  event.preventDefault();
  const p = payload();
  const error = !p.niche ? "Укажите нишу или тематику." :
    p.tool === "competitors" && !p.regions.length ? "Выберите хотя бы один регион." :
    p.tool === "youtube" && !p.targets.length ? "Выберите хотя бы один язык или регион." : "";
  error ? showError(new Error(error)) : run(p);
});
$("#retry").addEventListener("click", () => lastPayload && run(lastPayload));
$("#download").addEventListener("click", () => {
  if (!rows.length) return;
  const data = [cols.map((c) => c.label), ...rows.map((r) => cols.map((c) => r[c.key] ?? ""))];
  const csv = "\uFEFF" + data.map((line) => line.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(";")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a"); a.href = url; a.download = tool === "youtube" ? "youtube-ai-marketing.csv" : "competitors-ai-marketing.csv"; a.click(); URL.revokeObjectURL(url);
});
updateSummary();
