import type { CatalogLang } from "./languages";

export const downloadGateTranslations: Partial<
  Record<string, Partial<Record<CatalogLang, string>>>
> = {
  "Unlock downloads": {
    de: "Downloads freischalten",
    pl: "Odblokuj pliki do pobrania",
    sl: "Odklenite prenose",
    ru: "Разблокировать загрузки",
  },
  "Enter your contact details once to unlock all downloads.": {
    de: "Geben Sie Ihre Kontaktdaten einmalig ein, um alle Downloads freizuschalten.",
    pl: "Wprowadź swoje dane kontaktowe jeden raz, aby odblokować wszystkie pliki do pobrania.",
    sl: "Enkrat vnesite svoje kontaktne podatke, da odklenete vse prenose.",
    ru: "Введите контактные данные один раз, чтобы разблокировать все загрузки.",
  },
  "Unlock and download": {
    de: "Freischalten und herunterladen",
    pl: "Odblokuj i pobierz",
    sl: "Odkleni in prenesi",
    ru: "Разблокировать и скачать",
  },
  "All downloads are now unlocked.": {
    de: "Alle Downloads sind jetzt freigeschaltet.",
    pl: "Wszystkie pliki do pobrania są teraz odblokowane.",
    sl: "Vsi prenosi so zdaj odklenjeni.",
    ru: "Все загрузки теперь разблокированы.",
  },
  "Your download should begin automatically. You can also use the button below.": {
    de: "Ihr Download sollte automatisch beginnen. Sie können auch die Schaltfläche unten verwenden.",
    pl: "Pobieranie powinno rozpocząć się automatycznie. Możesz także użyć przycisku poniżej.",
    sl: "Prenos bi se moral začeti samodejno. Uporabite lahko tudi spodnji gumb.",
    ru: "Загрузка должна начаться автоматически. Вы также можете воспользоваться кнопкой ниже.",
  },
  "Download file": {
    de: "Datei herunterladen",
    pl: "Pobierz plik",
    sl: "Prenesi datoteko",
    ru: "Скачать файл",
  },
};
