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
    ru: "Стоимость девелопмента: $462М",
  },
  "USD 462m": {
    ru: "$462М",
  },
  "USD 350m": {
    ru: "$350М",
  },
  "USD 350m mixed-use program": {
    ru: "Многофункциональная программа на $350М",
  },
  "Development scope: USD 350m mixed-use program": {
    ru: "Масштаб: многофункциональная программа на $350М",
  },
} satisfies RussianTranslationSource;
