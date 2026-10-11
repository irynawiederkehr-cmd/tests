/* «Запись на встречу» voznesenskaya.ch/zapis/ — вторая часть проекта Apps Script «Договоры коучинга — скрипт» (решение Ирины 11.10.2026,
   документ проекта «zapis-kalendar.md»). Тот же проект и тот же адрес …/exec, что у договора: doGet и doPost в dogovory-kouchinga.gs передают сюда
   всё, что относится к записи.

   Как устроено:
   1) Страница спрашивает свободное время (?a=slots&t=intro). Скрипт смотрит занятость во всех календарях Ирины обоих аккаунтов (Freebusy),
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

   Ставится один раз: функция zapisUstanovka (из редактора, «Выполнить»), до этого в «Службы» добавить Google Calendar API.
   Свойства скрипта: ZOOM_URL — постоянная ссылка Zoom Ирины; CONTRACT_PREVIEW = 1, пока договор скрыт (ссылка на договор с ?preview=1). */

var ZCAL = 'voznesenskaya.iryna@gmail.com';   // календарь «Коучинг с Ириной Вознесенской» (доступ на изменение у iryna.wiederkehr с 11.10.2026)
var ZBUSY_NAMES = ['🎀Personal', '💄Beauty & Sport', '💊 Doctors Termin', '👨‍👩‍👧‍👦 Family Time', '✔️ Family Tasks', '🌱 Обучение'];   // + основной календарь и ZCAL
var ZW = { from: 9 * 60, to: 18 * 60, step: 30, lead: 3, max: 60 };   // будни 9–18 по Цюриху, шаг 30 минут, через 3 дня … 60 дней
var ZT = {
  intro: { dur: 30, buf: 15, paid: false },
  mentor: { dur: 60, buf: 15, paid: true },
  razbor: { dur: 180, buf: 30, paid: true },
  prog: { dur: 60, buf: 15, paid: false, kv: true }
};
var ZPROG = { snimok: 1, fund: 1, life: 1 };
var Z_HOLD_H = 24, Z_ANSWER_H = 48, Z_FREE_H = 24;
var Z_ACTIVE = { 'ждёт договор': 1, 'ждёт подтверждения': 1, 'подтверждена': 1 };
var ZHEAD = ['Номер', 'Создан (Цюрих)', 'Статус', 'Вид', 'Встреча', 'Программа', 'Начало (Цюрих)', 'Конец (Цюрих)', 'Начало, мс', 'Минут',
  'Часовой пояс', 'Язык', 'Имя', 'E-mail', 'Telegram или телефон', 'С чем приходит', 'Договор', 'Срок (Цюрих)', 'Срок, мс',
  'Подтверждено (Цюрих)', 'Напоминания', 'Отменено (Цюрих)', 'Кто отменил', 'Перенос с', 'Перенесено на', 'Событие', 'Ключ Ирины', 'Ключ клиентки', 'Согласия', 'Заметка'];
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
    types: { intro: 'Знакомство, 30 минут, бесплатно', mentor: 'Менторская встреча, 1 час, 150 CHF', razbor: '{p}, разбор 3 часа, 249 CHF', prog: 'Встреча программы, 1 час' },
    tshort: { intro: 'Знакомство', mentor: 'Менторская встреча', razbor: '{p}', prog: 'Встреча программы' },
    progs: { snimok: '«Снимок жизни»', fund: '«Мой фундамент»', life: '«Жизнь без сожалений»' }
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
    types: { intro: 'Знайомство, 30 хвилин, безкоштовно', mentor: 'Менторська зустріч, 1 година, 150 CHF', razbor: '{p}, розбір 3 години, 249 CHF', prog: 'Зустріч програми, 1 година' },
    tshort: { intro: 'Знайомство', mentor: 'Менторська зустріч', razbor: '{p}', prog: 'Зустріч програми' },
    progs: { snimok: '«Знімок життя»', fund: '«Мій фундамент»', life: '«Життя без жалю»' }
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
    types: { intro: 'Kennenlernen, 30 Minuten, kostenlos', mentor: 'Mentoring-Gespräch, 1 Stunde, 150 CHF', razbor: '{p}, Auswertung 3 Stunden, 249 CHF', prog: 'Termin im Programm, 1 Stunde' },
    tshort: { intro: 'Kennenlernen', mentor: 'Mentoring-Gespräch', razbor: '{p}', prog: 'Termin im Programm' },
    progs: { snimok: '«Momentaufnahme meines Lebens»', fund: '«Mein Fundament»', life: '«Ein Leben ohne Bedauern»' }
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
    types: { intro: 'Introductory meeting, 30 minutes, free', mentor: 'Mentoring session, 1 hour, 150 CHF', razbor: '{p}, 3-hour session, 249 CHF', prog: 'Programme session, 1 hour' },
    tshort: { intro: 'Introductory meeting', mentor: 'Mentoring session', razbor: '{p}', prog: 'Programme session' },
    progs: { snimok: '“Life snapshot”', fund: '“My foundation”', life: '“A life without regrets”' }
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
/* занятость: Freebusy по всем календарям (кэш 2 минуты; fresh — без кэша, перед записью) */
function zBusy_(fresh) {
  var cache = CacheService.getScriptCache();
  if (!fresh) { var c = cache.get('zbusy'); if (c) return JSON.parse(c); }
  var ids = JSON.parse(props_().getProperty('ZBUSY_CALS') || '[]');
  if (ids.indexOf(ZCAL) < 0) ids.push(ZCAL);
  var now = Date.now(), from = now, to = now + (ZW.max + 2) * 864e5, raw = [], errs = [];
  for (var t = from; t < to; t += 30 * 864e5) {
    var r = Calendar.Freebusy.query({ timeMin: new Date(t).toISOString(), timeMax: new Date(Math.min(to, t + 30 * 864e5)).toISOString(), items: ids.map(function (id) { return { id: id }; }) });
    Object.keys(r.calendars || {}).forEach(function (id) {
      var x = r.calendars[id];
      if (x.errors && x.errors.length && errs.indexOf(id) < 0) errs.push(id);
      (x.busy || []).forEach(function (b) { raw.push([Date.parse(b.start), Date.parse(b.end)]); });
    });
  }
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
  var T = ZT[t], out = [], minT = now + ZW.lead * 864e5, maxT = now + ZW.max * 864e5;
  var p = Utilities.formatDate(new Date(now), TZ, 'yyyy-MM-dd').split('-').map(Number), hol = {};
  [p[0], p[0] + 1].forEach(function (y) { var h = zHolidays_(y); for (var k in h) hol[k] = 1; });
  for (var i = 0; i <= ZW.max + 1; i++) {
    var u = new Date(Date.UTC(p[0], p[1] - 1, p[2] + i)), wd = u.getUTCDay();
    if (wd === 0 || wd === 6 || hol[u.toISOString().slice(0, 10)]) continue;
    var off = zOff_(new Date(u.getTime() + 12 * 36e5));   // смещение Цюриха в этот день (переход на летнее время — ночью, на 9–18 не влияет)
    for (var m = ZW.from; m + T.dur <= ZW.to; m += ZW.step) {
      var s = u.getTime() + (m - off) * 6e4, e = s + T.dur * 6e4;
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
function zWhat_(t, prog, lang) { var L = ZM[lang] || ZM.ru; return fill_(L.types[t] || '', { p: L.progs[prog] || '' }); }
function zShortName_(t, prog, lang) { var L = ZM[lang] || ZM.ru; return fill_(L.tshort[t] || '', { p: L.progs[prog] || '' }); }
function zRuName_(t, prog) { return t === 'razbor' ? ZM.ru.progs[prog] + ', разбор 3 часа' : ZM.ru.tshort[t]; }

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
    ev: v[ZC['Событие']], ik: v[ZC['Ключ Ирины']], ck: v[ZC['Ключ клиентки']] };
}
function zEnd_(o) { return o.s + o.dur * 6e4; }
function zFirst_(name) { return String(name || '').trim().split(/\s+/)[0]; }

/* ---------- календарь ---------- */
function zCal_() { var c = CalendarApp.getCalendarById(ZCAL); if (!c) throw new Error('нет доступа к календарю ' + ZCAL); return c; }
function zEvTitle_(o) {
  var pre = o.st === 'ждёт договор' ? '⏳ Ждём договор · ' : o.st === 'ждёт подтверждения' ? '❓ Подтвердить · ' : '';
  return pre + zRuName_(o.t, o.prog) + ' — ' + o.name + (o.kv ? ' · ' + o.kv : '');
}
function zEvDesc_(o) {
  var lines = ['Запись с сайта voznesenskaya.ch/zapis/ · ' + o.no, 'Статус: ' + o.st, 'Время: ' + zWhenRu_(o.s, zEnd_(o), o.tz),
    'Имя: ' + o.name, 'E-mail: ' + o.email];
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

/* ---------- письма ---------- */
function zMailClient_(o, kind, extra) {
  var L = ZM[o.lang] || ZM.ru, e = zEnd_(o), x = extra || {};
  var v = { name: zFirst_(o.name), what: zWhat_(o.t, o.prog, o.lang), when: zWhen_(o.s, e, o.tz, o.lang), short: zShort_(o.s, o.tz),
    manage: zManage_(o.lang, o.no, o.ck), again: zAgain_(o.lang, o.no, o.ck), kv: o.kv, sign: L.sign };
  v.hello = fill_(L.hello, v); v.whatL = fill_(L.whatL, v); v.whenL = fill_(L.whenL, v);
  var zoom = zZoom_(); v.zoom = zoom; v.zoomL = zoom ? fill_(L.zoomL, v) : L.zoomNo;
  Object.keys(x).forEach(function (k) { v[k] = x[k]; });
  var subj = fill_(L[kind + 'S'], v), body = fill_(L[kind + 'B'], v), opts = {};
  if (kind === 'ok') opts.attachments = [zIcs_(o)];
  send_(o.email, subj, body, opts);
}
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
function zIcs_(o) {
  var L = ZM[o.lang] || ZM.ru, zoom = zZoom_() || 'voznesenskaya.ch', manage = zManage_(o.lang, o.no, o.ck);
  var sum = fill_(L.icsT, { type: zShortName_(o.t, o.prog, o.lang) });
  var desc = fill_(L.icsD, { what: zWhat_(o.t, o.prog, o.lang), zoom: zZoom_() || '', manage: manage });
  var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//voznesenskaya.ch//zapis//' + String(o.lang).toUpperCase(), 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT', 'UID:' + o.no + '@voznesenskaya.ch', 'DTSTAMP:' + zIcsDate_(Date.now()), 'DTSTART:' + zIcsDate_(o.s), 'DTEND:' + zIcsDate_(zEnd_(o)),
    'SUMMARY:' + zIcsTxt_(sum), 'LOCATION:' + zIcsTxt_(zoom), 'DESCRIPTION:' + zIcsTxt_(desc), 'URL:' + manage,
    'ORGANIZER;CN=' + zIcsTxt_(o.lang === 'uk' ? 'Ірина Вознесенська' : o.lang === 'ru' ? 'Ирина Вознесенская' : 'Iryna Voznesenskaya') + ':mailto:' + FROM,
    'BEGIN:VALARM', 'TRIGGER:-PT30M', 'ACTION:DISPLAY', 'DESCRIPTION:' + zIcsTxt_(L.icsA), 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'];
  return Utilities.newBlob(lines.map(zFold_).join('\r\n') + '\r\n', 'text/calendar', 'vstrecha-' + o.no + '.ics');
}
function zGcal_(o) {
  var L = ZM[o.lang] || ZM.ru;
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(fill_(L.icsT, { type: zShortName_(o.t, o.prog, o.lang) })) +
    '&dates=' + zIcsDate_(o.s) + '/' + zIcsDate_(zEnd_(o)) + '&details=' + encodeURIComponent(fill_(L.icsD, { what: zWhat_(o.t, o.prog, o.lang), zoom: zZoom_() || '', manage: zManage_(o.lang, o.no, o.ck) })) +
    '&location=' + encodeURIComponent(zZoom_() || 'Zoom');
}
function zOwner_() { return props_().getProperty('OWNER') || Session.getEffectiveUser().getEmail(); }
function zMailIrina_(subject, body) { GmailApp.sendEmail(zOwner_(), subject, body, { name: 'Запись на встречи · voznesenskaya.ch' }); }
function zIrinaCard_(o) {
  return 'Встреча: ' + zRuName_(o.t, o.prog) + '\nВремя: ' + zWhenRu_(o.s, zEnd_(o), o.tz) + '\nНомер записи: ' + o.no +
    '\n\nИмя: ' + o.name + '\nE-mail: ' + o.email + (o.contact ? '\nTelegram или телефон: ' + o.contact : '') + '\nЯзык: ' + o.lang +
    (o.kv ? '\nДоговор: ' + o.kv : '') + (o.comment ? '\nС чем приходит: ' + o.comment : '') + (o.from ? '\nЭто перенос записи ' + o.from : '');
}
function zMailIrinaNew_(o) {
  zMailIrina_('Запись: ' + zRuName_(o.t, o.prog) + ' — ' + o.name + ', ' + zFmt_(o.s, TZ, 'dd.MM. HH:mm') + (o.from ? ' (перенос)' : '') + ' · ответить до ' + zFmt_(o.dl, TZ, 'dd.MM. HH:mm'),
    'Новый запрос на встречу с сайта voznesenskaya.ch/zapis/.\n\n' + zIrinaCard_(o) +
    '\n\nВремя уже стоит в календаре «Коучинг с Ириной Вознесенской» серым как предварительное.' +
    '\n\nПодтвердить или отклонить (после ответа клиентке сразу уходит письмо):\n' + zAdminUrl_(o.no, o.ik) +
    '\n\nЕсли не ответить до ' + zFmt_(o.dl, TZ, 'dd.MM.yyyy HH:mm') + ', время освободится само, а клиентке уйдёт письмо выбрать другое.');
}

/* ---------- GET ---------- */
function zapisGet_(p) {
  if (p.a === 'slots') {
    var t = ZT[p.t] ? p.t : 'intro', c = CacheService.getScriptCache(), k = 'zslots:' + t, hit = c.get(k);
    if (hit) return ContentService.createTextOutput(hit).setMimeType(ContentService.MimeType.JSON);
    var now = Date.now(), out = JSON.stringify({ ok: true, t: t, dur: ZT[t].dur, tz: TZ, now: now, slots: zSlots_(t, zBusy_(false), now) });
    try { c.put(k, out, 120); } catch (e) {}
    return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON);
  }
  if (p.a === 'zinfo') {
    var sh = zSheet_(), f = zFind_(sh, p.z);
    if (!f) return json_({ ok: false, err: 'notfound' });
    var o = zObj_(f.v);
    if (!p.k || String(p.k) !== String(o.ck)) return json_({ ok: false, err: 'key' });
    var now2 = Date.now(), act = !!Z_ACTIVE[o.st];
    return json_({ ok: true, no: o.no, st: o.st, t: o.t, prog: o.prog, s: o.s, e: zEnd_(o), dur: o.dur, tz: o.tz, lang: o.lang, name: zFirst_(o.name), kv: o.kv, to: o.to,
      dl: o.dl, free: o.s - Z_FREE_H * 36e5 > now2, past: o.s < now2, canCancel: act && o.s > now2,
      canMove: !o.to && ((act && o.s > now2 && (o.st !== 'подтверждена' || o.s - Z_FREE_H * 36e5 > now2)) || o.st === 'отклонена' || o.st === 'истекла'),
      contract: o.st === 'ждёт договор' ? zContractUrl_(o.lang, o.t === 'mentor' ? 'mentor' : o.prog, o.no, o.ck) : '' });
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
function zNewNo_(sh) {
  var AB = '23456789ABCDEFGHJKMNPQRSTUVWXYZ', day = Utilities.formatDate(new Date(), TZ, 'yyyyMMdd');
  for (var i = 0; i < 20; i++) {
    var r = ''; for (var j = 0; j < 4; j++) r += AB.charAt(Math.floor(Math.random() * AB.length));
    var no = 'ZP-' + day + '-' + r; if (!zFind_(sh, no)) return no;
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
function zCreate_(d) {
  if (d.website) return json_({ ok: true, no: '', st: '' });   // поле-ловушка для роботов
  var lang = LANGS[d.lang] ? d.lang : 'ru', now = Date.now(), sh = zSheet_(), old = null, t, prog = '', name, email, contact, comment = '', kv = '', tz = zOkTz_(d.tz);
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
    if (old.st === 'подтверждена' && old.s - Z_FREE_H * 36e5 <= now) return json_({ ok: false, err: 'late' });
    t = old.t; prog = old.prog; name = old.name; email = old.email; contact = old.contact; comment = old.comment; kv = old.kv; lang = LANGS[d.lang] ? d.lang : old.lang;
    if (!d.tz) tz = zOkTz_(old.tz);
  } else {
    t = String(d.t || ''); if (!ZT[t]) return json_({ ok: false, err: 'data' });
    if (t === 'razbor') { prog = String(d.prog || ''); if (!ZPROG[prog]) return json_({ ok: false, err: 'data' }); }
    if (t === 'mentor') prog = 'mentor';
    name = clean_(d.name, 100).trim(); email = String(d.email || '').trim().slice(0, 120); contact = clean_(d.contact, 80); comment = clean_(d.comment, 600);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || name.length < 2) return json_({ ok: false, err: 'data' });
    var c = d.consents || {}; if (!c.adult || !c.coach || !c.data) return json_({ ok: false, err: 'consents' });
    if (t === 'prog') { kv = String(d.kv || '').trim().toUpperCase(); if (!zKvCheck_(kv, email)) return json_({ ok: false, err: 'kv' }); }
    var mine = zAll_(sh).filter(function (x) { return String(x.v[ZC['E-mail']]).toLowerCase() === email.toLowerCase() && Z_ACTIVE[x.v[ZC['Статус']]] && Number(x.v[ZC['Начало, мс']]) > now; });
    if (mine.length >= 2) return json_({ ok: false, err: 'many' });
  }
  var cache = CacheService.getScriptCache(), dk = 'zd:' + Utilities.formatDate(new Date(), TZ, 'yyyyMMdd'), nd = +(cache.get(dk) || 0);
  if (nd >= 30) return json_({ ok: false, err: 'limit' });
  var start = Math.round(Number(d.start) || 0), T = ZT[t], o;
  var lock = LockService.getScriptLock(); lock.waitLock(25000);
  try {
    if (zSlots_(t, zBusy_(true), now).indexOf(start) < 0) return json_({ ok: false, err: 'slot' });
    var st = (T.paid && !kv) ? 'ждёт договор' : 'ждёт подтверждения';
    var dl = now + (st === 'ждёт договор' ? Z_HOLD_H : Z_ANSWER_H) * 36e5;
    o = { no: zNewNo_(sh), st: st, t: t, prog: prog, s: start, dur: T.dur, tz: tz, lang: lang, name: name, email: email, contact: contact, comment: comment, kv: kv,
      dl: dl, flags: '', from: old ? old.no : '', to: '', ik: Utilities.getUuid().replace(/-/g, ''), ck: Utilities.getUuid().replace(/-/g, '') };
    var ev = zCal_().createEvent(zEvTitle_(o), new Date(o.s), new Date(zEnd_(o)), { description: '' });
    o.ev = ev.getId(); zEvPaint_(ev, o);
    var row = new Array(ZHEAD.length).fill('');
    row[ZC['Номер']] = o.no; row[ZC['Создан (Цюрих)']] = fmtNow_(); row[ZC['Статус']] = st; row[ZC['Вид']] = t; row[ZC['Встреча']] = zRuName_(t, prog); row[ZC['Программа']] = prog;
    row[ZC['Начало (Цюрих)']] = zFmt_(o.s, TZ, 'dd.MM.yyyy HH:mm'); row[ZC['Конец (Цюрих)']] = zFmt_(zEnd_(o), TZ, 'dd.MM.yyyy HH:mm'); row[ZC['Начало, мс']] = o.s; row[ZC['Минут']] = o.dur;
    row[ZC['Часовой пояс']] = tz; row[ZC['Язык']] = lang; row[ZC['Имя']] = name; row[ZC['E-mail']] = email; row[ZC['Telegram или телефон']] = contact; row[ZC['С чем приходит']] = comment;
    row[ZC['Договор']] = kv; row[ZC['Срок (Цюрих)']] = zFmt_(dl, TZ, 'dd.MM.yyyy HH:mm'); row[ZC['Срок, мс']] = dl; row[ZC['Перенос с']] = o.from; row[ZC['Событие']] = o.ev;
    row[ZC['Ключ Ирины']] = o.ik; row[ZC['Ключ клиентки']] = o.ck;
    row[ZC['Согласия']] = old ? 'как в ' + old.no : '18+, не терапия, данные для записи · ' + clean_(d.consentAt, 40);
    sh.appendRow(row);
    if (old) {   // прежняя запись: неподтверждённая освобождается сразу, подтверждённая остаётся в силе, пока Ирина не подтвердит новое время
      if (old.st === 'ждёт подтверждения' || old.st === 'ждёт договор') { zEvDel_(old.ev); zSet_(sh, old.r, { 'Статус': 'перенесена', 'Перенесено на': o.no }); }
      else zSet_(sh, old.r, { 'Перенесено на': o.no });
    }
    cache.put(dk, String(nd + 1), 86400); cache.remove('zbusy'); Object.keys(ZT).forEach(function (k) { cache.remove('zslots:' + k); });
  } finally { lock.releaseLock(); }
  var L = ZM[o.lang] || ZM.ru;
  if (o.st === 'ждёт договор') {
    zMailClient_(o, 'hold', { contract: zContractUrl_(o.lang, o.prog, o.no, o.ck) });
  } else {
    zMailClient_(o, 'req', { resch: old && old.st === 'подтверждена' ? fill_(L.resch, { old: zWhen_(old.s, zEnd_(old), o.tz, o.lang) }) : '' });
    zMailIrinaNew_(o);
  }
  return json_({ ok: true, no: o.no, st: o.st, s: o.s, e: zEnd_(o), manage: zManage_(o.lang, o.no, o.ck), contract: o.st === 'ждёт договор' ? zContractUrl_(o.lang, o.prog, o.no, o.ck) : '' });
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
  zMailClient_(o, 'cancel', { late: late && paid ? L.lateHeld : (o.t === 'intro' ? '' : L.lateFree), again: zBase_(o.lang) + 'zapis/' });
  zMailIrina_('Отмена: ' + zRuName_(o.t, o.prog) + ' — ' + o.name + ', ' + zFmt_(o.s, TZ, 'dd.MM. HH:mm') + (late ? ' (меньше чем за 24 часа)' : ''),
    'Клиентка отменила запись на сайте. Время в календаре освобождено.\n\n' + zIrinaCard_(o) + '\nБыл статус: ' + o.st +
    (late && paid ? '\n\nДо начала оставалось меньше 24 часов: по условиям работы встреча считается проведённой. Клиентке написано, что при серьёзной причине вы найдёте решение.' : ''));
  return json_({ ok: true, late: !!late });
}

/* новое время по переносу не состоялось (отказ, истёк срок, отмена): подтверждённую прежнюю встречу снова можно переносить */
function zUnmove_(sh, o) {
  if (!o.from) return;
  var g = zFind_(sh, o.from); if (!g) return;
  var old = zObj_(g.v); if (old.st === 'подтверждена' && old.to === o.no) zSet_(sh, g.r, { 'Перенесено на': '' });
}

/* ---------- страница Ирины: подтвердить или отклонить ---------- */
function zAdminPage_(p) {
  var sh = zSheet_(), f = zFind_(sh, p.z), o = f ? zObj_(f.v) : null;
  var wrap = function (inner) {
    return HtmlService.createHtmlOutput('<div style="font-family:Arial,sans-serif;max-width:560px;margin:28px auto;padding:0 16px;line-height:1.5;color:#2F2924">' + inner + '</div>')
      .setTitle('Запись на встречу').addMetaTag('viewport', 'width=device-width, initial-scale=1');
  };
  if (!o || !p.k || String(p.k) !== String(o.ik)) return wrap('<p>Ссылка неверная. Открой её из письма о записи.</p>');
  var card = esc_(zIrinaCard_(o)).replace(/\n/g, '<br>');
  if (o.st !== 'ждёт подтверждения')
    return wrap('<h2 style="font-weight:normal;color:#6E4F3C">Запись ' + esc_(o.no) + '</h2><p><b>Статус: ' + esc_(o.st) + '.</b> Здесь больше ничего делать не нужно.</p><p style="color:#7A6E62">' + card + '</p>');
  var kvTxt = o.kv ? '<p>Вместе с временем подтвердится договор <b>' + esc_(o.kv) + '</b> (если он ещё не подтверждён). Клиентка получит одно письмо: договор действует, время, ссылка Zoom и файл для календаря.</p>' : '';
  var zoomWarn = zZoom_() ? '' : '<p style="background:#FDECEA;border:1px solid #D32F2F;border-radius:10px;padding:8px 12px">Ссылка Zoom ещё не записана в свойствах скрипта (ZOOM_URL). Клиентка получит письмо «ссылку пришлю отдельно».</p>';
  var btn = 'font-size:16px;padding:12px 20px;border:0;border-radius:12px;cursor:pointer;margin:6px 8px 6px 0;';
  return wrap('<h2 style="font-weight:normal;color:#6E4F3C">Подтвердить запись?</h2><p>' + card + '</p>' + kvTxt + zoomWarn +
    '<p><button id="ok" style="' + btn + 'background:#4F5E3E;color:#fff">' + (o.kv && ZT[o.t].paid ? 'Подтвердить договор и время' : 'Подтвердить время') + '</button></p>' +
    '<details style="margin-top:10px"><summary style="cursor:pointer">Это время не подходит — отклонить</summary>' +
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
  var o, kvr = null, oldO = null;
  try {
    var f = zFind_(sh, no); if (!f) return 'Запись ' + no + ' не найдена.';
    o = zObj_(f.v);
    if (!key || String(key) !== String(o.ik)) return 'Ссылка неверная. Открой её из письма о записи.';
    if (o.st === 'подтверждена') return 'Запись ' + no + ' уже подтверждена.';
    if (o.st !== 'ждёт подтверждения') return 'Запись ' + no + ': статус «' + o.st + '», подтвердить уже нельзя.';
    if (o.s <= Date.now()) return 'Время встречи уже прошло.';
    if (o.kv && ZT[o.t].paid) { kvr = zKvConfirm_(o.kv); if (!kvr.ok) return 'Не подтверждено: ' + kvr.why + '. Напиши клиентке сама.'; }
    o.st = 'подтверждена';
    var ev = zEvGet_(o.ev);
    if (!ev) { ev = zCal_().createEvent(zEvTitle_(o), new Date(o.s), new Date(zEnd_(o))); o.ev = ev.getId(); }
    zEvPaint_(ev, o);
    zSet_(sh, f.r, { 'Статус': o.st, 'Подтверждено (Цюрих)': fmtNow_(), 'Событие': o.ev });
    if (o.from) {   // перенос: прежняя запись освобождается
      var g = zFind_(sh, o.from);
      if (g) { oldO = zObj_(g.v); if (Z_ACTIVE[oldO.st]) { zEvDel_(oldO.ev); zSet_(sh, g.r, { 'Статус': 'перенесена', 'Перенесено на': o.no }); } else zSet_(sh, g.r, { 'Перенесено на': o.no }); }
    }
    CacheService.getScriptCache().remove('zbusy');
  } finally { lock.releaseLock(); }
  var L = ZM[o.lang] || ZM.ru, extra = '';
  if (o.t === 'intro') extra = L.exFree;
  else if (kvr && !kvr.already) extra = fill_(L.exKv, { kv: o.kv, today: Utilities.formatDate(new Date(), TZ, 'dd.MM.yyyy'), eu: kvr.eu ? L.eu : '' }) + L.exPay;
  else if (ZT[o.t].paid) extra = L.exPay;
  else if (o.kv) extra = fill_(L.exProg, { kv: o.kv });
  zMailClient_(o, 'ok', { extra: extra, gcal: zGcal_(o) });
  var tail = [];
  if (kvr && !kvr.already) tail.push('договор ' + o.kv + ' подтверждён');
  if (ZT[o.t].paid) tail.push('счёт Alonira.ch AG нужно выставить до встречи (дело во вторничной задаче «Alonira: счета и оплаты»)');
  if (!zZoom_()) tail.push('ссылки Zoom нет в свойствах скрипта — пришли её клиентке сама');
  return 'Готово: встреча ' + zFmt_(o.s, TZ, 'dd.MM.yyyy HH:mm') + ' подтверждена, письмо отправлено на ' + o.email + '.' + (tail.length ? ' ' + tail.join('; ') + '.' : '');
}
function zapisOtklonit(no, key, msg) {
  var sh = zSheet_(), lock = LockService.getScriptLock(); lock.waitLock(20000);
  var o;
  try {
    var f = zFind_(sh, no); if (!f) return 'Запись ' + no + ' не найдена.';
    o = zObj_(f.v);
    if (!key || String(key) !== String(o.ik)) return 'Ссылка неверная. Открой её из письма о записи.';
    if (o.st !== 'ждёт подтверждения' && o.st !== 'ждёт договор') return 'Запись ' + no + ': статус «' + o.st + '», отклонить уже нельзя.';
    zEvDel_(o.ev);
    zSet_(sh, f.r, { 'Статус': 'отклонена', 'Отменено (Цюрих)': fmtNow_(), 'Кто отменил': 'Ирина', 'Заметка': clean_(msg, 600) });
    zUnmove_(sh, o);
    CacheService.getScriptCache().remove('zbusy');
  } finally { lock.releaseLock(); }
  var L = ZM[o.lang] || ZM.ru, m = String(msg || '').trim().slice(0, 600);
  zMailClient_(o, 'no', { msg: m ? fill_(L.msg, { msg: m }) : '', kvNote: o.kv && ZT[o.t].paid ? fill_(L.kvNote, { kv: o.kv }) : '' });
  return 'Готово: запись отклонена, клиентке ушло письмо с предложением выбрать другое время' + (o.from ? ' (прежняя запись ' + o.from + ' остаётся в силе)' : '') + '.';
}

/* ---------- договор подписан по ссылке из записи (вызывает doPost договора) ---------- */
function zLinkContract_(z, zk, kvNo) {
  var sh = zSheet_(), f = zFind_(sh, z); if (!f) return { ok: false, why: 'запись ' + z + ' не найдена' };
  var o = zObj_(f.v); if (!zk || String(zk) !== String(o.ck)) return { ok: false, why: 'ключ записи неверный' };
  var now = Date.now();
  if (o.st === 'ждёт договор' || o.st === 'истекла') {
    if (o.st === 'истекла') {   // договор подписан позже 24 часов: если время ещё свободно, бронь возвращается
      var T = ZT[o.t];
      if (o.s - now < 864e5 || !zFreeAt_(zBusy_(true), o.s - T.buf * 6e4, zEnd_(o) + T.buf * 6e4)) return { ok: false, o: o, why: 'время ' + zWhenRu_(o.s, zEnd_(o), o.tz) + ' уже освободилось и занято или до него меньше суток' };
    }
    o.kv = kvNo; o.st = 'ждёт подтверждения'; o.dl = now + Z_ANSWER_H * 36e5;
    var ev = zEvGet_(o.ev);
    if (!ev) { ev = zCal_().createEvent(zEvTitle_(o), new Date(o.s), new Date(zEnd_(o))); o.ev = ev.getId(); }
    zEvPaint_(ev, o);
    zSet_(sh, f.r, { 'Статус': o.st, 'Договор': kvNo, 'Срок (Цюрих)': zFmt_(o.dl, TZ, 'dd.MM.yyyy HH:mm'), 'Срок, мс': o.dl, 'Событие': o.ev });
    CacheService.getScriptCache().remove('zbusy');
    return { ok: true, o: o };
  }
  return { ok: false, o: o, why: 'у записи статус «' + o.st + '»' };
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
  mails.forEach(function (m) {
    var o = m[1];
    try {
      if (m[0] === 'exp1') zMailClient_(o, 'exp1');
      else if (m[0] === 'exp2') {
        zMailClient_(o, 'exp2');
        zMailIrina_('Запрос истёк: ' + zRuName_(o.t, o.prog) + ' — ' + o.name + ', ' + zFmt_(o.s, TZ, 'dd.MM. HH:mm'), 'Ответа не было 48 часов, время освобождено, клиентке ушло письмо «прости, не успела ответить, выбери другое время».\n\n' + zIrinaCard_(o));
      } else if (m[0] === 'irina24') zMailIrina_('Ждёт ответа ещё 24 часа: ' + zRuName_(o.t, o.prog) + ' — ' + o.name, zIrinaCard_(o) + '\n\nПодтвердить или отклонить:\n' + zAdminUrl_(o.no, o.ik) + '\n\nБез ответа до ' + zFmt_(o.dl, TZ, 'dd.MM.yyyy HH:mm') + ' время освободится само.');
      else if (m[0] === 'gone') zMailIrina_('Встреча удалена из календаря: ' + o.name + ', ' + zFmt_(o.s, TZ, 'dd.MM. HH:mm'), 'Событие этой подтверждённой встречи пропало из календаря «Коучинг с Ириной Вознесенской». Напоминание клиентке не уйдёт. Если встреча отменяется, напиши клиентке сама и поставь в таблице статус «отменена».\n\n' + zIrinaCard_(o));
      else if (m[0] === 'moved') zMailIrina_('Время встречи изменено в календаре: ' + o.name, 'В календаре встреча стоит на ' + zFmt_(m[2], TZ, 'dd.MM.yyyy HH:mm') + ', а клиентке подтверждено ' + zFmt_(o.s, TZ, 'dd.MM.yyyy HH:mm') + '. Клиентке я ничего не писал: сообщи ей новое время сама или верни встречу на прежнее место. Напоминание уйдёт по подтверждённому времени.\n\n' + zIrinaCard_(o));
      else if (m[0] === 'rem') zMailClient_(o, 'rem');
    } catch (e) { Logger.log('письмо ' + m[0] + ' ' + o.no + ': ' + e); }
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
