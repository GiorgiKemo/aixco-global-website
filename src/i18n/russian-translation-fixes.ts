type RussianTranslationSource = Partial<Record<string, { ru: string }>>;

export const russianTranslationFixes = {
  "ACQUIRE.PARTNER.CREATE VALUE.": {
    ru: "ПРИОБРЕСТИ.СОТРУДНИЧАТЬ.СОЗДАТЬ ЦЕННОСТЬ.",
  },
  "Gross Development Value (GDV)": {
    ru: "Валовая стоимость развития (GDV)",
  },
  "Swiss real estate heritage": {
    ru: "Швейцарское наследие в сфере недвижимости",
  },
  "Development value": {
    ru: "Стоимость девелопмента",
  },
  "Development value: USD 462m": {
    ru: "Стоимость девелопмента: 462 млн USD",
  },
} satisfies RussianTranslationSource;
