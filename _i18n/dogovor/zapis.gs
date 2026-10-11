/* «Запись на встречу» voznesenskaya.ch/zapis/ — вторая часть проекта Apps Script «Договоры коучинга — скрипт» (решение Ирины 11.10.2026,
   документ проекта «zapis-kalendar.md»). Тот же проект и тот же адрес …/exec, что у договора: doGet и doPost в dogovory-kouchinga.gs передают сюда
   всё, что относится к записи.

   Как устроено:
   1) Страница спрашивает свободное время (?a=slots&t=intro). Скрипт смотрит занятость во всех календарях Ирины обоих аккаунтов (события; заметки на весь день и длиннее суток не в счёт),
      берёт будни 9:00–18:00 по Цюриху без праздников кантона Цюрих, не раньше чем через 3 дня и не дальше чем на 60 дней, с перерывом
      15 минут вокруг встречи (вокруг разбора на 3 часа — 30 минут). Наружу уходит только время начала свободных окон, без чужих событий.
   2) Клиентка выбирает время и отправляет запрос. Скрипт ещё раз проверяет, что время свободно, ставит в календарь «Коучинг с Ириной
      Вознесенской» (voznesenskaya.iryna@gmail.com) предварительную бронь и пишет строку в таблицу «Запись на встречи — voznesenskaya.ch».
      — Знакомство и встреча программы (договор уже есть): Ирине письмо с кнопками «Подтвердить» и «Отклонить», ответить за 48 часов.
      — Менторская встреча и разбор на 3 часа: сначала договор (ссылка /dogovor/?z=…), на подпись 24 часа. Когда договор подписан, Ирине
        приходит одно письмо с кнопкой «Подтвердить договор и время».
   3) После подтверждения бронь становится встречей, клиентке уходит письмо со ссылкой Zoom и файлом для календаря.
   4) Раз в час (zapisChas): напоминание клиентке за 24 часа, напоминание Ирине о запросах без ответа, освобождение брони через 24 часа
      без договора и через 48 часов без ответа.
   5) Клиентка может отменить или перенести запись по своей ссылке (бесплатно не позже чем за 24 часа до начала).
   6) Пакеты (11.10.2026): «Личная сессия» 3 встречи, «Моя цель — мой путь» 10, «Сопровождение» 2. Клиентка выбирает время сразу для всех
      встреч или только для первой; остальные — позже по своей ссылке (kind 'zapis' + add). Все встречи пакета — одна группа (колонки «Пакет»
      и «В пакете»), один договор, одно подтверждение Ирины и одно письмо. Клиентке встреча 60 минут, в календаре Ирины 90 (запас 30) + перерыв 15.

   Ставится один раз: функция zapisUstanovka (из редактора, «Выполнить»), до этого в «Службы» добавить Google Calendar API.
   Свойства скрипта: ZOOM_URL — постоянная ссылка Zoom Ирины; CONTRACT_PREVIEW = 1, пока договор скрыт (ссылка на договор с ?preview=1). */

var ZCAL = 'voznesenskaya.iryna@gmail.com';   // календарь «Коучинг с Ириной Вознесенской» (доступ на изменение у iryna.wiederkehr с 11.10.2026)
var ZBUSY_NAMES = ['🎀Personal', '💄Beauty & Sport', '💊 Doctors Termin', '👨‍👩‍👧‍👦 Family Time', '✔️ Family Tasks', '🌱 Обучение'];   // + основной календарь и ZCAL
var ZW = { from: 9 * 60, to: 18 * 60, step: 30, lead: 3, max: 60 };   // будни 9–18 по Цюриху, шаг 30 минут, через 3 дня … 60 дней
var ZT = {
  intro: { dur: 30, buf: 15, paid: false },
  mentor: { dur: 60, buf: 15, paid: true },
  razbor: { dur: 180, buf: 30, paid: true },
  prog: { dur: 60, buf: 15, paid: false, kv: true },
  /* пакеты (решение Ирины 11.10.2026): клиентке — 60 минут, в календаре Ирины 90 (res — 30 минут запаса), плюс перерыв 15;
     pk — сколько встреч, term — срок пакета в днях от первой встречи (3 встречи — 2 месяца, 10 — 5 месяцев, «Сопровождение» — месяц) */
  pk3: { dur: 60, res: 30, buf: 15, paid: true, pk: 3, term: 61 },
  flag: { dur: 60, res: 30, buf: 15, paid: true, pk: 10, term: 153 },
  support: { dur: 60, res: 30, buf: 15, paid: true, pk: 2, term: 31 }
};
var ZPROG = { snimok: 1, fund: 1, life: 1 };
var Z_HOLD_H = 24, Z_ANSWER_H = 48, Z_FREE_H = 24;
var Z_ACTIVE = { 'ждёт договор': 1, 'ждёт подтверждения': 1, 'подтверждена': 1 };
var ZHEAD = ['Номер', 'Создан (Цюрих)', 'Статус', 'Вид', 'Встреча', 'Программа', 'Начало (Цюрих)', 'Конец (Цюрих)', 'Начало, мс', 'Минут',
  'Часовой пояс', 'Язык', 'Имя', 'E-mail', 'Telegram или телефон', 'С чем приходит', 'Договор', 'Срок (Цюрих)', 'Срок, мс',
  'Подтверждено (Цюрих)', 'Напоминания', 'Отменено (Цюрих)', 'Кто отменил', 'Перенос с', 'Перенесено на', 'Событие', 'Ключ Ирины', 'Ключ клиентки', 'Согласия', 'Заметка', 'Пакет', 'В пакете'];
var ZC = {}; ZHEAD.forEach(function (h, i) { ZC[h] = i; });
var RX_ZP = /^ZP-(\d{8})-[2-9A-HJKMNP-Z]{4}$/;

/* ---------- тексты писем клиентке ---------- */
var ZM = {
  ru: {
    sign: 'Ирина Вознесенская\nкоуч, Alonira.ch AG · https://voznesenskaya.ch', hello: 'Здравствуй, {name}!',
    whatL: 'Встреча: {what}.', whenL: 'Время: {when}.',
    reqS: 'Запрос на встречу получен: {short}',
    reqB: '{hello}\n\nСпасибо, твой запрос получен.\n{whatL}\n{whenL}\n{resch}\nЭто время держится за тобой. Я подтвержу его письмом в течение двух дней. Если оно мне не подойдёт, я напишу, и ты сможешь выбрать другое.\n\nПосмотреть, перенести или отменить запрос: {manage}\n\n{sign}',
    resch: 'Это перенос встречи {old}. Пока я не подтвердила новое время, в силе остаётся прежнее.\n',
    holdS: 'Время держится за тобой 24 часа: подпиши договор',
    holdB: '{hello}\n\nТы выбрала время для встречи.\n{whatL}\n{whenL}\n\nЧтобы я могла подтвердить это время, подпиши, пожалуйста, договор о коучинге в течение 24 часов:\n{contract}\nЭто займёт несколько минут, бумага и скан не нужны. Если договор не будет подписан за 24 часа, время освободится.\n\nКогда договор подписан, я подтверждаю договор и время одним письмом, обычно в течение двух дней. Потом приходит счёт от Alonira.ch AG, оплатить его нужно до встречи.\n\nПосмотреть или отменить запись: {manage}\n\n{sign}',
    okS: 'Встреча подтверждена: {short}',
    okB: '{hello}\n\nЯ подтверждаю нашу встречу.\n{whatL}\n{whenL}\nГде: Zoom. {zoomL}\n\n{extra}Как подготовиться: найди тихое место, где тебя никто не отвлечёт, проверь интернет, камеру и микрофон. Подумай, с чем ты хочешь прийти и что хочешь унести с собой.\n\nВо вложении — файл для календаря. Добавить встречу в Google Календарь: {gcal}\n\nПеренести или отменить встречу бесплатно можно не позже чем за 24 часа до начала: {manage}\nЗа день до встречи я пришлю напоминание.\n\nДо встречи!\n{sign}',
    zoomL: 'Ссылка для входа: {zoom}', zoomNo: 'Ссылку для входа я пришлю отдельным письмом перед встречей.',
    exFree: 'Знакомство бесплатное и ни к чему не обязывает.\n\n',
    exKv: 'Договор о коучинге № {kv} с сегодняшнего дня, {today}, вступил в силу.{eu}\n\n',
    exProg: 'Встреча по договору № {kv}.\n\n',
    eu: ' Ты живёшь в стране Евросоюза или Европейской экономической зоны: 14 дней на отказ от договора считаются с сегодняшнего дня.',
    exPay: 'Счёт от Alonira.ch AG с QR-квитанцией придёт отдельным письмом. Оплатить его нужно до встречи. Если оплата не придёт к началу, мы перенесём встречу.\n\n',
    noS: 'Это время не подошло: выбери, пожалуйста, другое',
    noB: '{hello}\n\nСпасибо за запрос. К сожалению, время {when} мне не подходит.{msg}\n\nВыбери, пожалуйста, другое время: {again}\n\n{kvNote}{sign}',
    msg: '\n\nМоё сообщение: {msg}',
    kvNote: 'Твой договор № {kv} сохраняется. Когда ты выберешь новое время, я подтвержу договор и время вместе.\n\n',
    exp1S: 'Время освободилось',
    exp1B: '{hello}\n\nДоговор не был подписан за 24 часа, поэтому время {when} освободилось. Ничего страшного: если ты ещё хочешь встретиться, выбери время заново: {again}\n\nЕсли с договором что-то не получилось, ответь на это письмо или напиши мне в Telegram https://t.me/IrynaNeuroCoach.\n\n{sign}',
    exp2S: 'Прости, я не успела ответить',
    exp2B: '{hello}\n\nПрости, я не успела подтвердить время {when} за два дня, поэтому оно освободилось. Выбери, пожалуйста, другое время: {again}\n\nИли напиши мне в Telegram https://t.me/IrynaNeuroCoach, и мы договоримся.\n\n{sign}',
    cancelS: 'Встреча отменена: {short}',
    cancelB: '{hello}\n\nТы отменила встречу.\n{whatL}\n{whenL}\n\n{late}Если захочешь выбрать новое время: {again}\n\n{sign}',
    lateFree: 'Отмена бесплатная.\n\n',
    lateHeld: 'До начала оставалось меньше 24 часов, поэтому по условиям работы встреча считается проведённой. Если случилось что-то серьёзное и внезапное, например болезнь или срочное дело с ребёнком, ответь на это письмо, и мы найдём решение.\n\n',
    remS: 'Завтра наша встреча: {short}',
    remB: '{hello}\n\nНапоминаю о нашей встрече.\n{whatL}\n{whenL}\n{zoomL}\n\nЕсли не получается прийти, напиши мне как можно раньше: ответь на это письмо или напиши в Telegram https://t.me/IrynaNeuroCoach.\n\nДо встречи!\n{sign}',
    icsT: '☕ Встреча с Ириной Вознесенской: {type}',
    icsD: 'Встреча: {what}\nГде: Zoom {zoom}\nКак подготовиться: тихое место, интернет, камера и микрофон. Подумай, с чем ты хочешь прийти.\nПеренести или отменить (бесплатно не позже чем за 24 часа): {manage}\nИрина Вознесенская · запись на встречу: https://voznesenskaya.ch/zapis/',
    icsA: 'Через 30 минут — встреча с Ириной Вознесенской',
    your: 'по твоему времени', zur: 'по Цюриху',
    days: ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье'],
    months: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
    types: { intro: 'Знакомство, 30 минут, бесплатно', mentor: 'Менторская встреча, 1 час, 150 CHF', razbor: '{p}, разбор 3 часа, 249 CHF', prog: 'Встреча программы, 1 час', pk3: 'Личная сессия {n}, 60 минут', flag: '«Моя цель — мой путь», встреча {n}, 60 минут', support: 'Сопровождение, встреча {n}, 60 минут' },
    tshort: { intro: 'Знакомство', mentor: 'Менторская встреча', razbor: '{p}', prog: 'Встреча программы', pk3: 'Личная сессия {n}', flag: '«Моя цель — мой путь» · {n}', support: 'Сопровождение · {n}' },
    progs: { snimok: '«Снимок жизни»', fund: '«Мой фундамент»', life: '«Жизнь без сожалений»' },
    pkName: { pk3: 'Личная сессия: пакет из 3 встреч по 60 минут, 360 CHF', flag: '«Моя цель — мой путь»: 10 встреч по 60 минут', support: 'Сопровождение: 2 встречи по 60 минут' },
    of: 'из', nth: 'встреча {n}', whensL: 'Время встреч:\n{when}',
    laterP: 'Время для остальных встреч пакета ({left}) можно выбрать позже по ссылке «Моя запись»: {manage}\n\n',
    holdPS: 'Время держится за тобой 24 часа: подпиши договор',
    holdPB: '{hello}\n\nТы выбрала время для встреч.\n{whatL}\n{whenL}\n\n{later}Чтобы я могла подтвердить это время, подпиши, пожалуйста, договор о коучинге в течение 24 часов:\n{contract}\nЭто займёт несколько минут, бумага и скан не нужны. Если договор не будет подписан за 24 часа, время освободится.\n\nКогда договор подписан, я подтверждаю договор и все встречи одним письмом, обычно в течение двух дней. Потом приходит счёт от Alonira.ch AG, оплатить его нужно до первой встречи.\n\nПосмотреть или отменить запись: {manage}\n\n{sign}',
    reqPS: 'Запрос на встречи получен: {short}',
    reqPB: '{hello}\n\nСпасибо, твой запрос получен.\n{whatL}\n{whenL}\n\nЭто время держится за тобой. Я подтвержу его письмом в течение двух дней.\n\nПосмотреть, перенести или отменить: {manage}\n\n{sign}',
    okPS: 'Встречи подтверждены: {short}',
    okPB: '{hello}\n\nЯ подтверждаю наши встречи.\n{whatL}\n{whenL}\nГде: Zoom. {zoomL}\n\n{extra}{later}Как подготовиться: найди тихое место, где тебя никто не отвлечёт, проверь интернет, камеру и микрофон. Подумай, с чем ты хочешь прийти и что хочешь унести с собой.\n\nВо вложении — файл для календаря со всеми встречами. Добавить в Google Календарь:\n{gcal}\n\nПеренести или отменить любую встречу бесплатно можно не позже чем за 24 часа до её начала: {manage}\nЗа день до каждой встречи я пришлю напоминание.\n\nДо встречи!\n{sign}',
    noPS: 'Это время не подошло: выбери, пожалуйста, другое',
    noPB: '{hello}\n\nСпасибо за запрос. К сожалению, это время мне не подходит:\n{when}{msg}\n\nВыбери, пожалуйста, другое время: {again}\n\n{kvNote}{sign}',
    exp1PS: 'Время освободилось',
    exp1PB: '{hello}\n\nДоговор не был подписан за 24 часа, поэтому время освободилось:\n{when}\n\nНичего страшного: если ты ещё хочешь встретиться, выбери время заново: {again}\n\nЕсли с договором что-то не получилось, ответь на это письмо или напиши мне в Telegram https://t.me/IrynaNeuroCoach.\n\n{sign}',
    exp2PS: 'Прости, я не успела ответить',
    exp2PB: '{hello}\n\nПрости, я не успела подтвердить время за два дня, поэтому оно освободилось:\n{when}\n\nВыбери, пожалуйста, другое время: {again}\n\nИли напиши мне в Telegram https://t.me/IrynaNeuroCoach, и мы договоримся.\n\n{sign}',
    exPayP: 'Счёт от Alonira.ch AG с QR-квитанцией придёт отдельным письмом. Оплатить его нужно до первой встречи. Если оплата не придёт к началу, мы перенесём встречу.\n\n'
  },
  uk: {
    sign: 'Ірина Вознесенська\nкоуч, Alonira.ch AG · https://voznesenskaya.ch/uk/', hello: 'Привіт, {name}!',
    whatL: 'Зустріч: {what}.', whenL: 'Час: {when}.',
    reqS: 'Запит на зустріч отримано: {short}',
    reqB: '{hello}\n\nДякую, твій запит отримано.\n{whatL}\n{whenL}\n{resch}\nЦей час тримається за тобою. Я підтверджу його листом протягом двох днів. Якщо він мені не підійде, я напишу, і ти зможеш вибрати інший.\n\nПереглянути, перенести або скасувати запит: {manage}\n\n{sign}',
    resch: 'Це перенесення зустрічі {old}. Поки я не підтвердила новий час, чинним залишається попередній.\n',
    holdS: 'Час тримається за тобою 24 години: підпиши договір',
    holdB: '{hello}\n\nТи вибрала час для зустрічі.\n{whatL}\n{whenL}\n\nЩоб я могла підтвердити цей час, підпиши, будь ласка, договір про коучинг протягом 24 годин:\n{contract}\nЦе займе кілька хвилин, папір і скан не потрібні. Якщо договір не буде підписано за 24 години, час звільниться.\n\nКоли договір підписано, я підтверджую договір і час одним листом, зазвичай протягом двох днів. Потім надходить рахунок від Alonira.ch AG, оплатити його потрібно до зустрічі.\n\nПереглянути або скасувати запис: {manage}\n\n{sign}',
    okS: 'Зустріч підтверджено: {short}',
    okB: '{hello}\n\nЯ підтверджую нашу зустріч.\n{whatL}\n{whenL}\nДе: Zoom. {zoomL}\n\n{extra}Як підготуватися: знайди тихе місце, де тебе ніхто не відволікатиме, перевір інтернет, камеру й мікрофон. Подумай, з чим ти хочеш прийти і що хочеш забрати із собою.\n\nУ вкладенні — файл для календаря. Додати зустріч у Google Календар: {gcal}\n\nПеренести або скасувати зустріч безкоштовно можна не пізніше ніж за 24 години до початку: {manage}\nЗа день до зустрічі я надішлю нагадування.\n\nДо зустрічі!\n{sign}',
    zoomL: 'Посилання для входу: {zoom}', zoomNo: 'Посилання для входу я надішлю окремим листом перед зустріччю.',
    exFree: 'Знайомство безкоштовне і ні до чого не зобов’язує.\n\n',
    exKv: 'Договір про коучинг № {kv} від сьогодні, {today}, набрав чинності.{eu}\n\n',
    exProg: 'Зустріч за договором № {kv}.\n\n',
    eu: ' Ти живеш у країні Євросоюзу або Європейської економічної зони: 14 днів на відмову від договору рахуються від сьогодні.',
    exPay: 'Рахунок від Alonira.ch AG з QR-квитанцією прийде окремим листом. Оплатити його потрібно до зустрічі. Якщо оплата не надійде до початку, ми перенесемо зустріч.\n\n',
    noS: 'Цей час не підійшов: вибери, будь ласка, інший',
    noB: '{hello}\n\nДякую за запит. На жаль, час {when} мені не підходить.{msg}\n\nВибери, будь ласка, інший час: {again}\n\n{kvNote}{sign}',
    msg: '\n\nМоє повідомлення: {msg}',
    kvNote: 'Твій договір № {kv} зберігається. Коли ти вибереш новий час, я підтверджу договір і час разом.\n\n',
    exp1S: 'Час звільнився',
    exp1B: '{hello}\n\nДоговір не було підписано за 24 години, тому час {when} звільнився. Нічого страшного: якщо ти ще хочеш зустрітися, вибери час знову: {again}\n\nЯкщо з договором щось не вийшло, дай відповідь на цей лист або напиши мені в Telegram https://t.me/IrynaNeuroCoach.\n\n{sign}',
    exp2S: 'Вибач, я не встигла відповісти',
    exp2B: '{hello}\n\nВибач, я не встигла підтвердити час {when} за два дні, тому він звільнився. Вибери, будь ласка, інший час: {again}\n\nАбо напиши мені в Telegram https://t.me/IrynaNeuroCoach, і ми домовимося.\n\n{sign}',
    cancelS: 'Зустріч скасовано: {short}',
    cancelB: '{hello}\n\nТи скасувала зустріч.\n{whatL}\n{whenL}\n\n{late}Якщо захочеш вибрати новий час: {again}\n\n{sign}',
    lateFree: 'Скасування безкоштовне.\n\n',
    lateHeld: 'До початку залишалося менше 24 годин, тому за умовами роботи зустріч вважається проведеною. Якщо сталося щось серйозне і раптове, наприклад хвороба або термінова справа з дитиною, дай відповідь на цей лист, і ми знайдемо рішення.\n\n',
    remS: 'Завтра наша зустріч: {short}',
    remB: '{hello}\n\nНагадую про нашу зустріч.\n{whatL}\n{whenL}\n{zoomL}\n\nЯкщо не виходить прийти, напиши мені якомога раніше: дай відповідь на цей лист або напиши в Telegram https://t.me/IrynaNeuroCoach.\n\nДо зустрічі!\n{sign}',
    icsT: '☕ Зустріч з Іриною Вознесенською: {type}',
    icsD: 'Зустріч: {what}\nДе: Zoom {zoom}\nЯк підготуватися: тихе місце, інтернет, камера й мікрофон. Подумай, з чим ти хочеш прийти.\nПеренести або скасувати (безкоштовно не пізніше ніж за 24 години): {manage}\nІрина Вознесенська · запис на зустріч: https://voznesenskaya.ch/uk/zapis/',
    icsA: 'Через 30 хвилин — зустріч з Іриною Вознесенською',
    your: 'за твоїм часом', zur: 'за цюрихським часом',
    days: ['понеділок', 'вівторок', 'середа', 'четвер', 'п’ятниця', 'субота', 'неділя'],
    months: ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'],
    types: { intro: 'Знайомство, 30 хвилин, безкоштовно', mentor: 'Менторська зустріч, 1 година, 150 CHF', razbor: '{p}, розбір 3 години, 249 CHF', prog: 'Зустріч програми, 1 година', pk3: 'Особиста сесія {n}, 60 хвилин', flag: '«Моя мета — мій шлях», зустріч {n}, 60 хвилин', support: 'Супровід, зустріч {n}, 60 хвилин' },
    tshort: { intro: 'Знайомство', mentor: 'Менторська зустріч', razbor: '{p}', prog: 'Зустріч програми', pk3: 'Особиста сесія {n}', flag: '«Моя мета — мій шлях» · {n}', support: 'Супровід · {n}' },
    progs: { snimok: '«Знімок життя»', fund: '«Мій фундамент»', life: '«Життя без жалю»' },
    pkName: { pk3: 'Особиста сесія: пакет із 3 зустрічей по 60 хвилин, 360 CHF', flag: '«Моя мета — мій шлях»: 10 зустрічей по 60 хвилин', support: 'Супровід: 2 зустрічі по 60 хвилин' },
    of: 'з', nth: 'зустріч {n}', whensL: 'Час зустрічей:\n{when}',
    laterP: 'Час для решти зустрічей пакета ({left}) можна вибрати пізніше за посиланням «Мій запис»: {manage}\n\n',
    holdPS: 'Час тримається за тобою 24 години: підпиши договір',
    holdPB: '{hello}\n\nТи вибрала час для зустрічей.\n{whatL}\n{whenL}\n\n{later}Щоб я могла підтвердити цей час, підпиши, будь ласка, договір про коучинг протягом 24 годин:\n{contract}\nЦе займе кілька хвилин, папір і скан не потрібні. Якщо договір не буде підписано за 24 години, час звільниться.\n\nКоли договір підписано, я підтверджую договір і всі зустрічі одним листом, зазвичай протягом двох днів. Потім надходить рахунок від Alonira.ch AG, оплатити його потрібно до першої зустрічі.\n\nПереглянути або скасувати запис: {manage}\n\n{sign}',
    reqPS: 'Запит на зустрічі отримано: {short}',
    reqPB: '{hello}\n\nДякую, твій запит отримано.\n{whatL}\n{whenL}\n\nЦей час тримається за тобою. Я підтверджу його листом протягом двох днів.\n\nПереглянути, перенести або скасувати: {manage}\n\n{sign}',
    okPS: 'Зустрічі підтверджено: {short}',
    okPB: '{hello}\n\nЯ підтверджую наші зустрічі.\n{whatL}\n{whenL}\nДе: Zoom. {zoomL}\n\n{extra}{later}Як підготуватися: знайди тихе місце, де тебе ніхто не відволікатиме, перевір інтернет, камеру й мікрофон. Подумай, з чим ти хочеш прийти і що хочеш забрати із собою.\n\nУ вкладенні — файл для календаря з усіма зустрічами. Додати в Google Календар:\n{gcal}\n\nПеренести або скасувати будь-яку зустріч безкоштовно можна не пізніше ніж за 24 години до її початку: {manage}\nЗа день до кожної зустрічі я надішлю нагадування.\n\nДо зустрічі!\n{sign}',
    noPS: 'Цей час не підійшов: вибери, будь ласка, інший',
    noPB: '{hello}\n\nДякую за запит. На жаль, цей час мені не підходить:\n{when}{msg}\n\nВибери, будь ласка, інший час: {again}\n\n{kvNote}{sign}',
    exp1PS: 'Час звільнився',
    exp1PB: '{hello}\n\nДоговір не було підписано за 24 години, тому час звільнився:\n{when}\n\nНічого страшного: якщо ти ще хочеш зустрітися, вибери час знову: {again}\n\nЯкщо з договором щось не вийшло, дай відповідь на цей лист або напиши мені в Telegram https://t.me/IrynaNeuroCoach.\n\n{sign}',
    exp2PS: 'Вибач, я не встигла відповісти',
    exp2PB: '{hello}\n\nВибач, я не встигла підтвердити час за два дні, тому він звільнився:\n{when}\n\nВибери, будь ласка, інший час: {again}\n\nАбо напиши мені в Telegram https://t.me/IrynaNeuroCoach, і ми домовимося.\n\n{sign}',
    exPayP: 'Рахунок від Alonira.ch AG з QR-квитанцією прийде окремим листом. Оплатити його потрібно до першої зустрічі. Якщо оплата не надійде до початку, ми перенесемо зустріч.\n\n'
  },
  de: {
    sign: 'Iryna Voznesenskaya\nCoach, Alonira.ch AG · https://voznesenskaya.ch/de/', hello: 'Hallo {name}',
    whatL: 'Termin: {what}.', whenL: 'Zeit: {when}.',
    reqS: 'Deine Terminanfrage ist angekommen: {short}',
    reqB: '{hello}\n\nDanke, deine Anfrage ist angekommen.\n{whatL}\n{whenL}\n{resch}\nDiese Zeit ist für dich reserviert. Ich bestätige sie innerhalb von zwei Tagen per E-Mail. Wenn sie mir nicht passt, schreibe ich dir, und du kannst eine andere wählen.\n\nAnfrage ansehen, verschieben oder absagen: {manage}\n\n{sign}',
    resch: 'Das ist eine Verschiebung des Termins {old}. Bis ich die neue Zeit bestätige, gilt die bisherige.\n',
    holdS: 'Die Zeit ist 24 Stunden für dich reserviert: Bitte unterschreib den Vertrag',
    holdB: '{hello}\n\nDu hast eine Zeit für den Termin gewählt.\n{whatL}\n{whenL}\n\nDamit ich diese Zeit bestätigen kann, unterschreib bitte innerhalb von 24 Stunden den Coaching-Vertrag:\n{contract}\nDas dauert nur ein paar Minuten, Papier und Scan brauchst du nicht. Wenn der Vertrag nicht innerhalb von 24 Stunden unterschrieben ist, wird die Zeit wieder frei.\n\nWenn der Vertrag unterschrieben ist, bestätige ich Vertrag und Termin mit einer E-Mail, in der Regel innerhalb von zwei Tagen. Danach kommt die Rechnung der Alonira.ch AG, sie ist vor dem Termin zu bezahlen.\n\nTermin ansehen oder absagen: {manage}\n\n{sign}',
    okS: 'Termin bestätigt: {short}',
    okB: '{hello}\n\nIch bestätige unseren Termin.\n{whatL}\n{whenL}\nWo: Zoom. {zoomL}\n\n{extra}So bereitest du dich vor: Such dir einen ruhigen Ort, an dem dich niemand stört, und prüf Internet, Kamera und Mikrofon. Überleg dir, womit du kommen und was du mitnehmen möchtest.\n\nIm Anhang findest du die Kalenderdatei. Termin in den Google Kalender eintragen: {gcal}\n\nKostenlos verschieben oder absagen kannst du den Termin bis spätestens 24 Stunden vor Beginn: {manage}\nEinen Tag vorher schicke ich dir eine Erinnerung.\n\nBis bald!\n{sign}',
    zoomL: 'Link zum Einloggen: {zoom}', zoomNo: 'Den Link zum Einloggen schicke ich dir vor dem Termin mit einer separaten E-Mail.',
    exFree: 'Das Kennenlernen ist kostenlos und unverbindlich.\n\n',
    exKv: 'Der Coaching-Vertrag Nr. {kv} gilt ab heute, {today}.{eu}\n\n',
    exProg: 'Termin zum Vertrag Nr. {kv}.\n\n',
    eu: ' Du wohnst in einem Land der EU oder des Europäischen Wirtschaftsraums: Die 14-tägige Widerrufsfrist beginnt heute.',
    exPay: 'Die Rechnung der Alonira.ch AG mit QR-Einzahlungsschein kommt mit einer separaten E-Mail. Sie ist vor dem Termin zu bezahlen. Wenn die Zahlung bis zum Beginn nicht eingegangen ist, verschieben wir den Termin.\n\n',
    noS: 'Diese Zeit passt leider nicht: Bitte wähl eine andere',
    noB: '{hello}\n\nDanke für deine Anfrage. Leider passt mir die Zeit {when} nicht.{msg}\n\nBitte wähl eine andere Zeit: {again}\n\n{kvNote}{sign}',
    msg: '\n\nMeine Nachricht: {msg}',
    kvNote: 'Dein Vertrag Nr. {kv} bleibt bestehen. Wenn du eine neue Zeit wählst, bestätige ich Vertrag und Termin zusammen.\n\n',
    exp1S: 'Die Zeit ist wieder frei',
    exp1B: '{hello}\n\nDer Vertrag wurde nicht innerhalb von 24 Stunden unterschrieben, deshalb ist die Zeit {when} wieder frei. Kein Problem: Wenn du dich weiterhin treffen möchtest, wähl einfach eine neue Zeit: {again}\n\nWenn mit dem Vertrag etwas nicht geklappt hat, antworte auf diese E-Mail oder schreib mir auf Telegram https://t.me/IrynaNeuroCoach.\n\n{sign}',
    exp2S: 'Entschuldige, ich habe es nicht rechtzeitig geschafft',
    exp2B: '{hello}\n\nEntschuldige, ich habe die Zeit {when} nicht innerhalb von zwei Tagen bestätigt, deshalb ist sie wieder frei. Bitte wähl eine andere Zeit: {again}\n\nOder schreib mir auf Telegram https://t.me/IrynaNeuroCoach, dann finden wir einen Termin.\n\n{sign}',
    cancelS: 'Termin abgesagt: {short}',
    cancelB: '{hello}\n\nDu hast den Termin abgesagt.\n{whatL}\n{whenL}\n\n{late}Wenn du eine neue Zeit wählen möchtest: {again}\n\n{sign}',
    lateFree: 'Die Absage ist kostenlos.\n\n',
    lateHeld: 'Bis zum Beginn waren es weniger als 24 Stunden, deshalb gilt der Termin nach den Bedingungen der Zusammenarbeit als durchgeführt. Wenn etwas Ernstes und Unerwartetes passiert ist, zum Beispiel eine Krankheit oder etwas Dringendes mit dem Kind, antworte auf diese E-Mail, und wir finden eine Lösung.\n\n',
    remS: 'Morgen ist unser Termin: {short}',
    remB: '{hello}\n\nIch erinnere dich an unseren Termin.\n{whatL}\n{whenL}\n{zoomL}\n\nWenn du nicht kommen kannst, schreib mir bitte so früh wie möglich: Antworte auf diese E-Mail oder schreib mir auf Telegram https://t.me/IrynaNeuroCoach.\n\nBis morgen!\n{sign}',
    icsT: '☕ Termin mit Iryna Voznesenskaya: {type}',
    icsD: 'Termin: {what}\nWo: Zoom {zoom}\nVorbereitung: ruhiger Ort, Internet, Kamera und Mikrofon. Überleg dir, womit du kommen möchtest.\nVerschieben oder absagen (kostenlos bis 24 Stunden vorher): {manage}\nIryna Voznesenskaya · Termin buchen: https://voznesenskaya.ch/de/zapis/',
    icsA: 'In 30 Minuten: Termin mit Iryna Voznesenskaya',
    your: 'deine Zeit', zur: 'Zürcher Zeit',
    days: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'],
    months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    types: { intro: 'Kennenlernen, 30 Minuten, kostenlos', mentor: 'Mentoring-Gespräch, 1 Stunde, 150 CHF', razbor: '{p}, Auswertung 3 Stunden, 249 CHF', prog: 'Termin im Programm, 1 Stunde', pk3: 'Persönliche Sitzung {n}, 60 Minuten', flag: '«Mein Ziel — mein Weg», Termin {n}, 60 Minuten', support: 'Begleitung, Termin {n}, 60 Minuten' },
    tshort: { intro: 'Kennenlernen', mentor: 'Mentoring-Gespräch', razbor: '{p}', prog: 'Termin im Programm', pk3: 'Persönliche Sitzung {n}', flag: '«Mein Ziel — mein Weg» · {n}', support: 'Begleitung · {n}' },
    progs: { snimok: '«Momentaufnahme meines Lebens»', fund: '«Mein Fundament»', life: '«Ein Leben ohne Bedauern»' },
    pkName: { pk3: 'Persönliche Sitzung: Paket mit 3 Terminen à 60 Minuten, 360 CHF', flag: '«Mein Ziel — mein Weg»: 10 Termine à 60 Minuten', support: 'Begleitung: 2 Termine à 60 Minuten' },
    of: 'von', nth: 'Termin {n}', whensL: 'Termine:\n{when}',
    laterP: 'Die Zeiten für die übrigen Termine des Pakets ({left}) kannst du später über den Link «Meine Buchung» wählen: {manage}\n\n',
    holdPS: 'Die Zeiten sind 24 Stunden für dich reserviert: Bitte unterschreib den Vertrag',
    holdPB: '{hello}\n\nDu hast Zeiten für deine Termine gewählt.\n{whatL}\n{whenL}\n\n{later}Damit ich diese Zeiten bestätigen kann, unterschreib bitte innerhalb von 24 Stunden den Coaching-Vertrag:\n{contract}\nDas dauert nur ein paar Minuten, Papier und Scan brauchst du nicht. Wenn der Vertrag nicht innerhalb von 24 Stunden unterschrieben ist, werden die Zeiten wieder frei.\n\nWenn der Vertrag unterschrieben ist, bestätige ich Vertrag und alle Termine mit einer E-Mail, in der Regel innerhalb von zwei Tagen. Danach kommt die Rechnung der Alonira.ch AG, sie ist vor dem ersten Termin zu bezahlen.\n\nBuchung ansehen oder absagen: {manage}\n\n{sign}',
    reqPS: 'Deine Terminanfrage ist angekommen: {short}',
    reqPB: '{hello}\n\nDanke, deine Anfrage ist angekommen.\n{whatL}\n{whenL}\n\nDiese Zeiten sind für dich reserviert. Ich bestätige sie innerhalb von zwei Tagen per E-Mail.\n\nAnsehen, verschieben oder absagen: {manage}\n\n{sign}',
    okPS: 'Termine bestätigt: {short}',
    okPB: '{hello}\n\nIch bestätige unsere Termine.\n{whatL}\n{whenL}\nWo: Zoom. {zoomL}\n\n{extra}{later}So bereitest du dich vor: Such dir einen ruhigen Ort, an dem dich niemand stört, und prüf Internet, Kamera und Mikrofon. Überleg dir, womit du kommen und was du mitnehmen möchtest.\n\nIm Anhang findest du die Kalenderdatei mit allen Terminen. In den Google Kalender eintragen:\n{gcal}\n\nKostenlos verschieben oder absagen kannst du jeden Termin bis spätestens 24 Stunden vor Beginn: {manage}\nEinen Tag vor jedem Termin schicke ich dir eine Erinnerung.\n\nBis bald!\n{sign}',
    noPS: 'Diese Zeiten passen leider nicht: Bitte wähl andere',
    noPB: '{hello}\n\nDanke für deine Anfrage. Leider passen mir diese Zeiten nicht:\n{when}{msg}\n\nBitte wähl andere Zeiten: {again}\n\n{kvNote}{sign}',
    exp1PS: 'Die Zeiten sind wieder frei',
    exp1PB: '{hello}\n\nDer Vertrag wurde nicht innerhalb von 24 Stunden unterschrieben, deshalb sind diese Zeiten wieder frei:\n{when}\n\nKein Problem: Wenn du dich weiterhin treffen möchtest, wähl einfach neue Zeiten: {again}\n\nWenn mit dem Vertrag etwas nicht geklappt hat, antworte auf diese E-Mail oder schreib mir auf Telegram https://t.me/IrynaNeuroCoach.\n\n{sign}',
    exp2PS: 'Entschuldige, ich habe es nicht rechtzeitig geschafft',
    exp2PB: '{hello}\n\nEntschuldige, ich habe diese Zeiten nicht innerhalb von zwei Tagen bestätigt, deshalb sind sie wieder frei:\n{when}\n\nBitte wähl andere Zeiten: {again}\n\nOder schreib mir auf Telegram https://t.me/IrynaNeuroCoach, dann finden wir Termine.\n\n{sign}',
    exPayP: 'Die Rechnung der Alonira.ch AG mit QR-Einzahlungsschein kommt mit einer separaten E-Mail. Sie ist vor dem ersten Termin zu bezahlen. Wenn die Zahlung bis zum Beginn nicht eingegangen ist, verschieben wir den Termin.\n\n'
  },
  en: {
    sign: 'Iryna Voznesenskaya\nCoach, Alonira.ch AG · https://voznesenskaya.ch/en/', hello: 'Hello {name},',
    whatL: 'Session: {what}.', whenL: 'Time: {when}.',
    reqS: 'Your booking request has arrived: {short}',
    reqB: '{hello}\n\nThank you, your request has arrived.\n{whatL}\n{whenL}\n{resch}\nThis time is held for you. I will confirm it by e-mail within two days. If it does not suit me, I will write to you and you can choose another one.\n\nView, reschedule or cancel your request: {manage}\n\n{sign}',
    resch: 'This moves the session of {old}. Until I confirm the new time, the previous one still stands.\n',
    holdS: 'This time is held for you for 24 hours: please sign the agreement',
    holdB: '{hello}\n\nYou have chosen a time for your session.\n{whatL}\n{whenL}\n\nSo that I can confirm this time, please sign the coaching agreement within 24 hours:\n{contract}\nIt takes a few minutes, no paper or scan needed. If the agreement is not signed within 24 hours, the time becomes free again.\n\nOnce the agreement is signed, I confirm the agreement and the time in one e-mail, usually within two days. After that, the invoice from Alonira.ch AG arrives, to be paid before the session.\n\nView or cancel your booking: {manage}\n\n{sign}',
    okS: 'Session confirmed: {short}',
    okB: '{hello}\n\nI confirm our session.\n{whatL}\n{whenL}\nWhere: Zoom. {zoomL}\n\n{extra}How to prepare: find a quiet place where nobody will disturb you, and check your internet, camera and microphone. Think about what you would like to bring and what you would like to take away.\n\nThe calendar file is attached. Add the session to Google Calendar: {gcal}\n\nYou can reschedule or cancel free of charge up to 24 hours before the start: {manage}\nI will send you a reminder the day before.\n\nSee you soon!\n{sign}',
    zoomL: 'Link to join: {zoom}', zoomNo: 'I will send you the link to join in a separate e-mail before the session.',
    exFree: 'The introductory meeting is free and without obligation.\n\n',
    exKv: 'Coaching agreement No. {kv} is in force from today, {today}.{eu}\n\n',
    exProg: 'Session under agreement No. {kv}.\n\n',
    eu: ' You live in a country of the EU or the European Economic Area: the 14-day period for withdrawing from the agreement starts today.',
    exPay: 'The invoice from Alonira.ch AG with a QR payment slip comes in a separate e-mail. It needs to be paid before the session. If the payment has not arrived by the start, we will move the session.\n\n',
    noS: 'This time does not work: please choose another one',
    noB: '{hello}\n\nThank you for your request. Unfortunately, {when} does not suit me.{msg}\n\nPlease choose another time: {again}\n\n{kvNote}{sign}',
    msg: '\n\nMy message: {msg}',
    kvNote: 'Your agreement No. {kv} remains valid. When you choose a new time, I will confirm the agreement and the time together.\n\n',
    exp1S: 'The time is free again',
    exp1B: '{hello}\n\nThe agreement was not signed within 24 hours, so {when} is free again. No problem: if you would still like to meet, simply choose a time again: {again}\n\nIf something went wrong with the agreement, reply to this e-mail or write to me on Telegram https://t.me/IrynaNeuroCoach.\n\n{sign}',
    exp2S: 'Sorry, I did not reply in time',
    exp2B: '{hello}\n\nSorry, I did not confirm {when} within two days, so the time is free again. Please choose another time: {again}\n\nOr write to me on Telegram https://t.me/IrynaNeuroCoach and we will arrange it.\n\n{sign}',
    cancelS: 'Session cancelled: {short}',
    cancelB: '{hello}\n\nYou have cancelled the session.\n{whatL}\n{whenL}\n\n{late}If you would like to choose a new time: {again}\n\n{sign}',
    lateFree: 'The cancellation is free of charge.\n\n',
    lateHeld: 'There were less than 24 hours left before the start, so under the terms of work the session counts as held. If something serious and sudden happened, for example illness or something urgent with your child, reply to this e-mail and we will find a solution.\n\n',
    remS: 'Our session is tomorrow: {short}',
    remB: '{hello}\n\nA reminder of our session.\n{whatL}\n{whenL}\n{zoomL}\n\nIf you cannot make it, please let me know as early as possible: reply to this e-mail or write to me on Telegram https://t.me/IrynaNeuroCoach.\n\nSee you tomorrow!\n{sign}',
    icsT: '☕ Session with Iryna Voznesenskaya: {type}',
    icsD: 'Session: {what}\nWhere: Zoom {zoom}\nHow to prepare: a quiet place, internet, camera and microphone. Think about what you would like to bring.\nReschedule or cancel (free up to 24 hours before): {manage}\nIryna Voznesenskaya · book a session: https://voznesenskaya.ch/en/zapis/',
    icsA: 'In 30 minutes: session with Iryna Voznesenskaya',
    your: 'your time', zur: 'Zurich time',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    types: { intro: 'Introductory meeting, 30 minutes, free', mentor: 'Mentoring session, 1 hour, 150 CHF', razbor: '{p}, 3-hour session, 249 CHF', prog: 'Programme session, 1 hour', pk3: 'Personal session {n}, 60 minutes', flag: '“My goal — my path”, session {n}, 60 minutes', support: 'Ongoing support, session {n}, 60 minutes' },
    tshort: { intro: 'Introductory meeting', mentor: 'Mentoring session', razbor: '{p}', prog: 'Programme session', pk3: 'Personal session {n}', flag: '“My goal — my path” · {n}', support: 'Ongoing support · {n}' },
    progs: { snimok: '“Life snapshot”', fund: '“My foundation”', life: '“A life without regrets”' },
    pkName: { pk3: 'Personal session: package of 3 sessions of 60 minutes, 360 CHF', flag: '“My goal — my path”: 10 sessions of 60 minutes', support: 'Ongoing support: 2 sessions of 60 minutes' },
    of: 'of', nth: 'session {n}', whensL: 'Sessions:\n{when}',
    laterP: 'You can choose the times for the remaining sessions of the package ({left}) later via the “My booking” link: {manage}\n\n',
    holdPS: 'These times are held for you for 24 hours: please sign the agreement',
    holdPB: '{hello}\n\nYou have chosen times for your sessions.\n{whatL}\n{whenL}\n\n{later}So that I can confirm these times, please sign the coaching agreement within 24 hours:\n{contract}\nIt takes a few minutes, no paper or scan needed. If the agreement is not signed within 24 hours, the times become free again.\n\nOnce the agreement is signed, I confirm the agreement and all sessions in one e-mail, usually within two days. After that, the invoice from Alonira.ch AG arrives, to be paid before the first session.\n\nView or cancel your booking: {manage}\n\n{sign}',
    reqPS: 'Your booking request has arrived: {short}',
    reqPB: '{hello}\n\nThank you, your request has arrived.\n{whatL}\n{whenL}\n\nThese times are held for you. I will confirm them by e-mail within two days.\n\nView, reschedule or cancel: {manage}\n\n{sign}',
    okPS: 'Sessions confirmed: {short}',
    okPB: '{hello}\n\nI confirm our sessions.\n{whatL}\n{whenL}\nWhere: Zoom. {zoomL}\n\n{extra}{later}How to prepare: find a quiet place where nobody will disturb you, and check your internet, camera and microphone. Think about what you would like to bring and what you would like to take away.\n\nThe calendar file with all sessions is attached. Add them to Google Calendar:\n{gcal}\n\nYou can reschedule or cancel any session free of charge up to 24 hours before it starts: {manage}\nI will send you a reminder the day before each session.\n\nSee you soon!\n{sign}',
    noPS: 'These times do not work: please choose others',
    noPB: '{hello}\n\nThank you for your request. Unfortunately, these times do not suit me:\n{when}{msg}\n\nPlease choose other times: {again}\n\n{kvNote}{sign}',
    exp1PS: 'The times are free again',
    exp1PB: '{hello}\n\nThe agreement was not signed within 24 hours, so these times are free again:\n{when}\n\nNo problem: if you would still like to meet, simply choose times again: {again}\n\nIf something went wrong with the agreement, reply to this e-mail or write to me on Telegram https://t.me/IrynaNeuroCoach.\n\n{sign}',
    exp2PS: 'Sorry, I did not reply in time',
    exp2PB: '{hello}\n\nSorry, I did not confirm these times within two days, so they are free again:\n{when}\n\nPlease choose other times: {again}\n\nOr write to me on Telegram https://t.me/IrynaNeuroCoach and we will arrange it.\n\n{sign}',
    exPayP: 'The invoice from Alonira.ch AG with a QR payment slip comes in a separate e-mail. It needs to be paid before the first session. If the payment has not arrived by the start, we will move the session.\n\n'
  }
};

/* ---------- таблица ---------- */
function zBook_() {
  var id = props_().getProperty('ZSHEET_ID');
  if (!id) throw new Error('zapisUstanovka не запускалась');
  return SpreadsheetApp.openById(id);
}
function zSheet_() {
  var ss = zBook_(), sh = ss.getSheetByName('Запись');
  if (!sh) {
    sh = ss.insertSheet('Запись', 0); sh.appendRow(ZHEAD); sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, ZHEAD.length).setFontWeight('bold');
    sh.setColumnWidth(1, 170); sh.setColumnWidth(5, 220); sh.setColumnWidth(7, 130); sh.setColumnWidth(13, 160); sh.setColumnWidth(14, 200);
  } else if (sh.getLastColumn() < ZHEAD.length) {   // новые колонки (пакеты, 11.10.2026) — в конец заголовка
    var have = sh.getLastColumn();
    sh.getRange(1, have + 1, 1, ZHEAD.length - have).setValues([ZHEAD.slice(have)]).setFontWeight('bold');
  }
  return sh;
}
function zFind_(sh, no) {
  if (!RX_ZP.test(String(no || ''))) return null;
  var cell = sh.getRange(1, 1, Math.max(sh.getLastRow(), 1), 1).createTextFinder(String(no)).matchEntireCell(true).findNext();
  if (!cell) return null;
  return { r: cell.getRow(), v: sh.getRange(cell.getRow(), 1, 1, ZHEAD.length).getValues()[0] };
}
function zSet_(sh, r, o) { Object.keys(o).forEach(function (k) { sh.getRange(r, ZC[k] + 1).setValue(o[k]); }); }
function zAll_(sh) { var n = sh.getLastRow(); return n < 2 ? [] : sh.getRange(2, 1, n - 1, ZHEAD.length).getValues().map(function (v, i) { return { r: i + 2, v: v }; }); }

/* ---------- время ---------- */
function zOff_(dt, tz) { var z = Utilities.formatDate(dt, tz || TZ, 'Z'); return (z.charAt(0) === '-' ? -1 : 1) * (+z.slice(1, 3) * 60 + +z.slice(3, 5)); }
function zEaster_(y) {
  var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3),
    h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
    mo = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return Date.UTC(y, mo - 1, day);
}
/* праздники кантона Цюрих (как в «Мой год» на svoiludi.ch: NY BE KF OM AR AU PM WN ST) + 1 августа */
function zHolidays_(y) {
  var e = zEaster_(y), o = {}, add = function (t) { o[new Date(t).toISOString().slice(0, 10)] = 1; }, D = 864e5;
  [Date.UTC(y, 0, 1), Date.UTC(y, 0, 2), e - 2 * D, e + D, Date.UTC(y, 4, 1), e + 39 * D, e + 50 * D, Date.UTC(y, 7, 1), Date.UTC(y, 11, 25), Date.UTC(y, 11, 26)].forEach(add);
  return o;
}
/* занятость: события всех календарей (кэш 2 минуты; fresh — без кэша, перед записью).
   Время НЕ закрывают (11.10.2026, проверка на настоящих календарях Ирины): события со статусом «Свободно», отменённые и те, где Ирина
   отказалась; события на весь день и заметки длиннее 24 часов — это напоминания и пометки («📚 модуль МЕУ» на три недели,
   «Kein Invalidentaxi ganze Woche», «✍️ Kontrolle…»), а не встречи. Закрыть целый день: событие со временем (например 9:00–18:00)
   или знак ⛔ в названии события на весь день. Наружу по-прежнему уходит только время свободных окон. */
var ZBLOCK = '⛔';
function zDayMs_(ymd) { var p = String(ymd).slice(0, 10).split('-').map(Number), u = Date.UTC(p[0], p[1] - 1, p[2]); return u - zOff_(new Date(u + 12 * 36e5)) * 6e4; }
function zMaxTerm_() { var m = 0; Object.keys(ZT).forEach(function (k) { m = Math.max(m, ZT[k].term || 0); }); return m; }
function zBusy_(fresh) {
  var cache = CacheService.getScriptCache();
  if (!fresh) { var c = cache.get('zbusy'); if (c) return JSON.parse(c); }
  var ids = JSON.parse(props_().getProperty('ZBUSY_CALS') || '[]');
  if (ids.indexOf(ZCAL) < 0) ids.push(ZCAL);
  var now = Date.now(), from = now - 864e5, to = now + (ZW.max + zMaxTerm_() + 2) * 864e5, raw = [], errs = [];
  ids.forEach(function (id) {
    try {
      var tok = null;
      do {
        var r = Calendar.Events.list(id, { timeMin: new Date(from).toISOString(), timeMax: new Date(to).toISOString(), singleEvents: true, maxResults: 2500,
          pageToken: tok || undefined, fields: 'nextPageToken,items(status,transparency,summary,start,end,attendees(self,responseStatus))' });
        (r.items || []).forEach(function (ev) {
          if (ev.status === 'cancelled' || ev.transparency === 'transparent' || !ev.start || !ev.end) return;
          if ((ev.attendees || []).some(function (a) { return a.self && a.responseStatus === 'declined'; })) return;
          var hard = String(ev.summary || '').indexOf(ZBLOCK) >= 0, s, e;
          if (ev.start.date) { if (!hard) return; s = zDayMs_(ev.start.date); e = zDayMs_(ev.end.date); }
          else { s = Date.parse(ev.start.dateTime); e = Date.parse(ev.end.dateTime); if (e - s >= 24 * 36e5 && !hard) return; }
          if (e > s) raw.push([s, e]);
        });
        tok = r.nextPageToken;
      } while (tok);
    } catch (err) { if (errs.indexOf(id) < 0) errs.push(id); }
  });
  raw.sort(function (a, b) { return a[0] - b[0]; });
  var busy = [];
  raw.forEach(function (b) { var l = busy[busy.length - 1]; if (l && b[0] <= l[1]) l[1] = Math.max(l[1], b[1]); else busy.push([b[0], b[1]]); });
  props_().setProperty('ZBUSY_ERR', errs.length ? fmtNow_() + ': ' + errs.join(', ') : '');
  try { cache.put('zbusy', JSON.stringify(busy), 120); } catch (e) {}
  return busy;
}
function zFreeAt_(busy, a, b) { for (var i = 0; i < busy.length; i++) { if (busy[i][0] >= b) break; if (busy[i][1] > a) return false; } return true; }
/* свободные начала встреч (мс) для вида t */
function zSlots_(t, busy, now) {
  /* у пакета первая встреча — в ближайшие 60 дней, остальные — в сроке пакета: свободное время отдаём на 60 дней + срок */
  var T = ZT[t], days = ZW.max + (T.term || 0), blk = T.dur + (T.res || 0), out = [], minT = now + ZW.lead * 864e5, maxT = now + days * 864e5;
  var p = Utilities.formatDate(new Date(now), TZ, 'yyyy-MM-dd').split('-').map(Number), hol = {};
  [p[0], p[0] + 1].forEach(function (y) { var h = zHolidays_(y); for (var k in h) hol[k] = 1; });
  for (var i = 0; i <= days + 1; i++) {
    var u = new Date(Date.UTC(p[0], p[1] - 1, p[2] + i)), wd = u.getUTCDay();
    if (wd === 0 || wd === 6 || hol[u.toISOString().slice(0, 10)]) continue;
    var off = zOff_(new Date(u.getTime() + 12 * 36e5));   // смещение Цюриха в этот день (переход на летнее время — ночью, на 9–18 не влияет)
    for (var m = ZW.from; m + blk <= ZW.to; m += ZW.step) {
      var s = u.getTime() + (m - off) * 6e4, e = s + blk * 6e4;   // бронь в календаре — с запасом
      if (s < minT || s > maxT) continue;
      if (!zFreeAt_(busy, s - T.buf * 6e4, e + T.buf * 6e4)) continue;
      out.push(s);
    }
  }
  return out;
}
function zFmt_(ms, tz, f) { return Utilities.formatDate(new Date(ms), tz || TZ, f); }
function zCity_(tz) { var c = String(tz || '').split('/').pop().replace(/_/g, ' '); return c === 'Kiev' ? 'Kyiv' : c; }
function zOkTz_(tz) { tz = String(tz || ''); if (!/^[A-Za-z_]+(\/[A-Za-z0-9_+\-]+){1,2}$/.test(tz)) return TZ; try { Utilities.formatDate(new Date(), tz, 'Z'); return tz; } catch (e) { return TZ; } }
/* «среда, 14 октября 2026, 10:00–10:30 по твоему времени (Berlin) · 10:00–10:30 по Цюриху» */
function zWhen_(s, e, tz, lang) {
  var L = ZM[lang] || ZM.ru; tz = zOkTz_(tz);
  var d = zFmt_(s, tz, 'u|d|M|yyyy').split('|').map(Number), hm = zFmt_(s, tz, 'HH:mm') + '–' + zFmt_(e, tz, 'HH:mm');
  var date = lang === 'de' ? L.days[d[0] - 1] + ', ' + d[1] + '. ' + L.months[d[2] - 1] + ' ' + d[3]
    : lang === 'en' ? L.days[d[0] - 1] + ', ' + d[1] + ' ' + L.months[d[2] - 1] + ' ' + d[3]
    : L.days[d[0] - 1] + ', ' + d[1] + ' ' + L.months[d[2] - 1] + ' ' + d[3];
  if (tz === TZ) return date + ', ' + hm + ' ' + L.zur;
  if (zOff_(new Date(s)) === zOff_(new Date(s), tz)) return date + ', ' + hm + ' ' + L.your + ' (' + zCity_(tz) + ')';
  var zd = zFmt_(s, TZ, 'dd.MM.') !== zFmt_(s, tz, 'dd.MM.') ? zFmt_(s, TZ, 'dd.MM., ') : '';
  return date + ', ' + hm + ' ' + L.your + ' (' + zCity_(tz) + ') · ' + zd + zFmt_(s, TZ, 'HH:mm') + '–' + zFmt_(e, TZ, 'HH:mm') + ' ' + L.zur;
}
function zShort_(s, tz) { return zFmt_(s, zOkTz_(tz), 'dd.MM.yyyy, HH:mm'); }
function zWhenRu_(s, e, tz) {   // для Ирины: по Цюриху, и время клиентки, если пояс другой
  var w = zFmt_(s, TZ, 'dd.MM.yyyy') + ' (' + ZM.ru.days[+zFmt_(s, TZ, 'u') - 1] + '), ' + zFmt_(s, TZ, 'HH:mm') + '–' + zFmt_(e, TZ, 'HH:mm') + ' по Цюриху';
  tz = zOkTz_(tz);
  return tz === TZ ? w : w + ' (у клиентки ' + zFmt_(s, tz, 'HH:mm') + ', ' + tz + ')';
}

/* ---------- названия ---------- */
function zPn_(pn, lang) { var p = String(pn || '').split('/'); return p.length === 2 ? p[0] + ' ' + (ZM[lang] || ZM.ru).of + ' ' + p[1] : ''; }
function zWhat_(t, prog, lang, pn) { var L = ZM[lang] || ZM.ru; return fill_(L.types[t] || '', { p: L.progs[prog] || '', n: zPn_(pn, lang) }); }
function zShortName_(t, prog, lang, pn) { var L = ZM[lang] || ZM.ru; return fill_(L.tshort[t] || '', { p: L.progs[prog] || '', n: zPn_(pn, lang) }); }
function zRuName_(t, prog, pn) { return t === 'razbor' ? ZM.ru.progs[prog] + ', разбор 3 часа' : fill_(ZM.ru.tshort[t] || '', { n: zPn_(pn, 'ru') }); }

/* ---------- ссылки ---------- */
function zBase_(lang) { return SITE + '/' + (lang && lang !== 'ru' ? lang + '/' : ''); }
function zManage_(lang, no, ck) { return zBase_(lang) + 'zapis/?z=' + no + '&k=' + ck; }
function zAgain_(lang, no, ck) { return zManage_(lang, no, ck) + '&r=1'; }
function zContractUrl_(lang, prog, no, ck) { return zBase_(lang) + 'dogovor/?p=' + prog + '&z=' + no + '&k=' + ck + (props_().getProperty('CONTRACT_PREVIEW') === '0' ? '' : '&preview=1'); }
function zAdminUrl_(no, ik) { return ScriptApp.getService().getUrl() + '?a=zok&z=' + encodeURIComponent(no) + '&k=' + ik; }
function zZoom_() { return props_().getProperty('ZOOM_URL') || ''; }

/* ---------- строка → объект ---------- */
function zObj_(v) {
  return { no: v[ZC['Номер']], st: v[ZC['Статус']], t: v[ZC['Вид']], prog: v[ZC['Программа']], s: Number(v[ZC['Начало, мс']]), dur: Number(v[ZC['Минут']]),
    tz: v[ZC['Часовой пояс']], lang: v[ZC['Язык']], name: v[ZC['Имя']], email: v[ZC['E-mail']], contact: v[ZC['Telegram или телефон']], comment: v[ZC['С чем приходит']],
    kv: v[ZC['Договор']], dl: Number(v[ZC['Срок, мс']]) || 0, flags: String(v[ZC['Напоминания']] || ''), from: v[ZC['Перенос с']], to: v[ZC['Перенесено на']],
    ev: v[ZC['Событие']], ik: v[ZC['Ключ Ирины']], ck: v[ZC['Ключ клиентки']], who: String(v[ZC['Кто отменил']] || ''),
    pk: String(v[ZC['Пакет']] || ''), pn: String(v[ZC['В пакете']] || '') };
}
function zEnd_(o) { return o.s + o.dur * 6e4; }                                   // конец встречи для клиентки
function zBEnd_(o) { return zEnd_(o) + (((ZT[o.t] || {}).res) || 0) * 6e4; }      // конец брони в календаре Ирины (с запасом)
function zFirst_(name) { return String(name || '').trim().split(/\s+/)[0]; }

/* ---------- пакет: все записи одного пакета ---------- */
function zGroup_(sh, pk) { return zAll_(sh).map(function (x) { var o = zObj_(x.v); o.r = x.r; return o; }).filter(function (o) { return o.pk && o.pk === pk; }).sort(function (a, b) { return a.s - b.s; }); }
/* встреча пакета «занята»: в силе или отменена меньше чем за 24 часа (по условиям считается проведённой) */
function zCounts_(o) { return !!Z_ACTIVE[o.st] || (o.st === 'отменена' && o.who.indexOf('меньше чем за 24') >= 0); }
function zPkLeft_(T, rows) { return T.pk - rows.filter(zCounts_).length; }
/* проверка времени пакета: свободно, не накладываются друг на друга, все в сроке пакета, первая — в ближайшие 60 дней */
function zPkCheck_(t, starts, fixed, now, slots) {
  var T = ZT[t], blk = (T.dur + (T.res || 0) + T.buf) * 6e4;
  for (var i = 0; i < starts.length; i++) {
    if (slots.indexOf(starts[i]) < 0) return 'slot';
    if (i && starts[i] - starts[i - 1] < blk) return 'slot';
  }
  var all = fixed.concat(starts).sort(function (a, b) { return a - b; });
  if (all[all.length - 1] - all[0] > T.term * 864e5) return 'term';
  if (all[0] > now + ZW.max * 864e5) return 'term';
  return '';
}

/* ---------- календарь ---------- */
function zCal_() { var c = CalendarApp.getCalendarById(ZCAL); if (!c) throw new Error('нет доступа к календарю ' + ZCAL); return c; }
function zEvTitle_(o) {
  var pre = o.st === 'ждёт договор' ? '⏳ Ждём договор · ' : o.st === 'ждёт подтверждения' ? '❓ Подтвердить · ' : '';
  return pre + zRuName_(o.t, o.prog, o.pn) + ' — ' + o.name + (o.kv ? ' · ' + o.kv : '');
}
function zEvDesc_(o) {
  var lines = ['Запись с сайта voznesenskaya.ch/zapis/ · ' + o.no + (o.pk ? ' (пакет ' + o.pk + ')' : ''), 'Статус: ' + o.st, 'Время: ' + zWhenRu_(o.s, zEnd_(o), o.tz)];
  var res = (ZT[o.t] || {}).res; if (res) lines.push('В календаре ещё ' + res + ' минут запаса после встречи: клиентке написано ' + o.dur + ' минут.');
  lines.push('Имя: ' + o.name, 'E-mail: ' + o.email);
  if (o.contact) lines.push('Telegram или телефон: ' + o.contact);
  if (o.kv) lines.push('Договор: ' + o.kv);
  if (o.comment) lines.push('С чем приходит: ' + o.comment);
  if (o.st === 'ждёт подтверждения') lines.push('', 'Подтвердить или отклонить: ' + zAdminUrl_(o.no, o.ik));
  if (o.st === 'ждёт договор') lines.push('', 'Ждём договор до ' + zFmt_(o.dl, TZ, 'dd.MM.yyyy HH:mm') + '. Без договора бронь снимется сама.');
  if (o.st === 'подтверждена' && zZoom_()) lines.push('', 'Zoom: ' + zZoom_());
  return lines.join('\n');
}
function zEvPaint_(ev, o) {
  ev.setTitle(zEvTitle_(o)); ev.setDescription(zEvDesc_(o));
  ev.setColor(o.st === 'подтверждена' ? CalendarApp.EventColor.GREEN : CalendarApp.EventColor.GRAY);
  if (o.st === 'подтверждена' && zZoom_()) ev.setLocation(zZoom_());
}
function zEvGet_(id) { try { return id ? zCal_().getEventById(id) : null; } catch (e) { return null; } }
function zEvDel_(id) { var ev = zEvGet_(id); if (ev) try { ev.deleteEvent(); } catch (e) {} }
function zEvMake_(o) { var ev = zCal_().createEvent(zEvTitle_(o), new Date(o.s), new Date(zBEnd_(o)), { description: '' }); o.ev = ev.getId(); zEvPaint_(ev, o); return ev; }

/* ---------- письма ---------- */
function zVars_(o, L) {
  var v = { name: zFirst_(o.name), what: zWhat_(o.t, o.prog, o.lang, o.pn), when: zWhen_(o.s, zEnd_(o), o.tz, o.lang), short: zShort_(o.s, o.tz),
    manage: zManage_(o.lang, o.pk || o.no, o.ck), again: zAgain_(o.lang, o.pk || o.no, o.ck), kv: o.kv, sign: L.sign };
  var zoom = zZoom_(); v.zoom = zoom; v.zoomL = zoom ? fill_(L.zoomL, v) : L.zoomNo;
  return v;
}
function zMailClient_(o, kind, extra) {
  var L = ZM[o.lang] || ZM.ru, x = extra || {}, v = zVars_(o, L);
  v.hello = fill_(L.hello, v); v.whatL = fill_(L.whatL, v); v.whenL = fill_(L.whenL, v);
  Object.keys(x).forEach(function (k) { v[k] = x[k]; });
  var subj = fill_(L[kind + 'S'], v), body = fill_(L[kind + 'B'], v), opts = {};
  if (kind === 'ok') opts.attachments = [zIcs_([o])];
  send_(o.email, subj, body, opts);
}
/* одно письмо на несколько встреч пакета */
function zListTxt_(list, lang) { var L = ZM[lang] || ZM.ru; return list.map(function (g) { return '— ' + fill_(L.nth, { n: zPn_(g.pn, lang) }) + ': ' + zWhen_(g.s, zEnd_(g), g.tz, lang); }).join('\n'); }
function zMailClientP_(list, kind, extra) {
  var o = list[0], L = ZM[o.lang] || ZM.ru, x = extra || {}, v = zVars_(o, L);
  v.what = L.pkName[o.t] || v.what; v.when = zListTxt_(list, o.lang); v.short = v.short + (list.length > 1 ? ' +' + (list.length - 1) : '');
  v.hello = fill_(L.hello, v); v.whatL = fill_(L.whatL, v); v.whenL = fill_(L.whensL, v); v.later = '';
  Object.keys(x).forEach(function (k) { v[k] = x[k]; });
  var subj = fill_(L[kind + 'PS'], v), body = fill_(L[kind + 'PB'], v), opts = {};
  if (kind === 'ok') opts.attachments = [zIcs_(list)];
  send_(o.email, subj, body, opts);
}
function zLater_(o, left) { var L = ZM[o.lang] || ZM.ru; return left > 0 ? fill_(L.laterP, { left: left, manage: zManage_(o.lang, o.pk || o.no, o.ck) }) : ''; }
function zIcsTxt_(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
function zFold_(line) {   // строки iCalendar не длиннее 75 байт
  var out = '', cur = '', n = 0;
  for (var i = 0; i < line.length; i++) {
    var ch = line.charAt(i), cc = line.charCodeAt(i), b = cc < 0x80 ? 1 : cc < 0x800 ? 2 : (cc >= 0xD800 && cc < 0xDC00) ? 4 : (cc >= 0xDC00 && cc < 0xE000) ? 0 : 3;
    if (n + b > 73) { out += cur + '\r\n '; cur = ''; n = 1; }
    cur += ch; n += b;
  }
  return out + cur;
}
function zIcsDate_(ms) { return Utilities.formatDate(new Date(ms), 'UTC', "yyyyMMdd'T'HHmmss'Z'"); }
/* файл для календаря: одна или несколько встреч (у клиентки — время встречи без запаса) */
function zIcs_(list) {
  if (!Array.isArray(list)) list = [list];
  var o = list[0], L = ZM[o.lang] || ZM.ru, zoom = zZoom_() || 'voznesenskaya.ch';
  var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//voznesenskaya.ch//zapis//' + String(o.lang).toUpperCase(), 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  list.forEach(function (g) {
    var manage = zManage_(g.lang, g.pk || g.no, g.ck);
    var sum = fill_(L.icsT, { type: zShortName_(g.t, g.prog, g.lang, g.pn) });
    var desc = fill_(L.icsD, { what: zWhat_(g.t, g.prog, g.lang, g.pn), zoom: zZoom_() || '', manage: manage });
    lines.push('BEGIN:VEVENT', 'UID:' + g.no + '@voznesenskaya.ch', 'DTSTAMP:' + zIcsDate_(Date.now()), 'DTSTART:' + zIcsDate_(g.s), 'DTEND:' + zIcsDate_(zEnd_(g)),
      'SUMMARY:' + zIcsTxt_(sum), 'LOCATION:' + zIcsTxt_(zoom), 'DESCRIPTION:' + zIcsTxt_(desc), 'URL:' + manage,
      'ORGANIZER;CN=' + zIcsTxt_(g.lang === 'uk' ? 'Ірина Вознесенська' : g.lang === 'ru' ? 'Ирина Вознесенская' : 'Iryna Voznesenskaya') + ':mailto:' + FROM,
      'BEGIN:VALARM', 'TRIGGER:-PT30M', 'ACTION:DISPLAY', 'DESCRIPTION:' + zIcsTxt_(L.icsA), 'END:VALARM', 'END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return Utilities.newBlob(lines.map(zFold_).join('\r\n') + '\r\n', 'text/calendar', (list.length > 1 ? 'vstrechi-' + (o.pk || o.no) : 'vstrecha-' + o.no) + '.ics');
}
function zGcal_(o) {
  var L = ZM[o.lang] || ZM.ru;
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(fill_(L.icsT, { type: zShortName_(o.t, o.prog, o.lang, o.pn) })) +
    '&dates=' + zIcsDate_(o.s) + '/' + zIcsDate_(zEnd_(o)) + '&details=' + encodeURIComponent(fill_(L.icsD, { what: zWhat_(o.t, o.prog, o.lang, o.pn), zoom: zZoom_() || '', manage: zManage_(o.lang, o.pk || o.no, o.ck) })) +
    '&location=' + encodeURIComponent(zZoom_() || 'Zoom');
}
function zGcalList_(list) { var L = ZM[list[0].lang] || ZM.ru; return list.map(function (g) { return '— ' + fill_(L.nth, { n: zPn_(g.pn, g.lang) }) + ': ' + zGcal_(g); }).join('\n'); }
function zOwner_() { return props_().getProperty('OWNER') || Session.getEffectiveUser().getEmail(); }
function zMailIrina_(subject, body) { GmailApp.sendEmail(zOwner_(), subject, body, { name: 'Запись на встречи · voznesenskaya.ch' }); }
function zIrinaCard_(o) {
  return 'Встреча: ' + zRuName_(o.t, o.prog, o.pn) + '\nВремя: ' + zWhenRu_(o.s, zEnd_(o), o.tz) + '\nНомер записи: ' + o.no + (o.pk ? ' (пакет ' + o.pk + ')' : '') +
    '\n\nИмя: ' + o.name + '\nE-mail: ' + o.email + (o.contact ? '\nTelegram или телефон: ' + o.contact : '') + '\nЯзык: ' + o.lang +
    (o.kv ? '\nДоговор: ' + o.kv : '') + (o.comment ? '\nС чем приходит: ' + o.comment : '') + (o.from ? '\nЭто перенос записи ' + o.from : '');
}
function zIrinaCardP_(list) {
  var o = list[0], T = ZT[o.t] || {};
  return 'Пакет: ' + (ZM.ru.pkName[o.t] || o.t) + '\nНомер пакета: ' + (o.pk || o.no) + '\nВстречи (' + list.length + ' из ' + T.pk + ', в календаре по ' + (o.dur + (T.res || 0)) + ' минут с запасом):\n' +
    list.map(function (g) { return '— ' + g.pn + ': ' + zWhenRu_(g.s, zEnd_(g), g.tz) + ' · ' + g.no; }).join('\n') +
    '\n\nИмя: ' + o.name + '\nE-mail: ' + o.email + (o.contact ? '\nTelegram или телефон: ' + o.contact : '') + '\nЯзык: ' + o.lang +
    (o.kv ? '\nДоговор: ' + o.kv : '') + (o.comment ? '\nС чем приходит: ' + o.comment : '');
}
function zMailIrinaNew_(o) {
  zMailIrina_('Запись: ' + zRuName_(o.t, o.prog, o.pn) + ' — ' + o.name + ', ' + zFmt_(o.s, TZ, 'dd.MM. HH:mm') + (o.from ? ' (перенос)' : '') + ' · ответить до ' + zFmt_(o.dl, TZ, 'dd.MM. HH:mm'),
    'Новый запрос на встречу с сайта voznesenskaya.ch/zapis/.\n\n' + zIrinaCard_(o) +
    '\n\nВремя уже стоит в календаре «Коучинг с Ириной Вознесенской» серым как предварительное.' +
    '\n\nПодтвердить или отклонить (после ответа клиентке сразу уходит письмо):\n' + zAdminUrl_(o.no, o.ik) +
    '\n\nЕсли не ответить до ' + zFmt_(o.dl, TZ, 'dd.MM.yyyy HH:mm') + ', время освободится само, а клиентке уйдёт письмо выбрать другое.');
}
function zMailIrinaNewP_(list) {
  var o = list[0];
  zMailIrina_('Запись: ' + (ZM.ru.pkName[o.t] || o.t).split(':')[0] + ', ещё ' + list.length + ' встр. — ' + o.name + ', с ' + zFmt_(o.s, TZ, 'dd.MM. HH:mm') + ' · ответить до ' + zFmt_(o.dl, TZ, 'dd.MM. HH:mm'),
    'Клиентка выбрала время для встреч своего пакета на сайте voznesenskaya.ch/zapis/.\n\n' + zIrinaCardP_(list) +
    '\n\nВремя уже стоит в календаре «Коучинг с Ириной Вознесенской» серым как предварительное.' +
    '\n\nПодтвердить или отклонить все эти встречи одной кнопкой:\n' + zAdminUrl_(o.no, o.ik) +
    '\n\nЕсли не ответить до ' + zFmt_(o.dl, TZ, 'dd.MM.yyyy HH:mm') + ', время освободится само.');
}

/* ---------- GET ---------- */
function zapisGet_(p) {
  if (p.a === 'slots') {
    var t = ZT[p.t] ? p.t : 'intro', c = CacheService.getScriptCache(), k = 'zslots:' + t, hit = c.get(k);
    if (hit) return ContentService.createTextOutput(hit).setMimeType(ContentService.MimeType.JSON);
    var now = Date.now(), T = ZT[t];
    var out = JSON.stringify({ ok: true, t: t, dur: T.dur, res: T.res || 0, buf: T.buf, n: T.pk || 1, term: T.term || 0, max: ZW.max, tz: TZ, now: now, slots: zSlots_(t, zBusy_(false), now) });
    try { c.put(k, out, 120); } catch (e) {}
    return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON);
  }
  if (p.a === 'zinfo') {
    var sh = zSheet_(), f = zFind_(sh, p.z);
    if (!f) return json_({ ok: false, err: 'notfound' });
    var o = zObj_(f.v);
    if (!p.k || String(p.k) !== String(o.ck)) return json_({ ok: false, err: 'key' });
    var now2 = Date.now();
    var item = function (x) {
      var act = !!Z_ACTIVE[x.st];
      return { no: x.no, st: x.st, t: x.t, prog: x.prog, pn: x.pn, s: x.s, e: zEnd_(x), dur: x.dur, kv: x.kv, to: x.to, dl: x.dl, who: x.who,
        free: x.s - Z_FREE_H * 36e5 > now2, past: x.s < now2, canCancel: act && x.s > now2,
        canMove: !x.to && ((act && x.s > now2 && (x.st !== 'подтверждена' || x.s - Z_FREE_H * 36e5 > now2)) || (!x.pk && (x.st === 'отклонена' || x.st === 'истекла'))) };
    };
    if (o.pk) {   // пакет: все встречи пакета одним списком
      var rows = zGroup_(sh, o.pk), T2 = ZT[o.t], used = rows.filter(zCounts_), first = used.length ? used[0].s : 0;
      var waitKv = rows.some(function (x) { return x.st === 'ждёт договор'; }), kv = (rows.filter(function (x) { return x.kv; })[0] || {}).kv || '';
      var left = T2.pk - used.length, until = first ? first + T2.term * 864e5 : 0;
      return json_({ ok: true, pk: true, no: o.pk, t: o.t, prog: o.prog, n: T2.pk, term: T2.term, dur: T2.dur, res: T2.res || 0, buf: T2.buf, tz: o.tz, lang: o.lang, name: zFirst_(o.name), kv: kv,
        left: left, first: first, until: until, canAdd: left > 0 && !!kv && !waitKv && (!until || until > now2 + ZW.lead * 864e5),
        fixed: used.map(function (x) { return x.s; }),
        contract: waitKv ? zContractUrl_(o.lang, o.t, o.pk, o.ck) : '',
        items: rows.filter(function (x) { return x.st !== 'перенесена' && (zCounts_(x) || x.st === 'отклонена' || x.st === 'истекла' || x.st === 'отменена'); }).map(item) });
    }
    var r = item(o); r.ok = true; r.lang = o.lang; r.tz = o.tz; r.name = zFirst_(o.name);
    r.contract = o.st === 'ждёт договор' ? zContractUrl_(o.lang, o.t === 'mentor' ? 'mentor' : o.prog, o.no, o.ck) : '';
    return json_(r);
  }
  if (p.a === 'zok') return zAdminPage_(p);
  return null;
}

/* ---------- POST ---------- */
function zapisPost_(d) {
  if (d.kind === 'zapis') return zCreate_(d);
  if (d.kind === 'zapis-otmena') return zCancel_(d);
  return json_({ ok: false, err: 'kind' });
}
function zNewNo_(sh, taken) {
  var AB = '23456789ABCDEFGHJKMNPQRSTUVWXYZ', day = Utilities.formatDate(new Date(), TZ, 'yyyyMMdd');
  for (var i = 0; i < 30; i++) {
    var r = ''; for (var j = 0; j < 4; j++) r += AB.charAt(Math.floor(Math.random() * AB.length));
    var no = 'ZP-' + day + '-' + r; if (!zFind_(sh, no) && (!taken || taken.indexOf(no) < 0)) return no;
  }
  throw new Error('no number');
}
function zKvCheck_(kv, email) {   // встреча программы: договор должен быть и e-mail — тот же, что в договоре
  var m = RX_NO.exec(String(kv || '')); if (!m) return false;
  var sh = book_().getSheetByName(m[1]); if (!sh) return false;
  var cell = sh.createTextFinder(kv).matchEntireCell(true).findNext(); if (!cell) return false;
  var v = sh.getRange(cell.getRow(), 1, 1, HEAD.length).getValues()[0];
  return String(v[HEAD.indexOf('E-mail')]).toLowerCase() === String(email).toLowerCase() && v[HEAD.indexOf('Статус')] !== 'отклонён';
}
function zRow_(o, consent) {
  var row = []; for (var ri = 0; ri < ZHEAD.length; ri++) row.push('');
  row[ZC['Номер']] = o.no; row[ZC['Создан (Цюрих)']] = fmtNow_(); row[ZC['Статус']] = o.st; row[ZC['Вид']] = o.t; row[ZC['Встреча']] = zRuName_(o.t, o.prog, o.pn); row[ZC['Программа']] = o.prog;
  row[ZC['Начало (Цюрих)']] = zFmt_(o.s, TZ, 'dd.MM.yyyy HH:mm'); row[ZC['Конец (Цюрих)']] = zFmt_(zEnd_(o), TZ, 'dd.MM.yyyy HH:mm'); row[ZC['Начало, мс']] = o.s; row[ZC['Минут']] = o.dur;
  row[ZC['Часовой пояс']] = o.tz; row[ZC['Язык']] = o.lang; row[ZC['Имя']] = o.name; row[ZC['E-mail']] = o.email; row[ZC['Telegram или телефон']] = o.contact; row[ZC['С чем приходит']] = o.comment;
  row[ZC['Договор']] = o.kv; row[ZC['Срок (Цюрих)']] = zFmt_(o.dl, TZ, 'dd.MM.yyyy HH:mm'); row[ZC['Срок, мс']] = o.dl; row[ZC['Перенос с']] = o.from; row[ZC['Событие']] = o.ev;
  row[ZC['Ключ Ирины']] = o.ik; row[ZC['Ключ клиентки']] = o.ck; row[ZC['Согласия']] = consent; row[ZC['Пакет']] = o.pk || ''; row[ZC['В пакете']] = o.pn || '';
  return row;
}
function zCreate_(d) {
  if (d.website) return json_({ ok: true, no: '', st: '' });   // поле-ловушка для роботов
  var lang = LANGS[d.lang] ? d.lang : 'ru', now = Date.now(), sh = zSheet_(), old = null, grp = null, t, prog = '', name, email, contact, comment = '', kv = '', tz = zOkTz_(d.tz);
  var starts = [], fixed = [], consent = '18+, не терапия, данные для записи · ' + clean_(d.consentAt, 40), pk = '', pnFrom = 0, keys = null, freeN = null;
  var uniq = function (a) { return a.map(function (x) { return Math.round(Number(x) || 0); }).filter(function (x, i, aa) { return x > 0 && aa.indexOf(x) === i; }).sort(function (a2, b2) { return a2 - b2; }); };
  if (d.from) {   // перенос или новое время после отказа: данные берём из прежней записи
    var f = zFind_(sh, d.from); if (!f) return json_({ ok: false, err: 'notfound' });
    old = zObj_(f.v); old.r = f.r;
    if (!d.fromKey || String(d.fromKey) !== String(old.ck)) return json_({ ok: false, err: 'key' });
    /* новое время после неудачного переноса: переносим ту встречу, которая ещё в силе */
    for (var hop = 0; hop < 5 && old.from && !Z_ACTIVE[old.st]; hop++) {
      var g0 = zFind_(sh, old.from); if (!g0) break;
      var o0 = zObj_(g0.v); if (!(Z_ACTIVE[o0.st] || o0.st === 'отклонена' || o0.st === 'истекла')) break;
      if (o0.to && o0.to !== old.no) break;
      o0.r = g0.r; old = o0;
    }
    if (old.to) return json_({ ok: false, err: 'moved' });
    var act = !!Z_ACTIVE[old.st];
    if (!(act || old.st === 'отклонена' || old.st === 'истекла')) return json_({ ok: false, err: 'state' });
    if (old.pk && !act) return json_({ ok: false, err: 'state' });   // свободное место в пакете выбирается через «добавить встречи»
    if (old.st === 'подтверждена' && old.s - Z_FREE_H * 36e5 <= now) return json_({ ok: false, err: 'late' });
    t = old.t; prog = old.prog; name = old.name; email = old.email; contact = old.contact; comment = old.comment; kv = old.kv; lang = LANGS[d.lang] ? d.lang : old.lang;
    if (!d.tz) tz = zOkTz_(old.tz);
    starts = uniq([d.start]).slice(0, 1); consent = 'как в ' + old.no;
    if (old.pk) { pk = old.pk; keys = { ik: old.ik, ck: old.ck }; fixed = zGroup_(sh, pk).filter(function (x) { return zCounts_(x) && x.no !== old.no; }).map(function (x) { return x.s; }); }   // встреча пакета: ключи пакета остаются те же
  } else if (d.add) {   // пакет: время для остальных встреч
    var fa = zFind_(sh, d.add); if (!fa) return json_({ ok: false, err: 'notfound' });
    var oa = zObj_(fa.v); if (!oa.pk || !d.key || String(d.key) !== String(oa.ck)) return json_({ ok: false, err: 'key' });
    grp = zGroup_(sh, oa.pk);
    if (grp.some(function (x) { return x.st === 'ждёт договор'; })) return json_({ ok: false, err: 'state' });
    var ref = grp.filter(function (x) { return x.kv; })[0]; if (!ref) return json_({ ok: false, err: 'state' });
    t = ref.t; prog = ref.prog; name = ref.name; email = ref.email; contact = ref.contact; comment = ref.comment; kv = ref.kv; pk = oa.pk;
    lang = LANGS[d.lang] ? d.lang : ref.lang; if (!d.tz) tz = zOkTz_(ref.tz); keys = { ik: ref.ik, ck: ref.ck };
    var used = grp.filter(zCounts_); fixed = used.map(function (x) { return x.s; }); pnFrom = used.length;
    var takenN = used.map(function (x) { return parseInt(x.pn, 10) || 0; }); freeN = []; for (var q = 1; q <= ZT[t].pk; q++) if (takenN.indexOf(q) < 0) freeN.push(q);
    starts = uniq(d.starts || []); if (!starts.length || starts.length > ZT[t].pk - used.length) return json_({ ok: false, err: 'data' });
    consent = 'как в ' + pk;
  } else {
    t = String(d.t || ''); if (!ZT[t]) return json_({ ok: false, err: 'data' });
    if (t === 'razbor') { prog = String(d.prog || ''); if (!ZPROG[prog]) return json_({ ok: false, err: 'data' }); }
    if (t === 'mentor') prog = 'mentor';
    if (ZT[t].pk) prog = t;
    name = clean_(d.name, 100).trim(); email = String(d.email || '').trim().slice(0, 120); contact = clean_(d.contact, 80); comment = clean_(d.comment, 600);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || name.length < 2) return json_({ ok: false, err: 'data' });
    var c = d.consents || {}; if (!c.adult || !c.coach || !c.data) return json_({ ok: false, err: 'consents' });
    if (t === 'prog') { kv = String(d.kv || '').trim().toUpperCase(); if (!zKvCheck_(kv, email)) return json_({ ok: false, err: 'kv' }); }
    /* не больше двух будущих записей с одного e-mail (пакет считается одной записью) */
    var mine = {}; zAll_(sh).forEach(function (x) { var ox = zObj_(x.v); if (String(ox.email).toLowerCase() === email.toLowerCase() && Z_ACTIVE[ox.st] && ox.s > now) mine[ox.pk || ox.no] = 1; });
    if (Object.keys(mine).length >= 2) return json_({ ok: false, err: 'many' });
    starts = ZT[t].pk ? uniq(d.starts && d.starts.length ? d.starts : [d.start]) : uniq([d.start]).slice(0, 1);
    if (!starts.length || (ZT[t].pk && starts.length > ZT[t].pk)) return json_({ ok: false, err: 'data' });
  }
  var cache = CacheService.getScriptCache(), dk = 'zd:' + Utilities.formatDate(new Date(), TZ, 'yyyyMMdd'), nd = +(cache.get(dk) || 0);
  if (nd >= 30) return json_({ ok: false, err: 'limit' });
  var T = ZT[t], list = [];
  var lock = LockService.getScriptLock(); lock.waitLock(25000);
  try {
    var slots = zSlots_(t, zBusy_(true), now);
    if (T.pk) { var why = zPkCheck_(t, starts, fixed, now, slots); if (why) return json_({ ok: false, err: why }); }
    else if (slots.indexOf(starts[0]) < 0) return json_({ ok: false, err: 'slot' });
    var st = (T.paid && !kv) ? 'ждёт договор' : 'ждёт подтверждения';
    var dl = now + (st === 'ждёт договор' ? Z_HOLD_H : Z_ANSWER_H) * 36e5;
    var ik = keys ? keys.ik : Utilities.getUuid().replace(/-/g, ''), ck = keys ? keys.ck : Utilities.getUuid().replace(/-/g, ''), taken = [];
    starts.forEach(function (s, i) {
      var o = { no: zNewNo_(sh, taken), st: st, t: t, prog: prog, s: s, dur: T.dur, tz: tz, lang: lang, name: name, email: email, contact: contact, comment: comment, kv: kv,
        dl: dl, flags: '', from: old ? old.no : '', to: '', ik: ik, ck: ck, who: '', pk: pk, pn: '' };
      taken.push(o.no);
      if (T.pk) { if (!o.pk) o.pk = taken[0]; o.pn = old ? old.pn : (freeN ? freeN[i] : i + 1) + '/' + T.pk; }
      zEvMake_(o);
      sh.appendRow(zRow_(o, consent));
      list.push(o);
    });
    if (old) {   // прежняя запись: неподтверждённая освобождается сразу, подтверждённая остаётся в силе, пока Ирина не подтвердит новое время
      if (old.st === 'ждёт подтверждения' || old.st === 'ждёт договор') { zEvDel_(old.ev); zSet_(sh, old.r, { 'Статус': 'перенесена', 'Перенесено на': list[0].no }); }
      else zSet_(sh, old.r, { 'Перенесено на': list[0].no });
    }
    cache.put(dk, String(nd + 1), 86400); cache.remove('zbusy'); Object.keys(ZT).forEach(function (k) { cache.remove('zslots:' + k); });
  } finally { lock.releaseLock(); }
  var o1 = list[0], L = ZM[o1.lang] || ZM.ru;
  var left = T.pk ? T.pk - pnFrom - list.length : 0;
  if (o1.st === 'ждёт договор') {
    var curl = zContractUrl_(o1.lang, T.pk ? t : o1.prog, o1.pk || o1.no, o1.ck);
    if (T.pk) zMailClientP_(list, 'hold', { contract: curl, later: zLater_(o1, left) });
    else zMailClient_(o1, 'hold', { contract: curl });
  } else if (list.length > 1) {
    zMailClientP_(list, 'req'); zMailIrinaNewP_(list);
  } else {
    zMailClient_(o1, 'req', { resch: old && old.st === 'подтверждена' ? fill_(L.resch, { old: zWhen_(old.s, zEnd_(old), o1.tz, o1.lang) }) : '' });
    zMailIrinaNew_(o1);
  }
  return json_({ ok: true, no: o1.pk || o1.no, st: o1.st, s: o1.s, e: zEnd_(o1), left: left, manage: zManage_(o1.lang, o1.pk || o1.no, o1.ck),
    items: list.map(function (x) { return { no: x.no, s: x.s, e: zEnd_(x), pn: x.pn }; }),
    contract: o1.st === 'ждёт договор' ? zContractUrl_(o1.lang, T.pk ? t : o1.prog, o1.pk || o1.no, o1.ck) : '' });
}
function zCancel_(d) {
  var sh = zSheet_(), now = Date.now(), lock = LockService.getScriptLock(); lock.waitLock(20000);
  var o, late;
  try {
    var f = zFind_(sh, d.z); if (!f) return json_({ ok: false, err: 'notfound' });
    o = zObj_(f.v);
    if (!d.k || String(d.k) !== String(o.ck)) return json_({ ok: false, err: 'key' });
    if (!Z_ACTIVE[o.st]) return json_({ ok: false, err: 'state', st: o.st });
    if (o.s <= now) return json_({ ok: false, err: 'past' });
    late = o.st === 'подтверждена' && o.s - Z_FREE_H * 36e5 <= now;
    zEvDel_(o.ev);
    zSet_(sh, f.r, { 'Статус': 'отменена', 'Отменено (Цюрих)': fmtNow_(), 'Кто отменил': 'клиентка' + (late ? ', меньше чем за 24 часа' : '') });
    zUnmove_(sh, o);
    CacheService.getScriptCache().remove('zbusy'); Object.keys(ZT).forEach(function (k) { CacheService.getScriptCache().remove('zslots:' + k); });
  } finally { lock.releaseLock(); }
  var L = ZM[o.lang] || ZM.ru, paid = ZT[o.t] && (ZT[o.t].paid || o.t === 'prog');
  zMailClient_(o, 'cancel', { late: late && paid ? L.lateHeld : (o.t === 'intro' ? '' : L.lateFree), again: o.pk ? zAgain_(o.lang, o.pk, o.ck) : zBase_(o.lang) + 'zapis/' });
  zMailIrina_('Отмена: ' + zRuName_(o.t, o.prog, o.pn) + ' — ' + o.name + ', ' + zFmt_(o.s, TZ, 'dd.MM. HH:mm') + (late ? ' (меньше чем за 24 часа)' : ''),
    'Клиентка отменила запись на сайте. Время в календаре освобождено.\n\n' + zIrinaCard_(o) + '\nБыл статус: ' + o.st +
    (late && paid ? '\n\nДо начала оставалось меньше 24 часов: по условиям работы встреча считается проведённой. Клиентке написано, что при серьёзной причине вы найдёте решение.' : '') +
    (o.pk && !late ? '\n\nЭто встреча пакета: место в пакете освободилось, клиентка может выбрать для неё новое время по своей ссылке.' : ''));
  return json_({ ok: true, late: !!late });
}

/* новое время по переносу не состоялось (отказ, истёк срок, отмена): подтверждённую прежнюю встречу снова можно переносить */
function zUnmove_(sh, o) {
  if (!o.from) return;
  var g = zFind_(sh, o.from); if (!g) return;
  var old = zObj_(g.v); if (old.st === 'подтверждена' && old.to === o.no) zSet_(sh, g.r, { 'Перенесено на': '' });
}

/* ---------- страница Ирины: подтвердить или отклонить ---------- */
/* что подтверждает одна ссылка: у пакета — все его встречи, которые ждут ответа (общий ключ), иначе одна запись */
function zPending_(sh, o, key) {
  if (!o.pk) return o.st === 'ждёт подтверждения' ? [o] : [];
  return zGroup_(sh, o.pk).filter(function (x) { return x.st === 'ждёт подтверждения' && String(x.ik) === String(key); });
}
function zAdminPage_(p) {
  var sh = zSheet_(), f = zFind_(sh, p.z), o = f ? zObj_(f.v) : null;
  var wrap = function (inner) {
    return HtmlService.createHtmlOutput('<div style="font-family:Arial,sans-serif;max-width:560px;margin:28px auto;padding:0 16px;line-height:1.5;color:#2F2924">' + inner + '</div>')
      .setTitle('Запись на встречу').addMetaTag('viewport', 'width=device-width, initial-scale=1');
  };
  if (!o || !p.k || String(p.k) !== String(o.ik)) return wrap('<p>Ссылка неверная. Открой её из письма о записи.</p>');
  var list = zPending_(sh, o, p.k), many = list.length > 1;
  if (!list.length)
    return wrap('<h2 style="font-weight:normal;color:#6E4F3C">Запись ' + esc_(o.pk || o.no) + '</h2><p><b>Статус: ' + esc_(o.st) + '.</b> Здесь больше ничего делать не нужно.</p><p style="color:#7A6E62">' + esc_(zIrinaCard_(o)).replace(/\n/g, '<br>') + '</p>');
  var card = esc_(o.pk ? zIrinaCardP_(list) : zIrinaCard_(o)).replace(/\n/g, '<br>');
  var kvTxt = o.kv ? '<p>Вместе с временем подтвердится договор <b>' + esc_(o.kv) + '</b> (если он ещё не подтверждён). Клиентка получит одно письмо: договор действует, ' + (many ? 'все встречи' : 'время') + ', ссылка Zoom и файл для календаря.</p>' : '';
  var zoomWarn = zZoom_() ? '' : '<p style="background:#FDECEA;border:1px solid #D32F2F;border-radius:10px;padding:8px 12px">Ссылка Zoom ещё не записана в свойствах скрипта (ZOOM_URL). Клиентка получит письмо «ссылку пришлю отдельно».</p>';
  var btn = 'font-size:16px;padding:12px 20px;border:0;border-radius:12px;cursor:pointer;margin:6px 8px 6px 0;';
  var okTxt = (o.kv && ZT[o.t].paid ? 'Подтвердить договор и ' : 'Подтвердить ') + (many ? (o.kv && ZT[o.t].paid ? 'встречи' : 'время встреч') : 'время');
  return wrap('<h2 style="font-weight:normal;color:#6E4F3C">' + (many ? 'Подтвердить встречи пакета?' : 'Подтвердить запись?') + '</h2><p>' + card + '</p>' + kvTxt + zoomWarn +
    '<p><button id="ok" style="' + btn + 'background:#4F5E3E;color:#fff">' + okTxt + '</button></p>' +
    '<details style="margin-top:10px"><summary style="cursor:pointer">' + (many ? 'Это время не подходит — отклонить все эти встречи' : 'Это время не подходит — отклонить') + '</summary>' +
    '<p>Что написать клиентке (по желанию, на её языке):</p><textarea id="msg" maxlength="600" style="width:100%;min-height:80px;font:inherit;border:1.5px solid #E5D9C9;border-radius:10px;padding:8px"></textarea>' +
    '<p><button id="no" style="' + btn + 'background:#6E4F3C;color:#fff">Отклонить и предложить выбрать другое время</button></p></details><p id="m"></p>' +
    '<script>var z=' + JSON.stringify(String(o.no)) + ',k=' + JSON.stringify(String(p.k)) + ',m=document.getElementById("m");' +
    'function go(b,f){document.getElementById("ok").disabled=true;document.getElementById("no").disabled=true;m.textContent="Минутку…";' +
    'google.script.run.withSuccessHandler(function(t){m.textContent=t;}).withFailureHandler(function(){m.textContent="Не получилось. Попробуй ещё раз.";document.getElementById("ok").disabled=false;document.getElementById("no").disabled=false;})[f](z,k,document.getElementById("msg").value);}' +
    'document.getElementById("ok").onclick=function(){go(this,"zapisPodtverdit");};document.getElementById("no").onclick=function(){go(this,"zapisOtklonit");};</script>');
}
/* договор, привязанный к записи: подтвердить без отдельного письма (письмо одно — о встрече) */
function zKvConfirm_(kv) {
  var m = RX_NO.exec(String(kv || '')); if (!m) return { ok: false };
  var sh = yearSheet_(book_(), m[1]), cell = sh.createTextFinder(kv).matchEntireCell(true).findNext();
  if (!cell) return { ok: false, why: 'договор ' + kv + ' не найден' };
  var row = cell.getRow(), v = sh.getRange(row, 1, 1, HEAD.length).getValues()[0], st = v[HEAD.indexOf('Статус')];
  if (st === 'отклонён') return { ok: false, why: 'договор ' + kv + ' отклонён' };
  var eu = v[HEAD.indexOf('ЕС/ЕЭЗ')] === 'да';
  if (st === 'подтверждён') return { ok: true, already: true, eu: eu };
  sh.getRange(row, HEAD.indexOf('Статус') + 1, 1, 2).setValues([['подтверждён', fmtNow_()]]);
  return { ok: true, already: false, eu: eu, total: v[HEAD.indexOf('Итого CHF')] };
}
function zapisPodtverdit(no, key) {
  var sh = zSheet_(), lock = LockService.getScriptLock(); lock.waitLock(20000);
  var o, list, kvr = null, now = Date.now();
  try {
    var f = zFind_(sh, no); if (!f) return 'Запись ' + no + ' не найдена.';
    o = zObj_(f.v); o.r = f.r;
    if (!key || String(key) !== String(o.ik)) return 'Ссылка неверная. Открой её из письма о записи.';
    list = zPending_(sh, o, key).filter(function (x) { return x.s > now; });
    if (!list.length) return o.st === 'подтверждена' ? 'Запись ' + no + ' уже подтверждена.' : 'Ждущих ответа встреч здесь нет (статус «' + o.st + '»).';
    o = list[0];
    if (o.kv && ZT[o.t].paid) { kvr = zKvConfirm_(o.kv); if (!kvr.ok) return 'Не подтверждено: ' + kvr.why + '. Напиши клиентке сама.'; }
    list.forEach(function (x) {
      x.st = 'подтверждена';
      var ev = zEvGet_(x.ev);
      if (!ev) ev = zEvMake_(x); else zEvPaint_(ev, x);
      zSet_(sh, x.r, { 'Статус': x.st, 'Подтверждено (Цюрих)': fmtNow_(), 'Событие': x.ev });
      if (x.from) {   // перенос: прежняя запись освобождается
        var g = zFind_(sh, x.from);
        if (g) { var oldO = zObj_(g.v); if (Z_ACTIVE[oldO.st]) { zEvDel_(oldO.ev); zSet_(sh, g.r, { 'Статус': 'перенесена', 'Перенесено на': x.no }); } else zSet_(sh, g.r, { 'Перенесено на': x.no }); }
      }
    });
    CacheService.getScriptCache().remove('zbusy');
  } finally { lock.releaseLock(); }
  var L = ZM[o.lang] || ZM.ru, extra = '', T = ZT[o.t], pkg = !!o.pk && (list.length > 1 || (kvr && !kvr.already));
  var payTxt = pkg ? L.exPayP : L.exPay;
  if (o.t === 'intro') extra = L.exFree;
  else if (kvr && !kvr.already) extra = fill_(L.exKv, { kv: o.kv, today: Utilities.formatDate(new Date(), TZ, 'dd.MM.yyyy'), eu: kvr.eu ? L.eu : '' }) + payTxt;
  else if (T.paid && !o.pk) extra = payTxt;
  else if (o.kv) extra = fill_(L.exProg, { kv: o.kv });
  if (pkg) zMailClientP_(list, 'ok', { extra: extra, gcal: zGcalList_(list), later: zLater_(o, zPkLeft_(T, zGroup_(sh, o.pk))) });
  else zMailClient_(o, 'ok', { extra: extra, gcal: zGcal_(o) });
  var tail = [];
  if (kvr && !kvr.already) tail.push('договор ' + o.kv + ' подтверждён');
  if (T.paid && (!o.pk || (kvr && !kvr.already))) tail.push('счёт Alonira.ch AG нужно выставить до ' + (o.pk ? 'первой встречи' : 'встречи') + ' (дело во вторничной задаче «Alonira: счета и оплаты»)');
  if (!zZoom_()) tail.push('ссылки Zoom нет в свойствах скрипта — пришли её клиентке сама');
  return 'Готово: ' + (list.length > 1 ? 'встречи (' + list.length + ') с ' + zFmt_(o.s, TZ, 'dd.MM.yyyy HH:mm') + ' подтверждены' : 'встреча ' + zFmt_(o.s, TZ, 'dd.MM.yyyy HH:mm') + ' подтверждена') +
    ', письмо отправлено на ' + o.email + '.' + (tail.length ? ' ' + tail.join('; ') + '.' : '');
}
function zapisOtklonit(no, key, msg) {
  var sh = zSheet_(), lock = LockService.getScriptLock(); lock.waitLock(20000);
  var o, list;
  try {
    var f = zFind_(sh, no); if (!f) return 'Запись ' + no + ' не найдена.';
    o = zObj_(f.v); o.r = f.r;
    if (!key || String(key) !== String(o.ik)) return 'Ссылка неверная. Открой её из письма о записи.';
    list = o.pk ? zGroup_(sh, o.pk).filter(function (x) { return (x.st === 'ждёт подтверждения' || x.st === 'ждёт договор') && String(x.ik) === String(key); })
      : (o.st === 'ждёт подтверждения' || o.st === 'ждёт договор') ? [o] : [];
    if (!list.length) return 'Запись ' + no + ': статус «' + o.st + '», отклонить уже нельзя.';
    list.forEach(function (x) {
      zEvDel_(x.ev);
      zSet_(sh, x.r, { 'Статус': 'отклонена', 'Отменено (Цюрих)': fmtNow_(), 'Кто отменил': 'Ирина', 'Заметка': clean_(msg, 600) });
      zUnmove_(sh, x);
    });
    o = list[0];
    CacheService.getScriptCache().remove('zbusy');
  } finally { lock.releaseLock(); }
  var L = ZM[o.lang] || ZM.ru, m = String(msg || '').trim().slice(0, 600);
  var ex = { msg: m ? fill_(L.msg, { msg: m }) : '', kvNote: o.kv && ZT[o.t].paid ? fill_(L.kvNote, { kv: o.kv }) : '' };
  if (list.length > 1) zMailClientP_(list, 'no', ex); else zMailClient_(o, 'no', ex);
  return 'Готово: ' + (list.length > 1 ? 'встречи (' + list.length + ') отклонены' : 'запись отклонена') + ', клиентке ушло письмо с предложением выбрать другое время' + (o.from ? ' (прежняя запись ' + o.from + ' остаётся в силе)' : '') + '.';
}

/* ---------- договор подписан по ссылке из записи (вызывает doPost договора) ---------- */
/* у пакета к договору привязываются все встречи, которые его ждали; ответ: o — первая, list — все привязанные */
function zLinkContract_(z, zk, kvNo) {
  var sh = zSheet_(), f = zFind_(sh, z); if (!f) return { ok: false, why: 'запись ' + z + ' не найдена' };
  var o = zObj_(f.v); o.r = f.r; if (!zk || String(zk) !== String(o.ck)) return { ok: false, why: 'ключ записи неверный' };
  var now = Date.now(), cand = o.pk ? zGroup_(sh, o.pk).filter(function (x) { return x.ck === o.ck && !x.to && (x.st === 'ждёт договор' || x.st === 'истекла'); }) : [o];
  var list = [], miss = [], busy = null;
  cand.forEach(function (x) {
    if (x.st !== 'ждёт договор' && x.st !== 'истекла') return;
    if (x.st === 'истекла') {   // договор подписан позже 24 часов: если время ещё свободно, бронь возвращается
      var T = ZT[x.t]; busy = busy || zBusy_(true);
      if (x.s - now < 864e5 || !zFreeAt_(busy, x.s - T.buf * 6e4, zBEnd_(x) + T.buf * 6e4)) { miss.push(zWhenRu_(x.s, zEnd_(x), x.tz)); return; }
    }
    x.kv = kvNo; x.st = 'ждёт подтверждения'; x.dl = now + Z_ANSWER_H * 36e5;
    var ev = zEvGet_(x.ev);
    if (!ev) ev = zEvMake_(x); else zEvPaint_(ev, x);
    zSet_(sh, x.r, { 'Статус': x.st, 'Договор': kvNo, 'Срок (Цюрих)': zFmt_(x.dl, TZ, 'dd.MM.yyyy HH:mm'), 'Срок, мс': x.dl, 'Событие': x.ev });
    list.push(x);
  });
  if (list.length || miss.length) CacheService.getScriptCache().remove('zbusy');
  if (!list.length) return { ok: false, o: o, why: miss.length ? 'время ' + miss.join('; ') + ' уже освободилось и занято или до него меньше суток' : 'у записи статус «' + o.st + '»' };
  return { ok: true, o: list[0], list: list, miss: miss, pk: o.pk || '' };
}

/* ---------- раз в час ---------- */
function zapisChas() {
  var sh = zSheet_(), now = Date.now(), lock = LockService.getScriptLock(); lock.waitLock(25000);
  var mails = [];
  try {
    zAll_(sh).forEach(function (x) {
      var o = zObj_(x.v); if (!Z_ACTIVE[o.st]) return;
      if (o.st === 'ждёт договор' && now > o.dl) {
        zEvDel_(o.ev); zSet_(sh, x.r, { 'Статус': 'истекла', 'Заметка': 'договор не подписан за 24 часа' }); mails.push(['exp1', o]); return;
      }
      if (o.st === 'ждёт подтверждения') {
        if (now > o.dl || o.s <= now) { zEvDel_(o.ev); zSet_(sh, x.r, { 'Статус': 'истекла', 'Заметка': 'нет ответа Ирины за 48 часов' }); zUnmove_(sh, o); mails.push(['exp2', o]); return; }
        if (o.dl - now < 24 * 36e5 && o.flags.indexOf('ирина24') < 0) { zSet_(sh, x.r, { 'Напоминания': (o.flags + ' ирина24').trim() }); mails.push(['irina24', o]); }
        return;
      }
      if (o.st === 'подтверждена' && o.s > now) {
        var ev = zEvGet_(o.ev);
        if (!ev && o.flags.indexOf('нет события') < 0) { zSet_(sh, x.r, { 'Напоминания': (o.flags + ' нет события').trim() }); mails.push(['gone', o]); return; }
        if (ev && ev.getStartTime().getTime() !== o.s && o.flags.indexOf('время изменено') < 0) { o.flags = (o.flags + ' время изменено').trim(); zSet_(sh, x.r, { 'Напоминания': o.flags }); mails.push(['moved', o, ev.getStartTime().getTime()]); }
        if (o.s - now <= 24 * 36e5 && o.flags.indexOf('клиентка24') < 0 && ev) { zSet_(sh, x.r, { 'Напоминания': (o.flags + ' клиентка24').trim() }); mails.push(['rem', o]); }
      }
    });
  } finally { lock.releaseLock(); }
  /* встречи одного пакета с одним сроком — одним письмом */
  var groups = {}, order = [];
  mails.forEach(function (m) {
    var k = (m[0] === 'exp1' || m[0] === 'exp2' || m[0] === 'irina24') && m[1].pk ? m[0] + '|' + m[1].pk : m[0] + '|' + m[1].no + '|' + order.length;
    if (!groups[k]) { groups[k] = { kind: m[0], list: [], extra: m[2] }; order.push(k); }
    groups[k].list.push(m[1]);
  });
  order.forEach(function (k) {
    var g = groups[k], o = g.list[0], many = g.list.length > 1;
    try {
      if (g.kind === 'exp1') {
        if (o.pk) zMailClientP_(g.list, 'exp1', { again: zBase_(o.lang) + 'zapis/' }); else zMailClient_(o, 'exp1');
      } else if (g.kind === 'exp2') {
        if (many) zMailClientP_(g.list, 'exp2'); else zMailClient_(o, 'exp2');
        zMailIrina_('Запрос истёк: ' + (many ? (ZM.ru.pkName[o.t] || o.t).split(':')[0] + ', ' + g.list.length + ' встр.' : zRuName_(o.t, o.prog, o.pn)) + ' — ' + o.name + ', ' + zFmt_(o.s, TZ, 'dd.MM. HH:mm'),
          'Ответа не было 48 часов, время освобождено, клиентке ушло письмо «прости, не успела ответить, выбери другое время».\n\n' + (many ? zIrinaCardP_(g.list) : zIrinaCard_(o)));
      } else if (g.kind === 'irina24') zMailIrina_('Ждёт ответа ещё 24 часа: ' + (many ? (ZM.ru.pkName[o.t] || o.t).split(':')[0] + ', ' + g.list.length + ' встр.' : zRuName_(o.t, o.prog, o.pn)) + ' — ' + o.name,
        (many ? zIrinaCardP_(g.list) : zIrinaCard_(o)) + '\n\nПодтвердить или отклонить:\n' + zAdminUrl_(o.no, o.ik) + '\n\nБез ответа до ' + zFmt_(o.dl, TZ, 'dd.MM.yyyy HH:mm') + ' время освободится само.');
      else if (g.kind === 'gone') zMailIrina_('Встреча удалена из календаря: ' + o.name + ', ' + zFmt_(o.s, TZ, 'dd.MM. HH:mm'), 'Событие этой подтверждённой встречи пропало из календаря «Коучинг с Ириной Вознесенской». Напоминание клиентке не уйдёт. Если встреча отменяется, напиши клиентке сама и поставь в таблице статус «отменена».\n\n' + zIrinaCard_(o));
      else if (g.kind === 'moved') zMailIrina_('Время встречи изменено в календаре: ' + o.name, 'В календаре встреча стоит на ' + zFmt_(g.extra, TZ, 'dd.MM.yyyy HH:mm') + ', а клиентке подтверждено ' + zFmt_(o.s, TZ, 'dd.MM.yyyy HH:mm') + '. Клиентке я ничего не писал: сообщи ей новое время сама или верни встречу на прежнее место. Напоминание уйдёт по подтверждённому времени.\n\n' + zIrinaCard_(o));
      else if (g.kind === 'rem') zMailClient_(o, 'rem');
    } catch (e) { Logger.log('письмо ' + g.kind + ' ' + o.no + ': ' + e); }
  });
}

/* ---------- установка (один раз, из редактора) ---------- */
function zapisUstanovka() {
  var p = props_();
  if (!p.getProperty('ZFOLDER_ID')) { var fo = DriveApp.createFolder('Запись на встречи — voznesenskaya.ch'); p.setProperty('ZFOLDER_ID', fo.getId()); }
  if (!p.getProperty('ZSHEET_ID')) {
    var ss = SpreadsheetApp.create('Запись на встречи — voznesenskaya.ch');
    DriveApp.getFileById(ss.getId()).moveTo(DriveApp.getFolderById(p.getProperty('ZFOLDER_ID')));
    p.setProperty('ZSHEET_ID', ss.getId());
    var info = ss.getSheets()[0]; info.setName('Как устроено');
    info.getRange(1, 1, 7, 1).setValues([['Запись на встречи с https://voznesenskaya.ch/zapis/ (с 11.10.2026). Каждая запись — строка на листе «Запись».'],
      ['Статусы: «ждёт договор» (платная встреча, 24 часа на договор) → «ждёт подтверждения» (48 часов на ответ Ирины) → «подтверждена». Ещё: «отклонена», «отменена», «истекла», «перенесена».'],
      ['Подтвердить или отклонить — кнопкой из письма. Бронь стоит в календаре «Коучинг с Ириной Вознесенской»: серым — предварительная, зелёным — подтверждённая.'],
      ['Раз в час скрипт напоминает клиентке за 24 часа, напоминает Ирине о запросах без ответа и снимает брони без договора или ответа.'],
      ['Хранить: записи и переписку о записи — не дольше трёх лет после последней встречи; запросы, из которых не получилось встречи, — 12 месяцев (предложение Claude, решает Ирина). Договоры и счета — 10 лет, отдельно.'],
      ['Колонки «Ключ…» — секретные части ссылок из писем. Таблицу никому не пересылать.'],
      ['Скрипт: проект Apps Script «Договоры коучинга — скрипт», файл zapis.gs; исходник в репозитории tests, _i18n/dogovor/zapis.gs.']]);
    info.setColumnWidth(1, 900);
  }
  zSheet_();
  /* календари, которые закрывают время: основной, «Коучинг с Ириной Вознесенской» и личные по названиям */
  var ids = [CalendarApp.getDefaultCalendar().getId(), ZCAL], found = [], miss = [];
  ZBUSY_NAMES.forEach(function (n) {
    var c = CalendarApp.getAllCalendars().filter(function (x) { return x.getName().trim() === n.trim(); })[0];
    if (c) { ids.push(c.getId()); found.push(n); } else miss.push(n);
  });
  p.setProperty('ZBUSY_CALS', JSON.stringify(ids.filter(function (x, i, a) { return a.indexOf(x) === i; })));
  if (!p.getProperty('CONTRACT_PREVIEW')) p.setProperty('CONTRACT_PREVIEW', '1');
  if (!p.getProperty('OWNER')) p.setProperty('OWNER', Session.getEffectiveUser().getEmail());
  if (p.getProperty('ALIAS_OK') == null) p.setProperty('ALIAS_OK', GmailApp.getAliases().indexOf(FROM) >= 0 ? '1' : '0');
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'zapisChas') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('zapisChas').timeBased().everyHours(1).create();
  var cal = CalendarApp.getCalendarById(ZCAL);
  Logger.log('Таблица: ' + zBook_().getUrl());
  Logger.log('Календарь записи ' + ZCAL + ': ' + (cal ? 'есть («' + cal.getName() + '»)' : 'НЕТ ДОСТУПА'));
  Logger.log('Закрывают время: основной, ' + ZCAL + (found.length ? ', ' + found.join(', ') : '') + (miss.length ? ' · НЕ НАЙДЕНЫ: ' + miss.join(', ') : ''));
  Logger.log('Zoom: ' + (zZoom_() || 'НЕТ — впиши ZOOM_URL в свойства скрипта'));
  zapisProverka();
}
function zapisProverka() {
  var now = Date.now(), busy = zBusy_(true), s = zSlots_('intro', busy, now);
  Logger.log('Занятых промежутков на 60 дней: ' + busy.length + (props_().getProperty('ZBUSY_ERR') ? ' · ошибки календарей: ' + props_().getProperty('ZBUSY_ERR') : ''));
  Logger.log('Свободных окон для знакомства: ' + s.length + (s.length ? ', первое ' + zFmt_(s[0], TZ, 'dd.MM.yyyy HH:mm') : ''));
}
