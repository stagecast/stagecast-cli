var support = {
  en: { leaderboard: 'Leaderboard', counter: ' (Top {number})' },
  sv: { leaderboard: 'Topplista', counter: ' (Topp {number}' },
  it: { leaderboard: 'Classifica', counter: ' (Top {number})' },
  de: { leaderboard: 'Bestenliste', counter: ' (Top {number})' },
  da: { leaderboard: 'Leaderboard', counter: ' (Top {number})' },
  ru: { leaderboard: 'Таблица лидеров', counter: ' (топ ${number})' },
  fr: { leaderboard: 'Classement', counter: ' (Top ${number})' },
  es: { leaderboard: 'Marcador', counter: ' ($number$ Mejores)' }
}

function Translator(language) {
  this.defaultLanguage = 'en';
  this.lang = support[language] ? language : this.defaultLanguage;
  this.messages = support[this.lang];
  document.documentElement.setAttribute('lang', this.lang);
}

Translator.prototype.setLocale = function (language) {
  this.lang = support[language] ? language : this.defaultLanguage;
  this.messages = support[this.lang];
  document.documentElement.setAttribute('lang', this.lang);
  if (this.root) {
    this.tContent(this.root);
  }
}

Translator.prototype.getTranslatedContent = function (translationKey, value) {
  let keys = translationKey.split('.');
  let obj = this.messages;
  try {
    for (let i = 0; i < keys.length; i++) {
      obj = obj[keys[i]];
    }
    return value ? obj.replace(/\{(.[^\}]*)\}/g, value.toString()) : obj;
  } catch (error) {
    return translationKey;
  }
}

Translator.prototype.t = function (keyString, value) {
  let keys = keyString.split('.');
  let obj = this.messages;
  try {
    for (let i = 0; i < keys.length; i++) {
      obj = obj[keys[i]];
    }
    // TODO: add support for complex values like { number: 10 }
    return value ? obj.replace(/\{(.[^\}]*)\}/g, value.toString()): obj;
  } catch (error) {
    return keyString;
  }
}

// Usage: <span id="resultText" i18nKey="leaderboard">Leaderboard</span>
Translator.prototype.tContent = function (root) {
  this.root = root;
  var contentToTranslate = root.querySelectorAll('[i18nKey]');
  for (var i = 0; i < contentToTranslate.length; i++) {
    var i18nKey = contentToTranslate[i].getAttribute('i18nKey');
    contentToTranslate[i].textContent = i18n.t(i18nKey);
  }
}
