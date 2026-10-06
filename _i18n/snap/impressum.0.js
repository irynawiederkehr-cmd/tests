/* Настройки сайта, общие для всех тестов */
// Ссылка веб-приложения Google Apps Script (заканчивается на /exec). Одна на все тесты.
const ENDPOINT = 'https://script.google.com/macros/s/AKfycbyizp1XjzNdrUj4WHgj4Vyj81QhjY2D7puqyeY3LaweWB4mePxPhfHCx5fIsfaJy9hV/exec';
// Адрес сайта после размещения, например 'https://irina-tests.netlify.app/' (нужен для ссылок в PDF)
const SITE_URL = 'https://voznesenskaya.ch/';
// Ссылки на тесты, пока сайт не размещён (используются для кнопки «Поделиться» и блока «Пройди также»).
// После размещения сайта достаточно заполнить SITE_URL — эти ссылки больше не понадобятся.
const TEST_LINKS = {
  'roza-lyubvi': 'https://claude.ai/artifact/6Nv7pCtqpAd9xoWUkvEwS1',
  'kompas': 'https://claude.ai/artifact/5TPCgkiVSZEr8H2g8d1UkY'
};
// Деловой почтовый адрес и e-mail для «Выходных данных» и «Политики конфиденциальности».
// ЛИЧНЫЙ АДРЕС ИРИНЫ НЕ УКАЗЫВАТЬ. Пока поля пустые, на страницах стоит временная строка «скоро появятся».
// address — строки через \n, например 'Musterstrasse 1\n8000 Zürich'.
const LEGAL = {
  address: {
    ru: 'c/o Alonira.ch AG\nPoststrasse 6\n6302 Zug, Швейцария',
    uk: 'c/o Alonira.ch AG\nPoststrasse 6\n6302 Zug, Швейцарія',
    de: 'c/o Alonira.ch AG\nPoststrasse 6\n6302 Zug, Schweiz',
    en: 'c/o Alonira.ch AG\nPoststrasse 6\n6302 Zug, Switzerland'
  },
  email: 'voznesenskaya.iryna@gmail.com', since: '06.10.2026'
};
