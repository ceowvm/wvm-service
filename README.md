# WVM Analytics V3

Готовая демоверсия с двумя инструментами:

- анализ конкурентов;
- анализ YouTube-каналов по нише, языкам и выбранным столбцам.

## Реализовано

- сине-чёрный фирменный стиль WVM;
- выбор инструмента на главной странице;
- отдельное количество каналов для каждого языка;
- обязательные поля YouTube: название, ссылка, подписчики;
- дополнительные поля: теги, описание, рубрики, форматы;
- предварительный расчёт кредитов по формуле: оценка API × 3 × курс 90 ₽/$;
- деморежим без списания;
- OpenAI Responses API и web search;
- фоновая задача `background: true`;
- ожидание до 9 минут;
- 3 автоматических перезапуска задачи;
- повторные проверки при 429/500/502/503/504;
- защита от ошибки `status: undefined`;
- CSV;
- подробные логи Netlify.

## Загрузка

Рекомендуется создать новый GitHub-репозиторий `wvm-analytics-v3`, чтобы старая версия сохранилась.

1. Распакуйте архив.
2. Загрузите в GitHub содержимое папки `wvm-analytics-v3`.
3. В Netlify: Add new project → Import an existing project → GitHub.
4. Добавьте секретную переменную `OPENAI_API_KEY`.
5. При необходимости добавьте `OPENAI_MODEL=gpt-5.6`.
6. Trigger deploy → Clear cache and deploy site.

## Логи ошибок

Netlify → Logs → Functions:

- `analysis-start`;
- `analysis-status`.

Ключевые записи:

- `ANALYSIS_STARTED`;
- `ANALYSIS_COMPLETED`;
- `OPENAI_START_ERROR`;
- `OPENAI_STATUS_ERROR`;
- `OPENAI_STATUS_MISSING`;
- `OPENAI_TASK_FAILED`;
- `OPENAI_INVALID_JSON`.

## Логотип

Файл: `public/assets/logo.svg`.

Он сделан в сине-чёрном направлении WVM по материалам библиотеки. При необходимости точный экспорт оригинального логотипа можно положить по тому же пути без изменения кода.
