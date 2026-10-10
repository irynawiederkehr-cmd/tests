"""Блок «Новое» на главной voznesenskaya.ch (решение Ирины 09.10.2026, документ проекта «novosti-svoiludi.md»):
последние новости сайта и «Своих людей», мост к svoiludi.ch и подписка на Telegram-канал коучинга.
Новые записи — в ITEMS (сверху самые свежие, показываются 4). Запуск: python3 _i18n/novoe.py, потом _i18n/sync.py check/apply."""
import re, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ITEMS = [  # (дата ISO, дата текстом, метка, заголовок, текст, ссылка, кнопка)
 ('2026-10-10','10 октября 2026','На сайте','Перед скачиванием разбора — галочка','Прежде чем скачать разбор или бланк теста, нужно отметить галочку: тест — это инструмент для размышления, а не диагноз и не консультация, и решение о том, как воспользоваться результатом, остаётся за тобой. У каждого файла внизу свой номер. Твоих ответов мы при этом не получаем.','/testy/','Выбрать тест'),
 ('2026-10-10','10 октября 2026','На сайте','Что ты собираешь в себе на каждой ступени','На странице «Твой путь» у каждой ступени теперь написано, что ты собираешь в себе, когда на неё поднимаешься: от «Я в безопасности, тело со мной» до «Здесь и там — одна моя жизнь». А на первой странице разбора теста «Ступени устойчивости» видно, какая у тебя первая потребность сейчас.','put/','Посмотреть'),
 ('2026-10-10','10 октября 2026','На сайте','Сайт спросит, на каком языке тебе комфортно','Когда ты впервые открываешь сайт, внизу появляется вопрос и четыре кнопки: «Українською», «По-русски», «Deutsch» и «English». Нажми свою, и сайт сразу откроется на этом языке, а потом будет открываться так всегда. Тесты тоже откроются на выбранном языке.','testy/','К тестам'),
 ('2026-10-10','10 октября 2026','На сайте','Главная и тест по методу «Ступени. Твой путь в новой стране»','Главная о том, как жизнь после переезда собирается заново. И тест «Ступени устойчивости» с восемью ступенями простыми словами и акварелями чаши.','stupeni/','Пройти тест'),
 ('2026-10-10','10 октября 2026','На сайте','Ступени. Твой путь в новой стране','Восемь ступеней жизни после переезда и история чаши, которая собирается заново золотом. У каждой ступени написано, с чем на неё приходят и что на ней помогает.','put/','Посмотреть'),
 ('2026-10-09','9 октября 2026','«Свои люди»','Как устроена Швейцария: 56 тем простыми словами','Пермиты, налоги, страховки, школа, работа и жильё. К каждой теме шаги, бесплатные инструменты и специалисты.','https://svoiludi.ch/shveycariya/','Открыть'),
 ('2026-10-09','9 октября 2026','На сайте','Значок ICF Member','Моё членство в Международной федерации коучинга можно проверить одним нажатием на значок.','#who','Посмотреть'),
 ('2026-10-09','9 октября 2026','На сайте','Сайт как приложение','Сайт можно поставить иконкой на экран «Домой» телефона. Открывается во весь экран, с вкладками внизу.','#start','На главную'),
 ('2026-10-06','6 октября 2026','Отзывы','Новый отзыв о «Моём фундаменте»','Отзыв клиентки о работе с ценностями в «Моём фундаменте».','#reviews','Читать отзывы'),
]
TG = 'https://t.me/IrynaNeuroCoach_channel'
CSS = ('<style>#novoe .nv-lead{color:var(--muted);margin:6px 0 16px}.nv-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}'
 '@media (max-width:1000px){.nv-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media (max-width:560px){.nv-grid{grid-template-columns:1fr}}'
 '.nv-item{background:var(--paper);border:1px solid var(--line);border-left:5px solid var(--brown);border-radius:14px;padding:14px 16px;display:flex;flex-direction:column;gap:6px}'
 '.nv-item h3{font-size:1.15rem;line-height:1.25}.nv-item p{font-size:.9rem;color:var(--muted);margin:0}.nv-item a{margin-top:auto;font-weight:700;font-size:.88rem}'
 '.nv-meta{display:flex;gap:10px;font-size:.78rem;color:var(--muted);align-items:center}.nv-k{font-weight:700;color:var(--ink);background:color-mix(in srgb,var(--brown) 14%,transparent);border-radius:999px;padding:2px 9px}'
 '.nv-bridge,.nv-sub{display:flex;flex-wrap:wrap;gap:12px 18px;align-items:center;justify-content:space-between;border-radius:16px;padding:16px 18px;margin-top:16px}'
 '.nv-bridge{border:1px solid var(--line);background:var(--paper)}.nv-sub{background:color-mix(in srgb,var(--brown) 10%,transparent)}'
 '.nv-bridge p,.nv-sub p{margin:2px 0 0;max-width:62ch}.nv-bridge .btn,.nv-sub .btn{flex:none}</style>')

def card(d, dd, k, t, x, u, l):
    ext = ' target="_blank" rel="noopener"' if u.startswith('http') else ''
    return (f'<article class="nv-item"><div class="nv-meta"><span class="nv-k">{k}</span><time datetime="{d}">{dd}</time></div>'
            f'<h3>{t}</h3><p>{x}</p><a href="{u}"{ext}>{l} →</a></article>')

def main():
    p = os.path.join(ROOT, 'index.html'); h = open(p, encoding='utf-8').read()
    h = re.sub(r'\n?<!--novoe-->.*?<!--novoe-->\n?', '\n', h, flags=re.S)
    block = ('<!--novoe-->\n  <section id="novoe" aria-labelledby="nv-h">\n    <h2 id="nv-h">Новое</h2>\n'
             '    <p class="nv-lead">Что появилось на сайте и в проекте «Свои люди».</p>\n'
             '    <div class="nv-grid">' + ''.join(card(*i) for i in ITEMS[:4]) + '</div>\n'
             '    <div class="nv-bridge"><p><b>Практические вопросы о жизни в Швейцарии</b> — пермит, налоги, страховки, школа, жильё — собраны в моём проекте «Свои люди». Там же специалисты, которые говорят на твоём языке, и бесплатные инструменты.</p><a class="btn ghost" href="https://svoiludi.ch/" target="_blank" rel="noopener">Открыть «Свои люди»</a></div>\n'
             f'    <div class="nv-sub"><div><b>Подписаться на новое</b><p>Новые материалы, мысли об адаптации и анонсы — в моём Telegram-канале. Отписаться можно в любой момент.</p></div><a class="btn" href="{TG}" target="_blank" rel="noopener">Подписаться в Telegram</a></div>\n'
             '  </section>\n' + CSS + '\n<!--novoe-->\n')
    i = h.index('  <section id="contact"')
    h = h[:i] + block + h[i:]
    open(p, 'w', encoding='utf-8').write(h)
    print('ok: блок «Новое»')

if __name__ == '__main__':
    main()
