export const H = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
export const jr = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: H });
export const clean = (value, n = 500) => String(value ?? "").trim().slice(0, n);
export const num = (value, a, b, d) => { value = parseInt(value, 10); return Number.isNaN(value) ? d : Math.min(b, Math.max(a, value)); };

const regionMap = new Map([
  ["ady","Республика Адыгея"],
  ["altai-rep","Республика Алтай"],
  ["bash","Республика Башкортостан"],
  ["bury","Республика Бурятия"],
  ["dag","Республика Дагестан"],
  ["ing","Республика Ингушетия"],
  ["kab","Кабардино-Балкарская Республика"],
  ["kalm","Республика Калмыкия"],
  ["karach","Карачаево-Черкесская Республика"],
  ["karel","Республика Карелия"],
  ["komi","Республика Коми"],
  ["mari","Республика Марий Эл"],
  ["mord","Республика Мордовия"],
  ["sakha","Республика Саха (Якутия)"],
  ["ossetia","Республика Северная Осетия — Алания"],
  ["tatar","Республика Татарстан"],
  ["tyva","Республика Тыва"],
  ["udm","Удмуртская Республика"],
  ["khak","Республика Хакасия"],
  ["chech","Чеченская Республика"],
  ["chuv","Чувашская Республика"],
  ["altai-krai","Алтайский край"],
  ["zab","Забайкальский край"],
  ["kam","Камчатский край"],
  ["krasnodar","Краснодарский край"],
  ["krasnoyarsk","Красноярский край"],
  ["perm","Пермский край"],
  ["prim","Приморский край"],
  ["stav","Ставропольский край"],
  ["khab","Хабаровский край"],
  ["amur","Амурская область"],
  ["arkh","Архангельская область"],
  ["astr","Астраханская область"],
  ["belg","Белгородская область"],
  ["bry","Брянская область"],
  ["vlad","Владимирская область"],
  ["volg","Волгоградская область"],
  ["volog","Вологодская область"],
  ["vor","Воронежская область"],
  ["ivan","Ивановская область"],
  ["irk","Иркутская область"],
  ["kalin","Калининградская область"],
  ["kaluga","Калужская область"],
  ["kem","Кемеровская область — Кузбасс"],
  ["kirov","Кировская область"],
  ["kost","Костромская область"],
  ["kurg","Курганская область"],
  ["kursk","Курская область"],
  ["len","Ленинградская область"],
  ["lip","Липецкая область"],
  ["mag","Магаданская область"],
  ["mos-ob","Московская область"],
  ["mur","Мурманская область"],
  ["nnov","Нижегородская область"],
  ["novg","Новгородская область"],
  ["novosib","Новосибирская область"],
  ["omsk","Омская область"],
  ["oren","Оренбургская область"],
  ["orel","Орловская область"],
  ["penza","Пензенская область"],
  ["pskov","Псковская область"],
  ["rost","Ростовская область"],
  ["ryaz","Рязанская область"],
  ["sam","Самарская область"],
  ["sarat","Саратовская область"],
  ["sakhalin","Сахалинская область"],
  ["sverd","Свердловская область"],
  ["smol","Смоленская область"],
  ["tamb","Тамбовская область"],
  ["tver","Тверская область"],
  ["tomsk","Томская область"],
  ["tula","Тульская область"],
  ["tyumen","Тюменская область"],
  ["ulyan","Ульяновская область"],
  ["chel","Челябинская область"],
  ["yar","Ярославская область"],
  ["moscow","Москва"],
  ["spb","Санкт-Петербург"],
  ["jew","Еврейская автономная область"],
  ["nen","Ненецкий автономный округ"],
  ["khmao","Ханты-Мансийский автономный округ — Югра"],
  ["chuk","Чукотский автономный округ"],
  ["yanao","Ямало-Ненецкий автономный округ"]
]);
const languageMap = new Map([
  ["lang-ru","Русский"],["lang-en","Английский"],["lang-es","Испанский"],["lang-pt","Португальский"],["lang-de","Немецкий"],["lang-fr","Французский"],["lang-it","Итальянский"],["lang-tr","Турецкий"],["lang-ar","Арабский"],["lang-hi","Хинди"],["lang-zh","Китайский"],["lang-ja","Японский"],["lang-ko","Корейский"],["lang-id","Индонезийский"],["lang-vi","Вьетнамский"],["lang-th","Тайский"],["lang-pl","Польский"],["lang-uk","Украинский"],["lang-nl","Нидерландский"],["lang-sv","Шведский"],["lang-no","Норвежский"],["lang-da","Датский"],["lang-fi","Финский"],["lang-cs","Чешский"],["lang-ro","Румынский"],["lang-el","Греческий"],["lang-he","Иврит"],["lang-fa","Персидский"],["lang-bn","Бенгальский"],["lang-ms","Малайский"]
]);

export function validate(body) {
  const tool = clean(body?.tool, 30);
  const niche = clean(body?.niche, 160);
  const extras = Array.isArray(body?.extraColumns) ? [...new Set(body.extraColumns.map((x) => clean(x, 30)))] : [];
  if (!["competitors", "youtube"].includes(tool)) return { error: "Неизвестный тип анализа." };
  if (!niche) return { error: "Укажите нишу." };

  if (tool === "competitors") {
    const regions = Array.isArray(body?.regions) ? body.regions.map((x) => {
      const id = clean(x?.id, 10); if (!regionMap.has(id)) return null;
      return { id, label: regionMap.get(id), count: num(x?.count, 1, 50, 5) };
    }).filter(Boolean) : [];
    if (!regions.length) return { error: "Выберите хотя бы один регион." };
    if (regions.reduce((s, x) => s + x.count, 0) > 100) return { error: "За один запуск можно запросить не более 100 компаний." };
    return { payload: { tool, niche, regions, extraColumns: [] } };
  }

  const targets = Array.isArray(body?.targets) ? body.targets.map((x) => {
    const id = clean(x?.id, 20);
    if (!languageMap.has(id)) return null;
    return { type: "language", id, label: languageMap.get(id), count: num(x?.count, 1, 50, 5) };
  }).filter(Boolean) : [];
  if (!targets.length) return { error: "Выберите хотя бы один язык канала." };
  if (targets.reduce((s, x) => s + x.count, 0) > 100) return { error: "За один запуск можно запросить не более 100 каналов." };
  return { payload: { tool, niche, targets, extraColumns: extras.filter((x) => ["email","phone","tags","description","rubrics","formats"].includes(x)) } };
}

export function definition(p) {
  if (p.tool === "competitors") {
    const requested = p.regions.reduce((s, x) => s + x.count, 0);
    const allocation = p.regions.map((x) => `${x.label}: ${x.count}`).join("\n");
    return {
      name: "competitors", requested,
      columns: [
        { key: "region", label: "Регион", type: "text" },
        { key: "name", label: "Название", type: "text" },
        { key: "website", label: "Сайт", type: "url" },
        { key: "phone", label: "Телефон", type: "text" }
      ],
      schema: { type: "object", additionalProperties: false, properties: { rows: { type: "array", maxItems: 100, items: { type: "object", additionalProperties: false, properties: { region: { type: "string" }, name: { type: "string" }, website: { type: "string" }, phone: { type: "string" } }, required: ["region","name","website","phone"] } } }, required: ["rows"] },
      prompt: `Найди действующие компании по нише: ${p.niche}. Распределение по регионам:\n${allocation}\nИспользуй веб-поиск. Для каждой строки укажи соответствующий регион. Только официальный сайт. Телефон только с официального сайта, иначе «Не найден». Не используй каталоги, карты и соцсети вместо сайта. Не придумывай данные. Удали дубли. Соблюдай запрошенное распределение; лучше вернуть меньше строк, чем неподтверждённые сведения.`
    };
  }

  const labels = { email:"Email", phone:"Телефон", tags:"Теги канала", description:"Описание канала", rubrics:"Рубрики", formats:"Форматы контента" };
  const props = { target: { type:"string" }, channel_name:{type:"string"}, channel_url:{type:"string"}, subscribers:{type:"string"} };
  const req = ["target","channel_name","channel_url","subscribers"];
  p.extraColumns.forEach((x) => { props[x] = { type:"string" }; req.push(x); });
  const requested = p.targets.reduce((s, x) => s + x.count, 0);
  const targetText = p.targets.map((x) => `Язык — ${x.label}: ${x.count}`).join("\n");
  return {
    name: "youtube_channels", requested,
    columns: [
      { key:"target", label:"Язык канала", type:"text" },
      { key:"channel_name", label:"Название канала", type:"text" },
      { key:"channel_url", label:"Ссылка на канал", type:"url" },
      { key:"subscribers", label:"Подписчики", type:"text" },
      ...p.extraColumns.map((key) => ({ key, label: labels[key], type:"text" }))
    ],
    schema: { type:"object", additionalProperties:false, properties:{ rows:{ type:"array", maxItems:100, items:{ type:"object", additionalProperties:false, properties:props, required:req } } }, required:["rows"] },
    prompt: `Собери YouTube-каналы по нише: ${p.niche}. Распределение:\n${targetText}\nИспользуй веб-поиск и проверяй каждый канал. В поле target укажи язык канала из задания. channel_url — только ссылка на канал, не на видео. subscribers — видимое количество или «Не найдено». Не дублируй и не придумывай. Дополнительные поля: ${p.extraColumns.map((x) => labels[x]).join(", ") || "нет"}. Email и телефон указывай только если они публично найдены на официальной странице канала, сайте автора или в официальных соцсетях; иначе «Не найдено». tags — до 10 тегов; description — 1–2 фактических предложения; rubrics — повторяющиеся рубрики; formats — Shorts, интервью, обзоры и другие форматы. Соблюдай количество по каждому выбранному языку.`
  };
}

export function outText(r) { for (const i of r?.output ?? []) if (i.type === "message") for (const c of i.content ?? []) if (c.type === "output_text" && c.text) return c.text; return ""; }
export function normalize(items, d) {
  const seen = new Set(); const res = [];
  for (const x of Array.isArray(items) ? items : []) {
    const row = {}; d.columns.forEach((c) => row[c.key] = clean(x?.[c.key], c.key === "description" ? 1200 : 600) || "Не найдено");
    const raw = d.name === "competitors" ? row.website : row.channel_url;
    const key = String(raw).toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "");
    if (!key || key.includes("не найден") || seen.has(key)) continue;
    seen.add(key); res.push(row); if (res.length >= d.requested) break;
  }
  return res;
}
export const retryable = (status) => [408,409,429,500,502,503,504].includes(status);
