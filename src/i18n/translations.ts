export type Lang = "en" | "de" | "ru" | "ka" | "tr" | "ar";

export const languageOptions: { code: Lang; label: string; native: string; flag: string }[] = [
  { code: "en", label: "English", native: "EN", flag: "GB" },
  { code: "de", label: "Deutsch", native: "DE", flag: "DE" },
  { code: "ru", label: "Русский", native: "RU", flag: "RU" },
  { code: "ka", label: "ქართული", native: "KA", flag: "GE" },
  { code: "tr", label: "Türkçe", native: "TR", flag: "TR" },
  { code: "ar", label: "العربية", native: "AR", flag: "SA" },
];

export const textTranslations = {
  "Home": {
    "de": "Startseite",
    "ru": "Главная",
    "ka": "მთავარი",
    "tr": "Ana Sayfa",
    "ar": "الرئيسية"
  },
  "About AIXCO": {
    "de": "Über AIXCO",
    "ru": "О AIXCO",
    "ka": "AIXCO-ს შესახებ",
    "tr": "AIXCO Hakkında",
    "ar": "حول AIXCO"
  },
  "Why Batumi": {
    "de": "Warum Batumi",
    "ru": "Почему Батуми",
    "ka": "რატომ ბათუმი",
    "tr": "Neden Batum",
    "ar": "لماذا باتومي"
  },
  "Ways to Participate": {
    "de": "Teilnahmemöglichkeiten",
    "ru": "Способы участия",
    "ka": "მონაწილეობის გზები",
    "tr": "Katılım Yolları",
    "ar": "طرق المشاركة"
  },
  "How AIXCO Works": {
    "de": "Wie AIXCO funktioniert",
    "ru": "Как работает AIXCO",
    "ka": "როგორ მუშაობს AIXCO",
    "tr": "AIXCO Nasıl Çalışır",
    "ar": "كيف تعمل AIXCO"
  },
  "Our Team": {
    "de": "Unser Team",
    "ru": "Наша команда",
    "ka": "ჩვენი გუნდი",
    "tr": "Ekibimiz",
    "ar": "فريقنا"
  },
  "Partners": {
    "de": "Partner",
    "ru": "Партнеры",
    "ka": "პარტნიორები",
    "tr": "Ortaklar",
    "ar": "الشركاء"
  },
  "Energy": {
    "de": "Energie",
    "ru": "Энергия",
    "ka": "ენერგია",
    "tr": "Enerji",
    "ar": "الطاقة"
  },
  "FAQs": {
    "de": "FAQ",
    "ru": "ЧаВо",
    "ka": "ხშირი კითხვები",
    "tr": "SSS",
    "ar": "الأسئلة الشائعة"
  },
  "Contact": {
    "de": "Kontakt",
    "ru": "Контакты",
    "ka": "კონტაქტი",
    "tr": "İletişim",
    "ar": "اتصل بنا"
  },
  "Login": {
    "de": "Anmelden",
    "ru": "Войти",
    "ka": "შესვლა",
    "tr": "Giriş",
    "ar": "تسجيل الدخول"
  },
  "Register": {
    "de": "Registrieren",
    "ru": "Регистрация",
    "ka": "რეგისტრაცია",
    "tr": "Kayıt Ol",
    "ar": "التسجيل"
  },
  "Terms & Conditions": {
    "de": "Allgemeine Geschäftsbedingungen",
    "ru": "Условия и положения",
    "ka": "წესები და პირობები",
    "tr": "Şartlar ve Koşullar",
    "ar": "الشروط والأحكام"
  },
  "Privacy Policy": {
    "de": "Datenschutzrichtlinie",
    "ru": "Политика конфиденциальности",
    "ka": "კონფიდენციალურობის პოლიტიკა",
    "tr": "Gizlilik Politikası",
    "ar": "سياسة الخصوصية"
  },
  "Quality Real Estate Participation": {
    "de": "Hochwertige Immobilienbeteiligung",
    "ru": "Качественное участие в недвижимости",
    "ka": "უძრავ ქონებაში ხარისხიანი მონაწილეობა",
    "tr": "Nitelikli Gayrimenkul Katılımı",
    "ar": "مشاركة عقارية عالية الجودة"
  },
  "Participate where growth, stability, and long term value creation meet. AIXCO gives private partners a simple and transparent way to join selected real estate projects, starting from €1,000.": {
    "de": "Beteiligen Sie sich dort, wo Wachstum, Stabilität und langfristige Wertschöpfung zusammenkommen. AIXCO bietet privaten Partnern einen einfachen und transparenten Zugang zu ausgewählten Immobilienprojekten ab 1.000 €.",
    "ru": "Участвуйте там, где сочетаются рост, стабильность и долгосрочное создание стоимости. AIXCO предлагает частным партнерам простой и прозрачный способ присоединиться к выбранным проектам недвижимости, начиная от 1 000 €.",
    "ka": "მიიღეთ მონაწილეობა იქ, სადაც ერთიანდება ზრდა, სტაბილურობა და გრძელვადიანი ღირებულების შექმნა. AIXCO კერძო პარტნიორებს სთავაზობს მარტივ და გამჭვირვალე გზას შერჩეულ უძრავი ქონების პროექტებში მონაწილეობის მისაღებად, დაწყებული 1,000 ევროდან.",
    "tr": "Büyüme, istikrar ve uzun vadeli değer yaratımının buluştuğu yerde yer alın. AIXCO, özel ortaklara seçilmiş gayrimenkul projelerine 1.000 €'dan başlayan tutarlarla katılmaları için basit ve şeffaf bir yol sunar.",
    "ar": "شارك حيث يلتقي النمو والاستقرار وخلق القيمة على المدى الطويل. تمنح AIXCO الشركاء من القطاع الخاص طريقة بسيطة وشفافة للانضمام إلى مشاريع عقارية مختارة بدءًا من 1,000 يورو."
  },
  "Starting from €1,000": {
    "de": "Ab 1.000 €",
    "ru": "От 1 000 €",
    "ka": "1,000 ევროდან",
    "tr": "1.000 €'dan başlayan",
    "ar": "ابتداءً من 1,000 يورو"
  },
  "AIXCO - A Product Powerhouse": {
    "de": "AIXCO – Eine Produkt-Powerhouse",
    "ru": "AIXCO — мощная продуктовая платформа",
    "ka": "AIXCO — ძლიერი პროდუქტული პლატფორმა",
    "tr": "AIXCO - Güçlü Bir Ürün Platformu",
    "ar": "AIXCO - منصة منتجات قوية"
  },
  "Established in 2009, AIXCO is a disciplined real estate holding company with a strong track record across property and financial investments. Headquartered in Vienna and operating in Dubai and Batumi, AIXCO Global specializes in structuring and co-investing in portfolios, guided by a commitment to long-term value creation and enduring investor trust.": {
    "de": "AIXCO wurde 2009 gegründet und ist eine disziplinierte Immobilienholding mit einer starken Erfolgsbilanz bei Immobilien- und Finanzinvestitionen. Mit Hauptsitz in Wien und Aktivitäten in Dubai und Batumi ist AIXCO Global auf die Strukturierung und Ko-Investition in Portfolios spezialisiert – mit Fokus auf langfristige Wertschöpfung und nachhaltiges Investorenvertrauen.",
    "ru": "Основанная в 2009 году, AIXCO — это дисциплинированная холдинговая компания в сфере недвижимости с сильным послужным списком в имущественных и финансовых инвестициях. Штаб-квартира находится в Вене, деятельность ведется в Дубае и Батуми. AIXCO Global специализируется на структурировании и соинвестировании в портфели, руководствуясь стремлением к долгосрочному созданию стоимости и устойчивому доверию инвесторов.",
    "ka": "2009 წელს დაარსებული AIXCO არის დისციპლინირებული უძრავი ქონების ჰოლდინგი, რომელსაც აქვს ძლიერი გამოცდილება ქონებრივ და ფინანსურ ინვესტიციებში. ვენაში მდებარე სათაო ოფისით და დუბაისა და ბათუმში ოპერირებით, AIXCO Global სპეციალიზდება პორტფელების სტრუქტურირებასა და თანაინვესტირებაში, გრძელვადიანი ღირებულების შექმნისა და ინვესტორთა მდგრადი ნდობის საფუძველზე.",
    "tr": "2009 yılında kurulan AIXCO, gayrimenkul ve finansal yatırımlarda güçlü bir geçmişe sahip, disiplinli bir gayrimenkul holding şirketidir. Merkezi Viyana'da olup Dubai ve Batum'da faaliyet gösteren AIXCO Global, uzun vadeli değer yaratımı ve kalıcı yatırımcı güveni odağıyla portföy yapılandırma ve ortak yatırım alanında uzmanlaşmıştır.",
    "ar": "تأسست AIXCO في عام 2009، وهي شركة قابضة عقارية منضبطة تتمتع بسجل قوي في الاستثمارات العقارية والمالية. يقع مقرها الرئيسي في فيينا وتعمل في دبي وباتومي، وتتخصص AIXCO Global في هيكلة المحافظ والاستثمار المشترك فيها، مدفوعة بالالتزام بخلق قيمة طويلة الأجل وثقة المستثمرين المستدامة."
  },
  "Trusted Clients": {
    "de": "Vertrauensvolle Kunden",
    "ru": "Надежные клиенты",
    "ka": "სანდო კლიენტები",
    "tr": "Güvenilir Müşteriler",
    "ar": "عملاء موثوقون"
  },
  "Gross Development Value (GDV)": {
    "de": "Bruttoentwicklungswert (GDV)",
    "ru": "Общая стоимость развития (GDV)",
    "ka": "სრული განვითარების ღირებულება (GDV)",
    "tr": "Toplam Geliştirme Değeri (GDV)",
    "ar": "إجمالي قيمة التطوير (GDV)"
  },
  "Total Transactions": {
    "de": "Gesamttransaktionen",
    "ru": "Всего сделок",
    "ka": "სულ ტრანზაქციები",
    "tr": "Toplam İşlem",
    "ar": "إجمالي المعاملات"
  },
  "In Business Since": {
    "de": "Am Markt seit",
    "ru": "На рынке с",
    "ka": "ბიზნესში წლიდან",
    "tr": "Faaliyette olduğu yıl",
    "ar": "في العمل منذ"
  },
  "Employees": {
    "de": "Mitarbeiter",
    "ru": "Сотрудники",
    "ka": "თანამშრომლები",
    "tr": "Çalışanlar",
    "ar": "الموظفون"
  },
  "Raised Capital": {
    "de": "Eingeworbenes Kapital",
    "ru": "Привлеченный капитал",
    "ka": "მოზიდული კაპიტალი",
    "tr": "Toplanan Sermaye",
    "ar": "رأس المال المُجمع"
  },
  "Assets Under Management (AUM)": {
    "de": "Verwaltetes Vermögen (AUM)",
    "ru": "Активы под управлением (AUM)",
    "ka": "მართვაში არსებული აქტივები (AUM)",
    "tr": "Yönetilen Varlıklar (AUM)",
    "ar": "الأصول المدارة (AUM)"
  },
  "Investment Returns": {
    "de": "Investmentrenditen",
    "ru": "Доходность инвестиций",
    "ka": "ინვესტიციის ანაზღაურება",
    "tr": "Yatırım Getirileri",
    "ar": "عوائد الاستثمار"
  },
  "Successfully generated returns with 4.9x multiple": {
    "de": "Erfolgreich Renditen mit einem Multiple von 4,9x erzielt",
    "ru": "Успешно получена доходность с мультипликатором 4,9x",
    "ka": "წარმატებით მიღწეულია 4.9x უკუგება",
    "tr": "4,9x çarpanla başarılı getiri sağlandı",
    "ar": "تم تحقيق عوائد بنجاح بمضاعف 4.9x"
  },
  "Realized successfully with distributions": {
    "de": "Erfolgreich realisiert mit Ausschüttungen",
    "ru": "Успешно реализовано с выплатами",
    "ka": "წარმატებით დასრულდა განაწილებებით",
    "tr": "Dağıtımlarla başarıyla gerçekleştirildi",
    "ar": "تم التنفيذ بنجاح مع توزيعات"
  },
  "Prime canal-front location, strong partnerships, premium delivery": {
    "de": "Erstklassige Lage am Kanal, starke Partnerschaften, hochwertige Umsetzung",
    "ru": "Премиальное расположение у канала, сильные партнерства, качественная реализация",
    "ka": "პრემიუმ მდებარეობა არხის პირას, ძლიერი პარტნიორობები, მაღალი ხარისხის მიწოდება",
    "tr": "Birinci sınıf kanal önü konum, güçlü ortaklıklar, premium teslimat",
    "ar": "موقع مميز على القناة، شراكات قوية، وتسليم فاخر"
  },
  "Positioned in a high demand healthcare driven community": {
    "de": "Positioniert in einer stark nachgefragten, gesundheitsorientierten Gemeinschaft",
    "ru": "Расположен в сообществе с высоким спросом, ориентированном на здравоохранение",
    "ka": "განთავსებულია მაღალი მოთხოვნის მქონე ჯანდაცვაზე ორიენტირებულ საზოგადოებაში",
    "tr": "Yüksek talep gören sağlık odaklı bir toplulukta konumlandırılmıştır",
    "ar": "يقع ضمن مجتمع يقوده الطلب المرتفع على الرعاية الصحية"
  },
  "Successfully positioned in healthcare-driven developments": {
    "de": "Erfolgreich in gesundheitsorientierten Entwicklungen positioniert",
    "ru": "Успешно позиционирован в проектах, ориентированных на здравоохранение",
    "ka": "წარმატებით პოზიციონირებულია ჯანდაცვაზე ორიენტირებულ პროექტებში",
    "tr": "Sağlık odaklı projelerde başarıyla konumlandırılmıştır",
    "ar": "تم وضعه بنجاح ضمن مشاريع مدفوعة بقطاع الرعاية الصحية"
  },
  "Specialized assets catering to healthcare professionals and clients": {
    "de": "Spezialisierte Vermögenswerte für Fachkräfte und Kunden im Gesundheitswesen",
    "ru": "Специализированные активы для специалистов и клиентов в сфере здравоохранения",
    "ka": "სპეციალიზებული აქტივები ჯანდაცვის პროფესიონალებისა და კლიენტებისთვის",
    "tr": "Sağlık profesyonelleri ve müşterilerine hitap eden uzmanlaşmış varlıklar",
    "ar": "أصول متخصصة تخدم المهنيين والعملاء في قطاع الرعاية الصحية"
  },
  "Georgia sits at the crossroads of Europe and Asia, maintaining strong relationships with neighboring countries as well as with the EU, the United States, and Asian markets. Batumi offers a rare opportunity to enter an emerging market that is steadily aligning with the highest standards in safety, education, and transparency. At the same time, it benefits from a flexible, low-regulation environment and strong long-term growth potential.": {
    "de": "Georgien liegt an der Schnittstelle zwischen Europa und Asien und pflegt starke Beziehungen zu Nachbarländern sowie zur EU, den Vereinigten Staaten und asiatischen Märkten. Batumi bietet eine seltene Gelegenheit, in einen aufstrebenden Markt einzutreten, der sich stetig an höchsten Standards bei Sicherheit, Bildung und Transparenz orientiert. Gleichzeitig profitiert die Stadt von einem flexiblen, wenig regulierten Umfeld und starkem langfristigem Wachstumspotenzial.",
    "ru": "Грузия находится на перекрестке Европы и Азии, поддерживая прочные связи с соседними странами, а также с ЕС, США и азиатскими рынками. Батуми предлагает редкую возможность выйти на развивающийся рынок, который постепенно приближается к самым высоким стандартам безопасности, образования и прозрачности. В то же время он выигрывает от гибкой среды с низким уровнем регулирования и сильного долгосрочного потенциала роста.",
    "ka": "საქართველო ევროპისა და აზიის გზაჯვარედინზე მდებარეობს და მყარ ურთიერთობებს ინარჩუნებს როგორც მეზობელ ქვეყნებთან, ისე ევროკავშირთან, აშშ-სთან და აზიურ ბაზრებთან. ბათუმი გთავაზობთ იშვიათ შესაძლებლობას შეხვიდეთ განვითარებად ბაზარზე, რომელიც სტაბილურად უახლოვდება უსაფრთხოების, განათლებისა და გამჭვირვალობის უმაღლეს სტანდარტებს. ამავე დროს, ის სარგებლობს მოქნილი, დაბალი რეგულაციის გარემოთი და ძლიერი გრძელვადიანი ზრდის პოტენციალით.",
    "tr": "Gürcistan, Avrupa ile Asya'nın kesişim noktasında yer alır ve komşu ülkelerin yanı sıra AB, Amerika Birleşik Devletleri ve Asya pazarlarıyla güçlü ilişkiler sürdürür. Batum, güvenlik, eğitim ve şeffaflıkta en yüksek standartlara giderek yaklaşan gelişmekte olan bir pazara giriş için nadir bir fırsat sunar. Aynı zamanda esnek, düşük düzenlemeli bir ortamdan ve güçlü uzun vadeli büyüme potansiyelinden yararlanır.",
    "ar": "تقع جورجيا عند مفترق الطرق بين أوروبا وآسيا، وتحافظ على علاقات قوية مع الدول المجاورة وكذلك مع الاتحاد الأوروبي والولايات المتحدة والأسواق الآسيوية. وتوفر باتومي فرصة نادرة لدخول سوق ناشئة تتجه بثبات نحو أعلى معايير السلامة والتعليم والشفافية. وفي الوقت نفسه، تستفيد من بيئة مرنة منخفضة التنظيم وإمكانات نمو قوية على المدى الطويل."
  },
  "Net rental yields starting from 8%": {
    "de": "Netto-Mietrenditen ab 8%",
    "ru": "Чистая арендная доходность от 8%",
    "ka": "სუფთა საიჯარო შემოსავალი 8%-დან",
    "tr": "Net kira getirileri %8'den başlar",
    "ar": "عوائد إيجار صافية تبدأ من 8٪"
  },
  "Annual price growth of up to 12%": {
    "de": "Jährliches Preiswachstum von bis zu 12%",
    "ru": "Годовой рост цен до 12%",
    "ka": "წლიური ფასის ზრდა 12%-მდე",
    "tr": "Yıllık fiyat artışı %12'ye kadar",
    "ar": "نمو سنوي للأسعار يصل إلى 12٪"
  },
  "Property prices starting from €50,000": {
    "de": "Immobilienpreise ab 50.000 €",
    "ru": "Цены на недвижимость от 50 000 €",
    "ka": "უძრავი ქონების ფასები იწყება 50,000 ევროდან",
    "tr": "Gayrimenkul fiyatları 50.000 €'dan başlar",
    "ar": "أسعار العقارات تبدأ من 50,000 يورو"
  },
  "Full foreign ownership permitted": {
    "de": "Volles ausländisches Eigentum erlaubt",
    "ru": "Полное иностранное владение разрешено",
    "ka": "სრულად ნებადართულია უცხოელთა საკუთრება",
    "tr": "Tam yabancı mülkiyetine izin verilir",
    "ar": "يُسمح بالملكية الأجنبية الكاملة"
  },
  "Low rental tax of 1% (up to €180,000/year)": {
    "de": "Niedrige Mietsteuer von 1% (bis 180.000 €/Jahr)",
    "ru": "Низкий налог на аренду 1% (до 180 000 €/год)",
    "ka": "დაბალი საიჯარო გადასახადი 1% (180,000 ევრომდე/წელიწადში)",
    "tr": "Düşük kira vergisi %1 (yılda 180.000 €'ya kadar)",
    "ar": "ضريبة إيجار منخفضة بنسبة 1٪ (حتى 180,000 يورو سنويًا)"
  },
  "Capital gains tax exemption after 2 years": {
    "de": "Befreiung von der Kapitalertragssteuer nach 2 Jahren",
    "ru": "Освобождение от налога на прирост капитала через 2 года",
    "ka": "კაპიტალის მოგების გადასახადისგან გათავისუფლება 2 წლის შემდეგ",
    "tr": "2 yıl sonra sermaye kazancı vergisi muafiyeti",
    "ar": "إعفاء من ضريبة أرباح رأس المال بعد سنتين"
  },
  "Financing 60% of property value": {
    "de": "Finanzierung bis 60% des Immobilienwerts",
    "ru": "Финансирование 60% стоимости объекта",
    "ka": "ქონების ღირებულების 60%-ის დაფინანსება",
    "tr": "Gayrimenkul değerinin %60'ına kadar finansman",
    "ar": "تمويل حتى 60٪ من قيمة العقار"
  },
  "Customers/Partners Profit": {
    "de": "Gewinn für Kunden/Partner",
    "ru": "Прибыль клиентов/партнеров",
    "ka": "კლიენტების/პარტნიორების მოგება",
    "tr": "Müşteri/Ortak Kazancı",
    "ar": "أرباح العملاء/الشركاء"
  },
  "Choose the route that fits your goals. Customers can either subscribe to the AIXCO 6% bond, secured by underlying property, or purchase an apartment directly and benefit from rental income potential, capital appreciation, and Batumi’s favorable tax environment.": {
    "de": "Wählen Sie den Weg, der zu Ihren Zielen passt. Kunden können entweder die AIXCO-6%-Anleihe zeichnen, die durch zugrunde liegende Immobilien besichert ist, oder direkt eine Wohnung kaufen und von Mieteinnahmen, Wertsteigerung und dem günstigen Steuerumfeld Batumis profitieren.",
    "ru": "Выберите путь, который соответствует вашим целям. Клиенты могут либо подписаться на облигацию AIXCO 6%, обеспеченную недвижимостью, либо купить квартиру напрямую и воспользоваться потенциальным арендным доходом, ростом капитала и благоприятной налоговой средой Батуми.",
    "ka": "აირჩიეთ გზა, რომელიც თქვენს მიზნებს შეესაბამება. მომხმარებლებს შეუძლიათ გამოიწერონ AIXCO-ს 6%-იანი ობლიგაცია, რომელიც უზრუნველყოფილია უძრავი ქონებით, ან პირდაპირ შეიძინონ ბინა და ისარგებლონ საიჯარო შემოსავლის პოტენციალით, კაპიტალის ზრდით და ბათუმის ხელსაყრელი საგადასახადო გარემოთი.",
    "tr": "Hedeflerinize uygun yolu seçin. Müşteriler, dayanak mülkle güvence altına alınmış AIXCO %6 tahviline katılabilir veya doğrudan bir daire satın alarak kira geliri potansiyeli, sermaye değer artışı ve Batum'un elverişli vergi ortamından yararlanabilir.",
    "ar": "اختر المسار الذي يناسب أهدافك. يمكن للعملاء إما الاكتتاب في سند AIXCO بنسبة 6٪ والمضمون بعقار أساسي، أو شراء شقة مباشرة والاستفادة من إمكانات دخل الإيجار وارتفاع قيمة الأصل والبيئة الضريبية المواتية في باتومي."
  },
  "Buy the AIXCO 6% Bond": {
    "de": "AIXCO 6%-Anleihe kaufen",
    "ru": "Купить облигацию AIXCO 6%",
    "ka": "შეიძინეთ AIXCO-ს 6%-იანი ობლიგაცია",
    "tr": "AIXCO %6 Tahvilini Satın Al",
    "ar": "اشترِ سند AIXCO بنسبة 6٪"
  },
  "Customers sign up, complete onboarding, and invest in the AIXCO bond through a seamless digital process.": {
    "de": "Kunden registrieren sich, schließen das Onboarding ab und investieren über einen nahtlosen digitalen Prozess in die AIXCO-Anleihe.",
    "ru": "Клиенты регистрируются, проходят онбординг и инвестируют в облигацию AIXCO через удобный цифровой процесс.",
    "ka": "მომხმარებლები რეგისტრირდებიან, ასრულებენ ონბორდინგს და აბანდებენ AIXCO-ს ობლიგაციაში შეუფერხებელი ციფრული პროცესის საშუალებით.",
    "tr": "Müşteriler kayıt olur, onboarding sürecini tamamlar ve sorunsuz bir dijital süreç üzerinden AIXCO tahviline yatırım yapar.",
    "ar": "يقوم العملاء بالتسجيل واستكمال عملية الإعداد والاستثمار في سند AIXCO عبر عملية رقمية سلسة."
  },
  "Purchase the AIXCO Bond with a guaranteed 30% return over 5 years": {
    "de": "Kaufen Sie die AIXCO-Anleihe mit garantierter 30%-Rendite über 5 Jahre",
    "ru": "Приобретите облигацию AIXCO с гарантированной доходностью 30% за 5 лет",
    "ka": "შეიძინეთ AIXCO-ს ობლიგაცია გარანტირებული 30%-იანი შემოსავლით 5 წელიწადში",
    "tr": "5 yılda garantili %30 getiriyle AIXCO Tahvilini satın alın",
    "ar": "اشترِ سند AIXCO بعائد مضمون 30٪ خلال 5 سنوات"
  },
  "— combining structured security with strong, predictable growth. Backed by property as collateral, the bond provides investors with an added layer of asset-linked confidence.": {
    "de": "— und verbinden Sie strukturierte Sicherheit mit starkem, planbarem Wachstum. Durch Immobilien besichert bietet die Anleihe Anlegern eine zusätzliche, vermögensbezogene Vertrauensebene.",
    "ru": "— сочетая структурированную защиту с сильным и предсказуемым ростом. Обеспеченная недвижимостью в качестве залога, облигация дает инвесторам дополнительный уровень уверенности, связанный с активом.",
    "ka": "— რაც აერთიანებს სტრუქტურირებულ უსაფრთხოებას ძლიერ და პროგნოზირებად ზრდასთან. უძრავი ქონებით უზრუნველყოფილი ობლიგაცია ინვესტორებს აქტივზე მიბმული დამატებითი ნდობის ფენას აძლევს.",
    "tr": "— yapılandırılmış güvenliği güçlü ve öngörülebilir büyüme ile birleştirir. Teminat olarak gayrimenkulle desteklenen tahvil, yatırımcılara varlığa bağlı ek güven sunar.",
    "ar": "— ما يجمع بين الأمان المنظم والنمو القوي المتوقع. وبفضل دعم السند بعقار كضمان، فإنه يوفر للمستثمرين طبقة إضافية من الثقة المرتبطة بالأصل."
  },
  "Step 1:": {
    "de": "Schritt 1:",
    "ru": "Шаг 1:",
    "ka": "ნაბიჯი 1:",
    "tr": "Adım 1:",
    "ar": "الخطوة 1:"
  },
  "Sign up and complete onboarding.": {
    "de": "Registrieren Sie sich und schließen Sie das Onboarding ab.",
    "ru": "Зарегистрируйтесь и завершите онбординг.",
    "ka": "დარეგისტრირდით და დაასრულეთ ონბორდინგი.",
    "tr": "Kayıt olun ve onboarding sürecini tamamlayın.",
    "ar": "قم بالتسجيل وأكمل عملية الإعداد."
  },
  "Step 2:": {
    "de": "Schritt 2:",
    "ru": "Шаг 2:",
    "ka": "ნაბიჯი 2:",
    "tr": "Adım 2:",
    "ar": "الخطوة 2:"
  },
  "Review the AIXCO 6% bond offering and documentation.": {
    "de": "Prüfen Sie das AIXCO-6%-Angebot und die Unterlagen.",
    "ru": "Изучите предложение по облигации AIXCO 6% и документацию.",
    "ka": "გაეცანით AIXCO-ს 6%-იანი ობლიგაციის შეთავაზებას და დოკუმენტაციას.",
    "tr": "AIXCO %6 tahvil teklifini ve belgelerini inceleyin.",
    "ar": "راجع عرض سند AIXCO بنسبة 6٪ والوثائق ذات الصلة."
  },
  "Step 3:": {
    "de": "Schritt 3:",
    "ru": "Шаг 3:",
    "ka": "ნაბიჯი 3:",
    "tr": "Adım 3:",
    "ar": "الخطوة 3:"
  },
  "Subscribe digitally and participate in the bond.": {
    "de": "Zeichnen Sie digital und beteiligen Sie sich an der Anleihe.",
    "ru": "Подпишитесь в цифровом формате и участвуйте в облигации.",
    "ka": "გამოიწერეთ ციფრულად და მიიღეთ მონაწილეობა ობლიგაციაში.",
    "tr": "Dijital olarak katılın ve tahvile dahil olun.",
    "ar": "اكتتب رقميًا وشارك في السند."
  },
  "How they profit:": {
    "de": "Wie sie profitieren:",
    "ru": "Как они получают прибыль:",
    "ka": "როგორ იღებენ მოგებას:",
    "tr": "Nasıl kazanç sağlarlar:",
    "ar": "كيف يحققون الربح:"
  },
  "Investors earn 6% on the bond, with the structure secured by underlying property.": {
    "de": "Investoren erhalten 6% auf die Anleihe, deren Struktur durch zugrunde liegende Immobilien besichert ist.",
    "ru": "Инвесторы получают 6% по облигации, структура которой обеспечена базовой недвижимостью.",
    "ka": "ინვესტორები ობლიგაციაზე იღებენ 6%-ს, ხოლო სტრუქტურა უძრავი ქონებით არის უზრუნველყოფილი.",
    "tr": "Yatırımcılar, dayanak mülkle güvence altına alınmış yapı sayesinde tahvilde %6 kazanır.",
    "ar": "يحصل المستثمرون على عائد 6٪ على السند، مع هيكل مضمون بعقار أساسي."
  },
  "Buy an Apartment in Batumi": {
    "de": "Eine Wohnung in Batumi kaufen",
    "ru": "Купить квартиру в Батуми",
    "ka": "შეიძინეთ ბინა ბათუმში",
    "tr": "Batum'da Daire Satın Al",
    "ar": "اشترِ شقة في باتومي"
  },
  "Customers sign up, book a tour, and visit the apartment in person. This route is designed for buyers seeking direct ownership and exposure to Batumi’s long-term growth story.": {
    "de": "Kunden registrieren sich, buchen eine Besichtigung und besuchen die Wohnung persönlich. Dieser Weg ist für Käufer gedacht, die direktes Eigentum und Zugang zur langfristigen Wachstumsgeschichte Batumis suchen.",
    "ru": "Клиенты регистрируются, бронируют тур и лично посещают квартиру. Этот путь предназначен для покупателей, ищущих прямое владение и участие в долгосрочном росте Батуми.",
    "ka": "მომხმარებლები რეგისტრირდებიან, ჯავშნიან ტურს და პირადად სტუმრობენ ბინას. ეს გზა განკუთვნილია მყიდველებისთვის, რომლებიც ეძებენ პირდაპირ საკუთრებას და ბათუმის გრძელვადიანი ზრდის ისტორიაში მონაწილეობას.",
    "tr": "Müşteriler kayıt olur, tur rezervasyonu yapar ve daireyi yerinde ziyaret eder. Bu yol, doğrudan mülkiyet ve Batum'un uzun vadeli büyüme hikâyesine erişim arayan alıcılar için tasarlanmıştır.",
    "ar": "يقوم العملاء بالتسجيل وحجز جولة وزيارة الشقة شخصيًا. هذا المسار مخصص للمشترين الباحثين عن ملكية مباشرة والتعرض لقصة النمو طويلة الأجل في باتومي."
  },
  "Sign up and submit your interest.": {
    "de": "Registrieren Sie sich und übermitteln Sie Ihr Interesse.",
    "ru": "Зарегистрируйтесь и отправьте заявку.",
    "ka": "დარეგისტრირდით და გამოგვიგზავნეთ თქვენი ინტერესი.",
    "tr": "Kayıt olun ve ilginizi gönderin.",
    "ar": "قم بالتسجيل وأرسل اهتمامك."
  },
  "Book a tour and visit the apartment.": {
    "de": "Buchen Sie eine Besichtigung und besuchen Sie die Wohnung.",
    "ru": "Забронируйте тур и посетите квартиру.",
    "ka": "დაჯავშნეთ ტური და მოინახულეთ ბინა.",
    "tr": "Tur rezervasyonu yapın ve daireyi ziyaret edin.",
    "ar": "احجز جولة وقم بزيارة الشقة."
  },
  "Proceed with purchase and ownership setup.": {
    "de": "Fahren Sie mit Kauf und Eigentumsübertragung fort.",
    "ru": "Перейдите к покупке и оформлению собственности.",
    "ka": "გააგრძელეთ შეძენა და საკუთრების ფორმირება.",
    "tr": "Satın alma ve mülkiyet kurulumuna geçin.",
    "ar": "تابع الشراء وإعداد الملكية."
  },
  "Why it matters:": {
    "de": "Warum es wichtig ist:",
    "ru": "Почему это важно:",
    "ka": "რატომ არის ეს მნიშვნელოვანი:",
    "tr": "Neden önemli:",
    "ar": "لماذا يهم ذلك:"
  },
  "Buyers can benefit from potential property price appreciation, rental yield opportunities, and Batumi’s favorable tax environment.": {
    "de": "Käufer können von möglicher Wertsteigerung, Mietrenditechancen und dem günstigen Steuerumfeld Batumis profitieren.",
    "ru": "Покупатели могут воспользоваться потенциальным ростом стоимости недвижимости, возможностями арендной доходности и благоприятной налоговой средой Батуми.",
    "ka": "მყიდველებს შეუძლიათ ისარგებლონ ქონების ფასის პოტენციური ზრდით, საიჯარო შემოსავლის შესაძლებლობებით და ბათუმის ხელსაყრელი საგადასახადო გარემოთი.",
    "tr": "Alıcılar, potansiyel değer artışı, kira getirisi fırsatları ve Batum'un elverişli vergi ortamından yararlanabilir.",
    "ar": "يمكن للمشترين الاستفادة من احتمال ارتفاع أسعار العقارات وفرص عوائد الإيجار والبيئة الضريبية المواتية في باتومي."
  },
  "Journeys": {
    "de": "Reisen",
    "ru": "Пути",
    "ka": "მარშრუტები",
    "tr": "Yolculuklar",
    "ar": "المسارات"
  },
  "Choose the journey that fits your role. Whether you are investing directly, distributing products, or bringing projects to market, the process is structured, transparent, and digitally managed.": {
    "de": "Wählen Sie den Weg, der zu Ihrer Rolle passt. Ob Sie direkt investieren, Produkte vertreiben oder Projekte auf den Markt bringen – der Prozess ist strukturiert, transparent und digital verwaltet.",
    "ru": "Выберите путь, который соответствует вашей роли. Независимо от того, инвестируете ли вы напрямую, распространяете продукты или выводите проекты на рынок, процесс структурирован, прозрачен и управляется в цифровом виде.",
    "ka": "აირჩიეთ მარშრუტი, რომელიც თქვენს როლს შეესაბამება. პირდაპირ ინვესტირებთ, ავრცელებთ პროდუქტებს თუ პროექტებს ბაზარზე უშვებთ — პროცესი სტრუქტურირებულია, გამჭვირვალეა და ციფრულად იმართება.",
    "tr": "Rolünüze uygun yolculuğu seçin. Doğrudan yatırım yapıyor, ürün dağıtıyor veya projeleri pazara sunuyor olun; süreç yapılandırılmış, şeffaf ve dijital olarak yönetilir.",
    "ar": "اختر المسار الذي يناسب دورك. سواء كنت تستثمر مباشرة أو توزع المنتجات أو تطرح المشاريع في السوق، فإن العملية منظمة وشفافة وتدار رقميًا."
  },
  "For clients looking to access selected real estate opportunities through a guided digital process.": {
    "de": "Für Kunden, die über einen geführten digitalen Prozess Zugang zu ausgewählten Immobilienchancen suchen.",
    "ru": "Для клиентов, желающих получить доступ к отобранным возможностям в недвижимости через управляемый цифровой процесс.",
    "ka": "კლიენტებისთვის, რომლებიც ხელმძღვანელობით ციფრული პროცესის საშუალებით შერჩეულ უძრავი ქონების შესაძლებლობებზე წვდომას ეძებენ.",
    "tr": "Yönlendirmeli dijital süreçle seçilmiş gayrimenkul fırsatlarına erişmek isteyen müşteriler için.",
    "ar": "للعملاء الذين يسعون للوصول إلى فرص عقارية مختارة عبر عملية رقمية موجهة."
  },
  "Customer Bond Buyer": {
    "de": "Kunde – Anleihekäufer",
    "ru": "Клиент-покупатель облигаций",
    "ka": "მომხმარებელი ობლიგაციის მყიდველი",
    "tr": "Müşteri Tahvil Alıcısı",
    "ar": "عميل مشتري السندات"
  },
  "For investors seeking fixed-income style opportunities with clear onboarding and documentation.": {
    "de": "Für Investoren, die festverzinsliche Chancen mit klarem Onboarding und Dokumentation suchen.",
    "ru": "Для инвесторов, ищущих возможности фиксированного дохода с понятным онбордингом и документацией.",
    "ka": "ინვესტორებისთვის, რომლებიც ეძებენ ფიქსირებული შემოსავლის ტიპის შესაძლებლობებს მკაფიო ონბორდინგითა და დოკუმენტაციით.",
    "tr": "Net onboarding ve dokümantasyona sahip sabit getirili fırsatlar arayan yatırımcılar için.",
    "ar": "للمستثمرين الباحثين عن فرص شبيهة بالدخل الثابت مع إعداد ووثائق واضحة."
  },
  "Broker": {
    "de": "Makler",
    "ru": "Брокер",
    "ka": "ბროკერი",
    "tr": "Broker",
    "ar": "وسيط"
  },
  "For intermediaries and distribution partners introducing clients and managing deal flow.": {
    "de": "Für Vermittler und Vertriebspartner, die Kunden einführen und Dealflow verwalten.",
    "ru": "Для посредников и партнеров по дистрибуции, представляющих клиентов и управляющих потоком сделок.",
    "ka": "შუამავლებისა და დისტრიბუციის პარტნიორებისთვის, რომლებიც კლიენტებს მოიყვანენ და გარიგებების ნაკადს მართავენ.",
    "tr": "Müşteri tanıtan ve işlem akışını yöneten aracılar ve dağıtım ortakları için.",
    "ar": "للوسطاء وشركاء التوزيع الذين يقدمون العملاء ويديرون تدفق الصفقات."
  },
  "Developer": {
    "de": "Projektentwickler",
    "ru": "Девелопер",
    "ka": "დეველოპერი",
    "tr": "Geliştirici",
    "ar": "مطور"
  },
  "For developers seeking structuring, placement, distribution, and investor market access.": {
    "de": "Für Entwickler, die Strukturierung, Platzierung, Vertrieb und Zugang zum Investorenmarkt suchen.",
    "ru": "Для девелоперов, которым нужны структурирование, размещение, дистрибуция и доступ к рынку инвесторов.",
    "ka": "დეველოპერებისთვის, რომლებიც ეძებენ სტრუქტურირებას, განთავსებას, დისტრიბუციას და ინვესტორთა ბაზარზე წვდომას.",
    "tr": "Yapılandırma, yerleştirme, dağıtım ve yatırımcı pazarına erişim arayan geliştiriciler için.",
    "ar": "للمطورين الباحثين عن الهيكلة والتوزيع والوصول إلى سوق المستثمرين."
  },
  "Our Partners": {
    "de": "Unsere Partner",
    "ru": "Наши партнеры",
    "ka": "ჩვენი პარტნიორები",
    "tr": "Ortaklarımız",
    "ar": "شركاؤنا"
  },
  "Leadership": {
    "de": "Führung",
    "ru": "Руководство",
    "ka": "ლიდერობა",
    "tr": "Liderlik",
    "ar": "القيادة"
  },
  "Meet the leadership team shaping AIXCO’s strategic direction, partnerships, and distribution platform.": {
    "de": "Lernen Sie das Führungsteam kennen, das die strategische Ausrichtung, Partnerschaften und Vertriebsplattform von AIXCO gestaltet.",
    "ru": "Познакомьтесь с командой руководителей, формирующей стратегическое направление, партнерства и платформу дистрибуции AIXCO.",
    "ka": "გაიცანით ხელმძღვანელი გუნდი, რომელიც აყალიბებს AIXCO-ს სტრატეგიულ მიმართულებას, პარტნიორობებსა და დისტრიბუციის პლატფორმას.",
    "tr": "AIXCO'nun stratejik yönünü, ortaklıklarını ve dağıtım platformunu şekillendiren liderlik ekibiyle tanışın.",
    "ar": "تعرّف على فريق القيادة الذي يشكل التوجه الاستراتيجي لـ AIXCO وشراكاتها ومنصة التوزيع الخاصة بها."
  },
  "Founder": {
    "de": "Gründer",
    "ru": "Основатель",
    "ka": "დამფუძნებელი",
    "tr": "Kurucu",
    "ar": "المؤسس"
  },
  "Partner": {
    "de": "Partner",
    "ru": "Партнер",
    "ka": "პარტნიორი",
    "tr": "Ortak",
    "ar": "شريك"
  },
  "Leadership, vision, and overall group direction.": {
    "de": "Führung, Vision und übergeordnete Gruppenausrichtung.",
    "ru": "Лидерство, видение и общее направление группы.",
    "ka": "ლიდერობა, ხედვა და ჯგუფის საერთო მიმართულება.",
    "tr": "Liderlik, vizyon ve genel grup yönü.",
    "ar": "القيادة والرؤية والاتجاه العام للمجموعة."
  },
  "Capital markets, banking relationships, and financial structuring.": {
    "de": "Kapitalmärkte, Bankbeziehungen und Finanzstrukturierung.",
    "ru": "Рынки капитала, банковские отношения и финансовое структурирование.",
    "ka": "კაპიტალის ბაზრები, საბანკო ურთიერთობები და ფინანსური სტრუქტურირება.",
    "tr": "Sermaye piyasaları, bankacılık ilişkileri ve finansal yapılandırma.",
    "ar": "أسواق رأس المال والعلاقات المصرفية والهيكلة المالية."
  },
  "Product positioning, channel development, and distribution strategy.": {
    "de": "Produktpositionierung, Kanalentwicklung und Vertriebsstrategie.",
    "ru": "Позиционирование продукта, развитие каналов и стратегия дистрибуции.",
    "ka": "პროდუქტის პოზიციონირება, არხების განვითარება და დისტრიბუციის სტრატეგია.",
    "tr": "Ürün konumlandırması, kanal geliştirme ve dağıtım stratejisi.",
    "ar": "تموضع المنتج وتطوير القنوات واستراتيجية التوزيع."
  },
  "View profile": {
    "de": "Profil ansehen",
    "ru": "Смотреть профиль",
    "ka": "პროფილის ნახვა",
    "tr": "Profili görüntüle",
    "ar": "عرض الملف"
  },
  "Continue": {
    "de": "Weiter",
    "ru": "Продолжить",
    "ka": "გაგრძელება",
    "tr": "Devam Et",
    "ar": "متابعة"
  },
  "Companies & Partners": {
    "de": "Unternehmen & Partner",
    "ru": "Компании и партнеры",
    "ka": "კომპანიები და პარტნიორები",
    "tr": "Şirketler ve Ortaklar",
    "ar": "الشركات والشركاء"
  },
  "The AIXCO ecosystem": {
    "de": "Das AIXCO-Ökosystem",
    "ru": "Экосистема AIXCO",
    "ka": "AIXCO-ს ეკოსისტემა",
    "tr": "AIXCO ekosistemi",
    "ar": "منظومة AIXCO"
  },
  "Explore the operating companies and strategic partners behind the platform. Global Partners is featured as the lead highlight.": {
    "de": "Entdecken Sie die operativen Unternehmen und strategischen Partner hinter der Plattform. Global Partners wird als Haupt-Highlight präsentiert.",
    "ru": "Изучите операционные компании и стратегических партнеров, стоящих за платформой. Global Partners представлена как ключевой акцент.",
    "ka": "გაეცანით პლატფორმის უკან მდგომ ოპერაციულ კომპანიებსა და სტრატეგიულ პარტნიორებს. Global Partners გამორჩეული მთავარი აქცენტია.",
    "tr": "Platformun arkasındaki operasyonel şirketleri ve stratejik ortakları keşfedin. Global Partners öne çıkan ana marka olarak sunulmaktadır.",
    "ar": "استكشف الشركات التشغيلية والشركاء الاستراتيجيين وراء المنصة. ويتم إبراز Global Partners كأبرز جهة رئيسية."
  },
  "Featured highlight": {
    "de": "Hervorgehobenes Highlight",
    "ru": "Ключевой акцент",
    "ka": "გამორჩეული აქცენტი",
    "tr": "Öne çıkan vurgu",
    "ar": "أبرز عنصر"
  },
  "A premier real estate investment platform focused on identifying, acquiring, and managing high-potential residential and commercial developments.": {
    "de": "Eine führende Immobilieninvestment-Plattform, die auf die Identifizierung, den Erwerb und das Management von Wohn- und Gewerbeprojekten mit hohem Potenzial ausgerichtet ist.",
    "ru": "Премиальная платформа инвестиций в недвижимость, ориентированная на поиск, приобретение и управление жилыми и коммерческими проектами с высоким потенциалом.",
    "ka": "უძრავი ქონების საინვესტიციო პრემიუმ პლატფორმა, რომელიც ორიენტირებულია მაღალი პოტენციალის მქონე საცხოვრებელი და კომერციული პროექტების იდენტიფიკაციაზე, შეძენასა და მართვაზე.",
    "tr": "Yüksek potansiyelli konut ve ticari projeleri belirleme, edinme ve yönetmeye odaklanan seçkin bir gayrimenkul yatırım platformu.",
    "ar": "منصة استثمار عقاري رائدة تركز على تحديد المشاريع السكنية والتجارية عالية الإمكانات والاستحواذ عليها وإدارتها."
  },
  "The business is positioned around value creation through strategic asset selection, operational excellence, redevelopment, and property management.": {
    "de": "Das Unternehmen ist auf Wertschöpfung durch strategische Asset-Auswahl, operative Exzellenz, Neuentwicklung und Immobilienmanagement ausgerichtet.",
    "ru": "Бизнес ориентирован на создание стоимости через стратегический выбор активов, операционное превосходство, редевелопмент и управление недвижимостью.",
    "ka": "ბიზნესი ორიენტირებულია ღირებულების შექმნაზე აქტივების სტრატეგიული შერჩევის, ოპერაციული გამორჩეულობის, რედეველოპმენტის და ქონების მართვის გზით.",
    "tr": "Şirket, stratejik varlık seçimi, operasyonel mükemmeliyet, yeniden geliştirme ve mülk yönetimi yoluyla değer yaratmaya odaklanmıştır.",
    "ar": "تتمحور أعمال الشركة حول خلق القيمة من خلال الاختيار الاستراتيجي للأصول والتميز التشغيلي وإعادة التطوير وإدارة العقارات."
  },
  "View details": {
    "de": "Details ansehen",
    "ru": "Подробнее",
    "ka": "დეტალების ნახვა",
    "tr": "Detayları görüntüle",
    "ar": "عرض التفاصيل"
  },
  "Group companies": {
    "de": "Gruppenunternehmen",
    "ru": "Компании группы",
    "ka": "ჯგუფის კომპანიები",
    "tr": "Grup şirketleri",
    "ar": "شركات المجموعة"
  },
  "Real estate investment and development platform.": {
    "de": "Plattform für Immobilieninvestitionen und -entwicklung.",
    "ru": "Платформа для инвестиций и девелопмента в недвижимости.",
    "ka": "უძრავი ქონების ინვესტირებისა და განვითარების პლატფორმა.",
    "tr": "Gayrimenkul yatırım ve geliştirme platformu.",
    "ar": "منصة للاستثمار والتطوير العقاري."
  },
  "Open profile": {
    "de": "Profil öffnen",
    "ru": "Открыть профиль",
    "ka": "პროფილის გახსნა",
    "tr": "Profili aç",
    "ar": "فتح الملف"
  },
  "Diversified investment and services business.": {
    "de": "Diversifiziertes Investment- und Dienstleistungsgeschäft.",
    "ru": "Диверсифицированный инвестиционный и сервисный бизнес.",
    "ka": "დივერსიფიცირებული საინვესტიციო და მომსახურების ბიზნესი.",
    "tr": "Çeşitlendirilmiş yatırım ve hizmet işletmesi.",
    "ar": "أعمال استثمارية وخدمية متنوعة."
  },
  "Enterprise SaaS and fintech operating platform.": {
    "de": "Betriebsplattform für Enterprise SaaS und Fintech.",
    "ru": "Операционная платформа для корпоративного SaaS и финтеха.",
    "ka": "Enterprise SaaS და ფინტექ ოპერაციული პლატფორმა.",
    "tr": "Kurumsal SaaS ve fintech operasyon platformu.",
    "ar": "منصة تشغيلية لـ SaaS المؤسسي والتقنية المالية."
  },
  "Clean-tech and lithium asset exposure.": {
    "de": "Exposure in Clean-Tech- und Lithium-Assets.",
    "ru": "Экспозиция на clean-tech и литиевые активы.",
    "ka": "კლინტექისა და ლითიუმის აქტივების ექსპოზიცია.",
    "tr": "Temiz teknoloji ve lityum varlıklarına maruz kalım.",
    "ar": "انكشاف على أصول التكنولوجيا النظيفة والليثيوم."
  },
  "Strategic partners": {
    "de": "Strategische Partner",
    "ru": "Стратегические партнеры",
    "ka": "სტრატეგიული პარტნიორები",
    "tr": "Stratejik ortaklar",
    "ar": "الشركاء الاستراتيجيون"
  },
  "DFSA-regulated financial services firm in DIFC.": {
    "de": "Von der DFSA reguliertes Finanzdienstleistungsunternehmen im DIFC.",
    "ru": "Финансовая компания в DIFC, регулируемая DFSA.",
    "ka": "DFSA-ს მიერ რეგულირებული ფინანსური სერვისების კომპანია DIFC-ში.",
    "tr": "DIFC'de DFSA tarafından düzenlenen finansal hizmetler şirketi.",
    "ar": "شركة خدمات مالية خاضعة لتنظيم DFSA في DIFC."
  },
  "Investment and advisory collective for growth businesses.": {
    "de": "Investment- und Beratungskollektiv für Wachstumsunternehmen.",
    "ru": "Инвестиционное и консультационное объединение для растущего бизнеса.",
    "ka": "საინვესტიციო და საკონსულტაციო გაერთიანება ზრდის ბიზნესებისთვის.",
    "tr": "Büyüme odaklı işletmeler için yatırım ve danışmanlık kolektifi.",
    "ar": "مجموعة استثمارية واستشارية للشركات النامية."
  },
  "Financial consultancy focused on planning and advisory.": {
    "de": "Finanzberatung mit Fokus auf Planung und Advisory.",
    "ru": "Финансовый консалтинг, ориентированный на планирование и консультирование.",
    "ka": "ფინანსური საკონსულტაციო კომპანია დაგეგმვასა და რჩევებზე ფოკუსით.",
    "tr": "Planlama ve danışmanlığa odaklanan finansal danışmanlık.",
    "ar": "استشارات مالية تركز على التخطيط والمشورة."
  },
  "Large-scale infrastructure and urban development partner.": {
    "de": "Partner für groß angelegte Infrastruktur- und Stadtentwicklungsprojekte.",
    "ru": "Партнер по крупномасштабной инфраструктуре и городскому развитию.",
    "ka": "მასშტაბური ინფრასტრუქტურისა და ურბანული განვითარების პარტნიორი.",
    "tr": "Büyük ölçekli altyapı ve kentsel gelişim ortağı.",
    "ar": "شريك في البنية التحتية والتطوير الحضري واسع النطاق."
  },
  "Energy & Sustainability": {
    "de": "Energie & Nachhaltigkeit",
    "ru": "Энергия и устойчивость",
    "ka": "ენერგია და მდგრადობა",
    "tr": "Enerji ve Sürdürülebilirlik",
    "ar": "الطاقة والاستدامة"
  },
  "As part of our continued expansion, AIXCO Global is entering the energy sector, focusing on battery storage, solar, and alternative energy solutions that support long-term value creation and global sustainability.": {
    "de": "Im Rahmen unserer weiteren Expansion tritt AIXCO Global in den Energiesektor ein und konzentriert sich auf Batteriespeicherung, Solarenergie und alternative Energielösungen, die langfristige Wertschöpfung und globale Nachhaltigkeit unterstützen.",
    "ru": "В рамках дальнейшего расширения AIXCO Global выходит в энергетический сектор, сосредотачиваясь на накопителях энергии, солнечной и альтернативной энергетике, которые поддерживают долгосрочное создание стоимости и глобальную устойчивость.",
    "ka": "გაფართოების გაგრძელების ფარგლებში, AIXCO Global ენერგეტიკის სექტორში შედის და ფოკუსირდება ბატარეების საცავზე, მზის და ალტერნატიული ენერგიის გადაწყვეტილებებზე, რომლებიც ხელს უწყობს გრძელვადიან ღირებულების შექმნას და გლობალურ მდგრადობას.",
    "tr": "Süregelen büyümemizin bir parçası olarak AIXCO Global, uzun vadeli değer yaratımı ve küresel sürdürülebilirliği destekleyen batarya depolama, güneş ve alternatif enerji çözümlerine odaklanarak enerji sektörüne giriyor.",
    "ar": "كجزء من توسعنا المستمر، تدخل AIXCO Global قطاع الطاقة مع التركيز على تخزين البطاريات والطاقة الشمسية وحلول الطاقة البديلة التي تدعم خلق القيمة على المدى الطويل والاستدامة العالمية."
  },
  "Battery Storage Investments": {
    "de": "Investitionen in Batteriespeicher",
    "ru": "Инвестиции в хранение энергии",
    "ka": "ინვესტიციები ბატარეის საცავებში",
    "tr": "Batarya Depolama Yatırımları",
    "ar": "استثمارات تخزين البطاريات"
  },
  "Battery storage systems are a key component of modern energy infrastructure. They store excess electricity and release it when demand increases, helping stabilize the grid and optimize energy usage.": {
    "de": "Batteriespeichersysteme sind ein zentrales Element moderner Energieinfrastruktur. Sie speichern überschüssigen Strom und geben ihn bei steigender Nachfrage ab, was zur Netzstabilisierung und Optimierung des Energieverbrauchs beiträgt.",
    "ru": "Системы хранения энергии являются ключевым компонентом современной энергетической инфраструктуры. Они накапливают избыточную электроэнергию и отдают ее при росте спроса, помогая стабилизировать сеть и оптимизировать использование энергии.",
    "ka": "ბატარეის საცავის სისტემები თანამედროვე ენერგეტიკული ინფრასტრუქტურის მნიშვნელოვანი ნაწილია. ისინი ინახავენ ზედმეტ ელექტროენერგიას და გამოყოფენ მას მოთხოვნის ზრდისას, რაც ხელს უწყობს ქსელის სტაბილიზაციას და ენერგიის გამოყენების ოპტიმიზაციას.",
    "tr": "Batarya depolama sistemleri modern enerji altyapısının temel bir bileşenidir. Fazla elektriği depolar ve talep arttığında serbest bırakır; böylece şebekenin dengelenmesine ve enerji kullanımının optimize edilmesine yardımcı olur.",
    "ar": "تعد أنظمة تخزين البطاريات عنصرًا أساسيًا في البنية التحتية الحديثة للطاقة. فهي تخزن الكهرباء الزائدة وتطلقها عند زيادة الطلب، مما يساعد على استقرار الشبكة وتحسين استخدام الطاقة."
  },
  "Revenue is generated through grid services and energy trading, offering a combination of stable returns and upside potential while supporting the transition to renewable energy.": {
    "de": "Einnahmen werden durch Netzdienstleistungen und Energiehandel generiert und bieten eine Kombination aus stabilen Renditen und Aufwärtspotenzial, während sie den Übergang zu erneuerbaren Energien unterstützen.",
    "ru": "Доход формируется за счет сетевых услуг и торговли энергией, обеспечивая сочетание стабильной доходности и потенциала роста при поддержке перехода к возобновляемой энергетике.",
    "ka": "შემოსავალი გენერირდება ქსელური სერვისებისა და ენერგიით ვაჭრობის გზით, რაც გვთავაზობს სტაბილური ანაზღაურებისა და ზრდის პოტენციალის კომბინაციას და ამავდროულად მხარს უჭერს განახლებად ენერგიაზე გადასვლას.",
    "tr": "Gelir, şebeke hizmetleri ve enerji ticareti yoluyla elde edilir; bu da yenilenebilir enerjiye geçişi desteklerken istikrarlı getiri ve yukarı yönlü potansiyel kombinasyonu sunar.",
    "ar": "يتم تحقيق الإيرادات من خلال خدمات الشبكة وتداول الطاقة، مما يوفر مزيجًا من العوائد المستقرة وإمكانات النمو مع دعم الانتقال إلى الطاقة المتجددة."
  },
  "Solar & Alternative Energy": {
    "de": "Solar- & alternative Energie",
    "ru": "Солнечная и альтернативная энергия",
    "ka": "მზის და ალტერნატიული ენერგია",
    "tr": "Güneş ve Alternatif Enerji",
    "ar": "الطاقة الشمسية والبديلة"
  },
  "AIXCO Global has interests in solar and alternative energy projects, focusing on scalable and sustainable power generation solutions for different markets.": {
    "de": "AIXCO Global engagiert sich in Solar- und alternativen Energieprojekten und konzentriert sich auf skalierbare und nachhaltige Stromerzeugungslösungen für verschiedene Märkte.",
    "ru": "AIXCO Global заинтересована в проектах солнечной и альтернативной энергетики, сосредотачиваясь на масштабируемых и устойчивых решениях по генерации энергии для различных рынков.",
    "ka": "AIXCO Global დაინტერესებულია მზისა და ალტერნატიული ენერგიის პროექტებით და ფოკუსირდება მასშტაბირებად და მდგრად ენერგოგენერაციის გადაწყვეტილებებზე სხვადასხვა ბაზრისთვის.",
    "tr": "AIXCO Global, farklı pazarlar için ölçeklenebilir ve sürdürülebilir enerji üretim çözümlerine odaklanan güneş ve alternatif enerji projelerinde faaliyet göstermektedir.",
    "ar": "تمتلك AIXCO Global مصالح في مشاريع الطاقة الشمسية والطاقة البديلة، مع التركيز على حلول توليد الطاقة القابلة للتوسع والمستدامة لمختلف الأسواق."
  },
  "By integrating solar systems with energy storage, we enable more efficient use of renewable energy while reducing reliance on traditional power sources and supporting long-term infrastructure development.": {
    "de": "Durch die Integration von Solarsystemen mit Energiespeichern ermöglichen wir eine effizientere Nutzung erneuerbarer Energien, reduzieren die Abhängigkeit von traditionellen Energiequellen und unterstützen die langfristige Infrastrukturentwicklung.",
    "ru": "Интегрируя солнечные системы с накопителями энергии, мы обеспечиваем более эффективное использование возобновляемой энергии, снижая зависимость от традиционных источников и поддерживая долгосрочное развитие инфраструктуры.",
    "ka": "მზის სისტემების ენერგიის საცავთან ინტეგრირებით, ჩვენ განახლებადი ენერგიის უფრო ეფექტურ გამოყენებას ვქმნით, ამცირებთ ტრადიციულ ენერგიის წყაროებზე დამოკიდებულებას და მხარს ვუჭერთ გრძელვადიან ინფრასტრუქტურულ განვითარებას.",
    "tr": "Güneş sistemlerini enerji depolama ile entegre ederek yenilenebilir enerjinin daha verimli kullanılmasını sağlıyor, geleneksel enerji kaynaklarına bağımlılığı azaltıyor ve uzun vadeli altyapı gelişimini destekliyoruz.",
    "ar": "من خلال دمج الأنظمة الشمسية مع تخزين الطاقة، نُمكّن من استخدام أكثر كفاءة للطاقة المتجددة مع تقليل الاعتماد على مصادر الطاقة التقليدية ودعم تطوير البنية التحتية على المدى الطويل."
  },
  "Energy Segments": {
    "de": "Energiesegmente",
    "ru": "Энергетические сегменты",
    "ka": "ენერგეტიკული სეგმენტები",
    "tr": "Enerji Segmentleri",
    "ar": "قطاعات الطاقة"
  },
  "Focus": {
    "de": "Fokus",
    "ru": "Фокус",
    "ka": "ფოკუსი",
    "tr": "Odak",
    "ar": "التركيز"
  },
  "Value Creation": {
    "de": "Wertschöpfung",
    "ru": "Создание стоимости",
    "ka": "ღირებულების შექმნა",
    "tr": "Değer Yaratımı",
    "ar": "خلق القيمة"
  },
  "- Frequently Asked Questions": {
    "de": "- Häufig gestellte Fragen",
    "ru": "- Часто задаваемые вопросы",
    "ka": "- ხშირად დასმული კითხვები",
    "tr": "- Sıkça Sorulan Sorular",
    "ar": "- الأسئلة الشائعة"
  },
  "Customer": {
    "de": "Kunde",
    "ru": "Клиент",
    "ka": "კლიენტი",
    "tr": "Müşteri",
    "ar": "العميل"
  },
  "Buying property or entering selected investment opportunities.": {
    "de": "Immobilien kaufen oder an ausgewählten Investitionsmöglichkeiten teilnehmen.",
    "ru": "Покупка недвижимости или участие в выбранных инвестиционных возможностях.",
    "ka": "ქონების ყიდვა ან შერჩეულ საინვესტიციო შესაძლებლობებში მონაწილეობა.",
    "tr": "Mülk satın almak veya seçilmiş yatırım fırsatlarına katılmak.",
    "ar": "شراء عقار أو الدخول في فرص استثمارية مختارة."
  },
  "What is the minimum investment amount?": {
    "de": "Wie hoch ist der Mindestanlagebetrag?",
    "ru": "Какова минимальная сумма инвестиций?",
    "ka": "რა არის მინიმალური საინვესტიციო თანხა?",
    "tr": "Minimum yatırım tutarı nedir?",
    "ar": "ما هو الحد الأدنى للاستثمار؟"
  },
  "Can I buy property directly?": {
    "de": "Kann ich Immobilien direkt kaufen?",
    "ru": "Могу ли я купить недвижимость напрямую?",
    "ka": "შემიძლია უძრავი ქონების პირდაპირ შეძენა?",
    "tr": "Doğrudan mülk satın alabilir miyim?",
    "ar": "هل يمكنني شراء عقار مباشرة؟"
  },
  "Are returns fixed?": {
    "de": "Sind die Renditen fest?",
    "ru": "Доходность фиксированная?",
    "ka": "მოგება ფიქსირებულია?",
    "tr": "Getiriler sabit mi?",
    "ar": "هل العوائد ثابتة؟"
  },
  "Will I receive reporting?": {
    "de": "Erhalte ich Berichte?",
    "ru": "Буду ли я получать отчеты?",
    "ka": "მივიღებ ანგარიშგებას?",
    "tr": "Raporlama alacak mıyım?",
    "ar": "هل سأتلقى تقارير؟"
  },
  "Can foreigners buy property in Batumi?": {
    "de": "Können Ausländer in Batumi Immobilien kaufen?",
    "ru": "Могут ли иностранцы покупать недвижимость в Батуми?",
    "ka": "შეუძლიათ უცხოელებს ბათუმში ქონების ყიდვა?",
    "tr": "Yabancılar Batum'da mülk satın alabilir mi?",
    "ar": "هل يمكن للأجانب شراء عقار في باتومي؟"
  },
  "Yes. Customers may pursue direct purchase, structured participation, or both.": {
    "de": "Ja. Kunden können einen Direktkauf, strukturierte Beteiligung oder beides wählen.",
    "ru": "Да. Клиенты могут выбрать прямую покупку, структурированное участие или оба варианта.",
    "ka": "დიახ. მომხმარებლებს შეუძლიათ აირჩიონ პირდაპირი შეძენა, სტრუქტურირებული მონაწილეობა ან ორივე.",
    "tr": "Evet. Müşteriler doğrudan satın alma, yapılandırılmış katılım veya her ikisini de tercih edebilir.",
    "ar": "نعم. يمكن للعملاء اختيار الشراء المباشر أو المشاركة المنظمة أو كليهما."
  },
  "No. Returns are performance-based and depend on market conditions and project success.": {
    "de": "Nein. Renditen sind leistungsabhängig und hängen von Marktbedingungen und Projekterfolg ab.",
    "ru": "Нет. Доходность зависит от результатов и рыночных условий, а также от успеха проекта.",
    "ka": "არა. ანაზღაურება დამოკიდებულია შედეგებზე, ბაზრის პირობებსა და პროექტის წარმატებაზე.",
    "tr": "Hayır. Getiriler performansa bağlıdır ve piyasa koşulları ile proje başarısına bağlıdır.",
    "ar": "لا. تعتمد العوائد على الأداء وظروف السوق ونجاح المشروع."
  },
  "Yes. Reporting, documents, and project updates are available through the portal.": {
    "de": "Ja. Berichte, Dokumente und Projekt-Updates sind über das Portal verfügbar.",
    "ru": "Да. Отчеты, документы и обновления проектов доступны через портал.",
    "ka": "დიახ. ანგარიშები, დოკუმენტები და პროექტის განახლებები ხელმისაწვდომია პორტალიდან.",
    "tr": "Evet. Raporlar, belgeler ve proje güncellemeleri portal üzerinden erişilebilir.",
    "ar": "نعم. التقارير والمستندات وتحديثات المشاريع متاحة عبر البوابة."
  },
  "Yes. Foreigners can purchase and own real estate with minimal restrictions.": {
    "de": "Ja. Ausländer können Immobilien mit minimalen Einschränkungen erwerben und besitzen.",
    "ru": "Да. Иностранцы могут покупать и владеть недвижимостью с минимальными ограничениями.",
    "ka": "დიახ. უცხოელებს შეუძლიათ უძრავი ქონების შეძენა და ფლობა მინიმალური შეზღუდვებით.",
    "tr": "Evet. Yabancılar, asgari kısıtlamalarla gayrimenkul satın alabilir ve sahip olabilir.",
    "ar": "نعم. يمكن للأجانب شراء العقارات وامتلاكها مع قيود محدودة."
  },
  "For intermediaries managing clients, tours, and deal flow.": {
    "de": "Für Vermittler, die Kunden, Besichtigungen und Dealflow verwalten.",
    "ru": "Для посредников, управляющих клиентами, турами и потоком сделок.",
    "ka": "შუამავლებისთვის, რომლებიც მართავენ კლიენტებს, ტურებს და გარიგებებს.",
    "tr": "Müşterileri, turları ve işlem akışını yöneten aracılar için.",
    "ar": "للوسطاء الذين يديرون العملاء والجولات وتدفق الصفقات."
  },
  "What are the benefits for brokers?": {
    "de": "Welche Vorteile haben Makler?",
    "ru": "Каковы преимущества для брокеров?",
    "ka": "რა სარგებელი აქვთ ბროკერებს?",
    "tr": "Brokerler için avantajlar nelerdir?",
    "ar": "ما هي الفوائد للوسطاء؟"
  },
  "Brokers gain structured client management, curated listings, stronger presentation tools, and better coordination.": {
    "de": "Makler erhalten strukturierte Kundenverwaltung, kuratierte Angebote, stärkere Präsentationstools und bessere Koordination.",
    "ru": "Брокеры получают структурированное управление клиентами, отобранные объекты, более сильные инструменты презентации и лучшую координацию.",
    "ka": "ბროკერები იღებენ სტრუქტურირებულ კლიენტთა მართვას, შერჩეულ ჩამონათვალებს, ძლიერ პრეზენტაციის ხელსაწყოებს და უკეთეს კოორდინაციას.",
    "tr": "Brokerler yapılandırılmış müşteri yönetimi, seçilmiş ilanlar, daha güçlü sunum araçları ve daha iyi koordinasyon elde eder.",
    "ar": "يحصل الوسطاء على إدارة منظمة للعملاء وقوائم منتقاة وأدوات عرض أقوى وتنسيق أفضل."
  },
  "Can I book a tour for my customer?": {
    "de": "Kann ich für meinen Kunden eine Besichtigung buchen?",
    "ru": "Могу ли я забронировать тур для клиента?",
    "ka": "შემიძლია კლიენტისთვის ტურის დაჯავშნა?",
    "tr": "Müşterim için tur rezervasyonu yapabilir miyim?",
    "ar": "هل يمكنني حجز جولة لعميل؟"
  },
  "Yes. The platform supports tour coordination and a smoother customer journey.": {
    "de": "Ja. Die Plattform unterstützt die Koordination von Besichtigungen und eine reibungslosere Kundenreise.",
    "ru": "Да. Платформа поддерживает координацию туров и более плавный путь клиента.",
    "ka": "დიახ. პლატფორმა ხელს უწყობს ტურების კოორდინაციას და უფრო გლუვ კლიენტურ გზას.",
    "tr": "Evet. Platform, tur koordinasyonunu ve daha akıcı bir müşteri yolculuğunu destekler.",
    "ar": "نعم. تدعم المنصة تنسيق الجولات وتجربة عميل أكثر سلاسة."
  },
  "Do login and registration do different things?": {
    "de": "Machen Login und Registrierung unterschiedliche Dinge?",
    "ru": "Вход и регистрация выполняют разные функции?",
    "ka": "შესვლა და რეგისტრაცია სხვადასხვა რამეს აკეთებს?",
    "tr": "Giriş ve kayıt farklı işler mi yapıyor?",
    "ar": "هل يقوم تسجيل الدخول والتسجيل بأشياء مختلفة؟"
  },
  "Yes. Login opens the relevant portal. Register starts the onboarding process for access approval.": {
    "de": "Ja. Login öffnet das jeweilige Portal. Die Registrierung startet den Onboarding-Prozess zur Zugangsfreigabe.",
    "ru": "Да. Вход открывает соответствующий портал. Регистрация запускает процесс онбординга для получения доступа.",
    "ka": "დიახ. შესვლა ხსნის შესაბამის პორტალს. რეგისტრაცია იწყებს წვდომის დასამტკიცებელ ონბორდინგ პროცესს.",
    "tr": "Evet. Giriş ilgili portalı açar. Kayıt, erişim onayı için onboarding sürecini başlatır.",
    "ar": "نعم. يفتح تسجيل الدخول البوابة المناسبة. ويبدأ التسجيل عملية الإعداد للموافقة على الوصول."
  },
  "What support is available after sign-up?": {
    "de": "Welche Unterstützung gibt es nach der Anmeldung?",
    "ru": "Какая поддержка доступна после регистрации?",
    "ka": "რეგისტრაციის შემდეგ რა მხარდაჭერაა ხელმისაწვდომი?",
    "tr": "Kayıttan sonra hangi destek sağlanır?",
    "ar": "ما الدعم المتاح بعد التسجيل؟"
  },
  "AIXCO provides follow-up support, coordination, and a more guided service model rather than simple self-service.": {
    "de": "AIXCO bietet Nachbetreuung, Koordination und ein stärker geführtes Servicemodell statt einfachem Self-Service.",
    "ru": "AIXCO предоставляет последующую поддержку, координацию и более управляемую модель сервиса вместо простого самообслуживания.",
    "ka": "AIXCO უზრუნველყოფს შემდგომ მხარდაჭერას, კოორდინაციას და უფრო მეტად მართულ სერვის მოდელს, ვიდრე უბრალო თვითმომსახურება.",
    "tr": "AIXCO, basit self-servis yerine takip desteği, koordinasyon ve daha yönlendirmeli bir hizmet modeli sunar.",
    "ar": "توفر AIXCO دعم متابعة وتنسيقًا ونموذج خدمة أكثر توجيهًا بدلًا من الخدمة الذاتية البسيطة."
  },
  "For developers listing projects and using AIXCO as a sales channel.": {
    "de": "Für Entwickler, die Projekte listen und AIXCO als Vertriebskanal nutzen.",
    "ru": "Для девелоперов, размещающих проекты и использующих AIXCO как канал продаж.",
    "ka": "დეველოპერებისთვის, რომლებიც აქვეყნებენ პროექტებს და იყენებენ AIXCO-ს როგორც გაყიდვების არხს.",
    "tr": "Projelerini listeleyen ve AIXCO'yu satış kanalı olarak kullanan geliştiriciler için.",
    "ar": "للمطورين الذين يعرضون المشاريع ويستخدمون AIXCO كقناة مبيعات."
  },
  "What do developers gain by registering?": {
    "de": "Was gewinnen Entwickler durch die Registrierung?",
    "ru": "Что получают девелоперы при регистрации?",
    "ka": "რას იღებენ დეველოპერები რეგისტრაციით?",
    "tr": "Geliştiriciler kayıt olarak ne kazanır?",
    "ar": "ماذا يستفيد المطورون من التسجيل؟"
  },
  "Developers gain stronger project exposure, better inquiry handling, coordinated tours, and a more premium end-to-end sales flow.": {
    "de": "Entwickler erhalten stärkere Projektsichtbarkeit, bessere Bearbeitung von Anfragen, koordinierte Besichtigungen und einen hochwertigeren End-to-End-Vertriebsprozess.",
    "ru": "Девелоперы получают более сильную видимость проектов, лучшую обработку запросов, координированные туры и более премиальный сквозной процесс продаж.",
    "ka": "დეველოპერები იღებენ პროექტების უფრო ძლიერ ექსპოზიციას, უკეთეს მოთხოვნების მართვას, კოორდინირებულ ტურებს და უფრო პრემიუმ გაყიდვების სრულ ციკლს.",
    "tr": "Geliştiriciler daha güçlü proje görünürlüğü, daha iyi talep yönetimi, koordine turlar ve daha premium uçtan uca satış akışı elde eder.",
    "ar": "يحصل المطورون على عرض أقوى للمشاريع ومعالجة أفضل للاستفسارات وجولات منسقة وتدفق مبيعات أكثر تميزًا من البداية إلى النهاية."
  },
  "Can AIXCO help distribute projects?": {
    "de": "Kann AIXCO bei der Projektvermarktung helfen?",
    "ru": "Может ли AIXCO помочь с дистрибуцией проектов?",
    "ka": "შეუძლია თუ არა AIXCO-ს პროექტების გავრცელებაში დახმარება?",
    "tr": "AIXCO projelerin dağıtımına yardımcı olabilir mi?",
    "ar": "هل يمكن لـ AIXCO المساعدة في توزيع المشاريع؟"
  },
  "Yes. AIXCO can function as a structured distribution and presentation channel for selected listings.": {
    "de": "Ja. AIXCO kann als strukturierter Vertriebs- und Präsentationskanal für ausgewählte Projekte fungieren.",
    "ru": "Да. AIXCO может выступать как структурированный канал дистрибуции и презентации для выбранных объектов.",
    "ka": "დიახ. AIXCO შეუძლია იმოქმედოს როგორც სტრუქტურირებული დისტრიბუციისა და პრეზენტაციის არხი შერჩეული ჩამონათვალებისთვის.",
    "tr": "Evet. AIXCO, seçilmiş ilanlar için yapılandırılmış bir dağıtım ve sunum kanalı olarak işlev görebilir.",
    "ar": "نعم. يمكن أن تعمل AIXCO كقناة منظمة للتوزيع والعرض للمشاريع المختارة."
  },
  "Does AIXCO support the sales process?": {
    "de": "Unterstützt AIXCO den Verkaufsprozess?",
    "ru": "Поддерживает ли AIXCO процесс продаж?",
    "ka": "უჭერს თუ არა AIXCO მხარს გაყიდვების პროცესს?",
    "tr": "AIXCO satış sürecini destekliyor mu?",
    "ar": "هل تدعم AIXCO عملية البيع؟"
  },
  "Yes. Support can include project visibility, lead handling, tours, and documentation flow.": {
    "de": "Ja. Die Unterstützung kann Projektsichtbarkeit, Lead-Handling, Besichtigungen und Dokumentenfluss umfassen.",
    "ru": "Да. Поддержка может включать видимость проекта, обработку лидов, туры и документооборот.",
    "ka": "დიახ. მხარდაჭერა შეიძლება მოიცავდეს პროექტის ხილვადობას, ლიდების მართვას, ტურებს და დოკუმენტების ნაკადს.",
    "tr": "Evet. Destek; proje görünürlüğü, lead yönetimi, turlar ve dokümantasyon akışını içerebilir.",
    "ar": "نعم. قد يشمل الدعم ظهور المشروع وإدارة العملاء المحتملين والجولات وتدفق الوثائق."
  },
  "Register Now": {
    "de": "Jetzt registrieren",
    "ru": "Зарегистрироваться",
    "ka": "დარეგისტრირდით ახლა",
    "tr": "Hemen Kayıt Ol",
    "ar": "سجل الآن"
  },
  "Call AIXCO": {
    "de": "AIXCO anrufen",
    "ru": "Позвонить в AIXCO",
    "ka": "დაურეკეთ AIXCO-ს",
    "tr": "AIXCO'yu Ara",
    "ar": "اتصل بـ AIXCO"
  },
  "your participation in Global real estate opportunities": {
    "de": "Ihre Beteiligung an globalen Immobilienchancen",
    "ru": "ваше участие в глобальных возможностях недвижимости",
    "ka": "თქვენი მონაწილეობა გლობალური უძრავი ქონების შესაძლებლობებში",
    "tr": "küresel gayrimenkul fırsatlarına katılımınızı",
    "ar": "مشاركتك في فرص العقارات العالمية"
  },
  "Register with us now, and start participating in exclusive real estate opportunities from €1,000.": {
    "de": "Registrieren Sie sich jetzt bei uns und beginnen Sie Ihre Teilnahme an exklusiven Immobilienchancen ab 1.000 €.",
    "ru": "Зарегистрируйтесь у нас сейчас и начните участвовать в эксклюзивных возможностях недвижимости от 1 000 €.",
    "ka": "დარეგისტრირდით ჩვენთან ახლავე და დაიწყეთ მონაწილეობა ექსკლუზიურ უძრავი ქონების შესაძლებლობებში 1,000 ევროდან.",
    "tr": "Şimdi bize kaydolun ve 1.000 €'dan başlayan seçkin gayrimenkul fırsatlarına katılmaya başlayın.",
    "ar": "سجل معنا الآن وابدأ المشاركة في فرص عقارية حصرية تبدأ من 1,000 يورو."
  },
  "Contact AIXCO": {
    "de": "AIXCO kontaktieren",
    "ru": "Связаться с AIXCO",
    "ka": "დაუკავშირდით AIXCO-ს",
    "tr": "AIXCO ile İletişime Geç",
    "ar": "تواصل مع AIXCO"
  },
  "Login to your AIXCO portal": {
    "de": "Melden Sie sich bei Ihrem AIXCO-Portal an",
    "ru": "Войдите в ваш портал AIXCO",
    "ka": "შედით თქვენს AIXCO პორტალში",
    "tr": "AIXCO portalınıza giriş yapın",
    "ar": "سجّل الدخول إلى بوابة AIXCO الخاصة بك"
  },
  "Login takes each user type to its respective portal so customers, brokers, and developers can continue in the right environment immediately.": {
    "de": "Der Login führt jeden Benutzertyp in das jeweilige Portal, sodass Kunden, Makler und Entwickler sofort in der richtigen Umgebung fortfahren können.",
    "ru": "Вход направляет каждый тип пользователя в соответствующий портал, чтобы клиенты, брокеры и девелоперы могли сразу продолжить работу в нужной среде.",
    "ka": "შესვლა თითოეულ მომხმარებლის ტიპს შესაბამის პორტალში გადაჰყავს, რათა კლიენტებმა, ბროკერებმა და დეველოპერებმა დაუყოვნებლივ სწორ გარემოში გააგრძელონ მუშაობა.",
    "tr": "Giriş, her kullanıcı tipini ilgili portalına yönlendirir; böylece müşteriler, brokerler ve geliştiriciler doğru ortamda hemen devam edebilir.",
    "ar": "ينقل تسجيل الدخول كل نوع من المستخدمين إلى البوابة الخاصة به حتى يتمكن العملاء والوسطاء والمطورون من المتابعة فورًا في البيئة الصحيحة."
  },
  "Customer Login": {
    "de": "Kunden-Login",
    "ru": "Вход для клиентов",
    "ka": "კლიენტის შესვლა",
    "tr": "Müşteri Girişi",
    "ar": "دخول العميل"
  },
  "Broker Login": {
    "de": "Makler-Login",
    "ru": "Вход для брокеров",
    "ka": "ბროკერის შესვლა",
    "tr": "Broker Girişi",
    "ar": "دخول الوسيط"
  },
  "Developer Login": {
    "de": "Entwickler-Login",
    "ru": "Вход для девелопера",
    "ka": "დეველოპერის შესვლა",
    "tr": "Geliştirici Girişi",
    "ar": "دخول المطور"
  },
  "Continue as customer": {
    "de": "Als Kunde fortfahren",
    "ru": "Продолжить как клиент",
    "ka": "გაგრძელება როგორც კლიენტი",
    "tr": "Müşteri olarak devam et",
    "ar": "المتابعة كعميل"
  },
  "Continue as broker": {
    "de": "Als Makler fortfahren",
    "ru": "Продолжить как брокер",
    "ka": "გაგრძელება როგორც ბროკერი",
    "tr": "Broker olarak devam et",
    "ar": "المتابعة كوسيط"
  },
  "Continue as developer": {
    "de": "Als Entwickler fortfahren",
    "ru": "Продолжить как девелопер",
    "ka": "გაგრძელება როგორც დეველოპერი",
    "tr": "Geliştirici olarak devam et",
    "ar": "المتابعة كمطور"
  },
  "Register with AIXCO": {
    "de": "Bei AIXCO registrieren",
    "ru": "Зарегистрироваться в AIXCO",
    "ka": "დარეგისტრირდით AIXCO-ში",
    "tr": "AIXCO'ya Kayıt Ol",
    "ar": "سجّل في AIXCO"
  },
  "Register opens the relevant onboarding form for each role so the right information can be submitted before portal access is activated.": {
    "de": "Die Registrierung öffnet für jede Rolle das passende Onboarding-Formular, damit die richtigen Informationen vor der Freischaltung des Portalzugangs eingereicht werden können.",
    "ru": "Регистрация открывает соответствующую форму онбординга для каждой роли, чтобы до активации доступа к порталу можно было подать нужную информацию.",
    "ka": "რეგისტრაცია თითოეული როლისთვის შესაბამის ონბორდინგის ფორმას ხსნის, რათა პორტალზე წვდომის აქტივაციამდე სწორად იყოს წარდგენილი საჭირო ინფორმაცია.",
    "tr": "Kayıt, her rol için ilgili onboarding formunu açar; böylece portal erişimi etkinleştirilmeden önce doğru bilgiler gönderilebilir.",
    "ar": "يفتح التسجيل نموذج الإعداد المناسب لكل دور حتى يمكن إرسال المعلومات الصحيحة قبل تفعيل الوصول إلى البوابة."
  },
  "Register as Customer": {
    "de": "Als Kunde registrieren",
    "ru": "Зарегистрироваться как клиент",
    "ka": "დარეგისტრირდით როგორც კლიენტი",
    "tr": "Müşteri olarak kaydol",
    "ar": "سجل كعميل"
  },
  "Register as Broker": {
    "de": "Als Makler registrieren",
    "ru": "Зарегистрироваться как брокер",
    "ka": "დარეგისტრირდით როგორც ბროკერი",
    "tr": "Broker olarak kaydol",
    "ar": "سجل كوسيط"
  },
  "Join as Developer Partner": {
    "de": "Als Entwicklerpartner beitreten",
    "ru": "Присоединиться как партнер-девелопер",
    "ka": "შემოუერთდით როგორც დეველოპერი პარტნიორი",
    "tr": "Geliştirici Ortağı olarak katıl",
    "ar": "انضم كشريك مطور"
  },
  "Why become a customer?": {
    "de": "Warum Kunde werden?",
    "ru": "Почему стать клиентом?",
    "ka": "რატომ გახდეთ კლიენტი?",
    "tr": "Neden müşteri olmalısınız?",
    "ar": "لماذا تصبح عميلاً؟"
  },
  "Register as a customer if you want to buy property, explore selected opportunities, or receive a more guided route into Batumi through one organized onboarding form.": {
    "de": "Registrieren Sie sich als Kunde, wenn Sie Immobilien kaufen, ausgewählte Möglichkeiten erkunden oder über ein organisiertes Onboarding einen stärker geführten Einstieg in Batumi erhalten möchten.",
    "ru": "Зарегистрируйтесь как клиент, если хотите купить недвижимость, изучить выбранные возможности или получить более управляемый путь в Батуми через одну организованную форму онбординга.",
    "ka": "დარეგისტრირდით როგორც კლიენტი, თუ გსურთ ქონების ყიდვა, შერჩეული შესაძლებლობების გაცნობა ან უფრო მართული გზა ბათუმში ერთიანი ონბორდინგის ფორმის მეშვეობით.",
    "tr": "Mülk satın almak, seçilmiş fırsatları keşfetmek veya Batum'a daha yönlendirmeli bir geçiş yapmak istiyorsanız müşteri olarak kaydolun.",
    "ar": "سجل كعميل إذا كنت ترغب في شراء عقار أو استكشاف فرص مختارة أو الحصول على مسار أكثر توجيهًا إلى باتومي من خلال نموذج إعداد منظم واحد."
  },
  "Submit your interest and onboarding details digitally": {
    "de": "Reichen Sie Ihr Interesse und Ihre Onboarding-Daten digital ein",
    "ru": "Отправьте интерес и данные онбординга в цифровом виде",
    "ka": "ციფრულად გაგზავნეთ თქვენი ინტერესი და ონბორდინგის დეტალები",
    "tr": "İlginizi ve onboarding bilgilerinizi dijital olarak gönderin",
    "ar": "أرسل اهتمامك وبيانات الإعداد رقميًا"
  },
  "Access support for buying property or joining opportunities": {
    "de": "Erhalten Sie Unterstützung beim Immobilienkauf oder bei Beteiligungen",
    "ru": "Получите поддержку при покупке недвижимости или присоединении к возможностям",
    "ka": "მიიღეთ მხარდაჭერა ქონების შეძენის ან შესაძლებლობებში ჩართვისთვის",
    "tr": "Mülk satın alma veya fırsatlara katılım için destek alın",
    "ar": "احصل على دعم لشراء عقار أو الانضمام إلى الفرص"
  },
  "Move into a guided 360° customer journey": {
    "de": "Wechseln Sie in eine geführte 360°-Kundenreise",
    "ru": "Перейдите к управляемому клиентскому пути 360°",
    "ka": "გადადით მართულ 360° მომხმარებლის გზაზე",
    "tr": "Yönlendirmeli 360° müşteri yolculuğuna geçin",
    "ar": "انتقل إلى رحلة عميل موجهة بزاوية 360°"
  },
  "Start customer registration": {
    "de": "Kundenregistrierung starten",
    "ru": "Начать регистрацию клиента",
    "ka": "დაიწყეთ კლიენტის რეგისტრაცია",
    "tr": "Müşteri kaydını başlat",
    "ar": "ابدأ تسجيل العميل"
  },
  "Why become a broker?": {
    "de": "Warum Makler werden?",
    "ru": "Почему стать брокером?",
    "ka": "რატომ გახდეთ ბროკერი?",
    "tr": "Neden broker olmalısınız?",
    "ar": "لماذا تصبح وسيطًا؟"
  },
  "Register as a broker to use the AIXCO portal and services for customer tours, curated support, and stronger access to selected and exclusive listings.": {
    "de": "Registrieren Sie sich als Makler, um das AIXCO-Portal und die Services für Kundentouren, kuratierte Unterstützung und stärkeren Zugang zu ausgewählten und exklusiven Angeboten zu nutzen.",
    "ru": "Зарегистрируйтесь как брокер, чтобы использовать портал и сервисы AIXCO для туров клиентов, кураторской поддержки и более сильного доступа к выбранным и эксклюзивным объектам.",
    "ka": "დარეგისტრირდით როგორც ბროკერი, რათა გამოიყენოთ AIXCO-ს პორტალი და სერვისები კლიენტური ტურებისთვის, შერჩეული მხარდაჭერისა და ექსკლუზიურ ჩამონათვალებზე უკეთესი წვდომისთვის.",
    "tr": "Müşteri turları, seçilmiş destek ve seçilmiş/özel ilanlara daha güçlü erişim için AIXCO portalı ve hizmetlerini kullanmak üzere broker olarak kaydolun.",
    "ar": "سجل كوسيط لاستخدام بوابة وخدمات AIXCO لجولات العملاء والدعم المنتقى والوصول الأقوى إلى القوائم المختارة والحصرية."
  },
  "Use the portal to support active client workflows": {
    "de": "Nutzen Sie das Portal zur Unterstützung aktiver Kundenprozesse",
    "ru": "Используйте портал для поддержки активных клиентских процессов",
    "ka": "გამოიყენეთ პორტალი აქტიური კლიენტური სამუშაო ნაკადების მხარდასაჭერად",
    "tr": "Aktif müşteri iş akışlarını desteklemek için portalı kullanın",
    "ar": "استخدم البوابة لدعم سير عمل العملاء النشط"
  },
  "Arrange tours and customer servicing more smoothly": {
    "de": "Organisieren Sie Touren und Kundenservice reibungsloser",
    "ru": "Организуйте туры и обслуживание клиентов более плавно",
    "ka": "უფრო მარტივად მოაწყვეთ ტურები და კლიენტური მომსახურება",
    "tr": "Turları ve müşteri hizmetlerini daha sorunsuz yönetin",
    "ar": "رتب الجولات وخدمة العملاء بسلاسة أكبر"
  },
  "Offer curated and exclusive listing access": {
    "de": "Bieten Sie kuratierten und exklusiven Angebotszugang",
    "ru": "Предлагайте доступ к отобранным и эксклюзивным объектам",
    "ka": "შესთავაზეთ შერჩეულ და ექსკლუზიურ ჩამონათვალებზე წვდომა",
    "tr": "Seçilmiş ve özel ilan erişimi sunun",
    "ar": "قدم وصولاً إلى قوائم منتقاة وحصرية"
  },
  "Start broker registration": {
    "de": "Maklerregistrierung starten",
    "ru": "Начать регистрацию брокера",
    "ka": "დაიწყეთ ბროკერის რეგისტრაცია",
    "tr": "Broker kaydını başlat",
    "ar": "ابدأ تسجيل الوسيط"
  },
  "Why become a developer partner?": {
    "de": "Warum Entwicklerpartner werden?",
    "ru": "Почему стать партнером-девелопером?",
    "ka": "რატომ გახდეთ დეველოპერი პარტნიორი?",
    "tr": "Neden geliştirici ortağı olmalısınız?",
    "ar": "لماذا تصبح شريكًا مطورًا؟"
  },
  "Register as a developer partner to advertise listings through AIXCO while ensuring end customers still experience a full 360° service from first inquiry onward.": {
    "de": "Registrieren Sie sich als Entwicklerpartner, um Angebote über AIXCO zu bewerben und gleichzeitig sicherzustellen, dass Endkunden ab der ersten Anfrage einen vollständigen 360°-Service erhalten.",
    "ru": "Зарегистрируйтесь как партнер-девелопер, чтобы рекламировать объекты через AIXCO и при этом обеспечивать конечным клиентам полный сервис 360° с первого запроса.",
    "ka": "დარეგისტრირდით როგორც დეველოპერი პარტნიორი, რათა გაავრცელოთ ჩამონათვალები AIXCO-ს მეშვეობით და ამავე დროს უზრუნველყოთ, რომ საბოლოო მომხმარებელმა პირველი მოთხოვნიდანვე სრული 360° სერვისი მიიღოს.",
    "tr": "İlanları AIXCO üzerinden tanıtmak ve son müşterilerin ilk talepten itibaren tam 360° hizmet deneyimi yaşamasını sağlamak için geliştirici ortağı olarak kaydolun.",
    "ar": "سجل كشريك مطور للإعلان عن القوائم عبر AIXCO مع ضمان أن العملاء النهائيين ما زالوا يحصلون على خدمة كاملة بزاوية 360° من أول استفسار."
  },
  "Advertise listings within a stronger branded environment": {
    "de": "Bewerben Sie Angebote in einem stärkeren Markenauftritt",
    "ru": "Продвигайте объекты в более сильной брендированной среде",
    "ka": "რეკლამა გაუწიეთ ჩამონათვალებს უფრო ძლიერი ბრენდირებული გარემოს ფარგლებში",
    "tr": "İlanları daha güçlü markalı bir ortamda tanıtın",
    "ar": "اعرض القوائم ضمن بيئة علامة تجارية أقوى"
  },
  "Benefit from customer-facing sales and support flow": {
    "de": "Profitieren Sie von kundenorientiertem Vertrieb und Support",
    "ru": "Получайте выгоду от ориентированного на клиента продажного и сервисного потока",
    "ka": "ისარგებლეთ მომხმარებელზე ორიენტირებული გაყიდვებისა და მხარდაჭერის ნაკადით",
    "tr": "Müşteri odaklı satış ve destek akışından yararlanın",
    "ar": "استفد من تدفق المبيعات والدعم الموجّه للعملاء"
  },
  "Keep the experience complete from inquiry to follow-up": {
    "de": "Halten Sie das Erlebnis vom Erstkontakt bis zur Nachverfolgung vollständig",
    "ru": "Сохраняйте полный цикл обслуживания от запроса до последующего сопровождения",
    "ka": "შეინარჩუნეთ სრული გამოცდილება მოთხოვნიდან შემდგომ კომუნიკაციამდე",
    "tr": "Deneyimi ilk talepten takibe kadar eksiksiz tutun",
    "ar": "حافظ على التجربة مكتملة من الاستفسار إلى المتابعة"
  },
  "Start developer onboarding": {
    "de": "Entwickler-Onboarding starten",
    "ru": "Начать онбординг девелопера",
    "ka": "დაიწყეთ დეველოპერის ონბორდინგი",
    "tr": "Geliştirici onboardingini başlat",
    "ar": "ابدأ إعداد المطور"
  },
  "Guru": {
    "de": "Guru",
    "ru": "Guru",
    "ka": "Guru",
    "tr": "Guru",
    "ar": "Guru"
  },
  "Otium": {
    "de": "Otium",
    "ru": "Otium",
    "ka": "Otium",
    "tr": "Otium",
    "ar": "Otium"
  }
} as const;

export const attributeTranslations = {
  "title": {
    "AIXCO.Global | Quality Real Estate Participation": {
      "de": "AIXCO.Global | Hochwertige Immobilienbeteiligung",
      "ru": "AIXCO.Global | Качественное участие в недвижимости",
      "ka": "AIXCO.Global | გლობალური უძრავი ქონების მონაწილეობა",
      "tr": "AIXCO.Global | Nitelikli Gayrimenkul Katılımı",
      "ar": "AIXCO.Global | مشاركة عقارية عالية الجودة"
    }
  },
  "content": {
    "Participate in selected Batumi real estate projects starting from €1,000. Transparent structure, euro-based pricing, and long-term value creation.": {
      "de": "Beteiligen Sie sich an ausgewählten Immobilienprojekten in Batumi ab 1.000 €. Transparente Struktur, eurobasierte Preisgestaltung und langfristige Wertschöpfung.",
      "ru": "Участвуйте в выбранных проектах недвижимости в Батуми от 1 000 €. Прозрачная структура, цены в евро и долгосрочное создание стоимости.",
      "ka": "მიიღეთ მონაწილეობა ბათუმის შერჩეულ უძრავი ქონების პროექტებში 1,000 ევროდან. გამჭვირვალე სტრუქტურა, ევროზე დაფუძნებული ფასები და გრძელვადიანი ღირებულების შექმნა.",
      "tr": "Batum'daki seçilmiş gayrimenkul projelerine 1.000 €'dan başlayarak katılın. Şeffaf yapı, euro bazlı fiyatlandırma ve uzun vadeli değer yaratımı.",
      "ar": "شارك في مشاريع عقارية مختارة في باتومي بدءًا من 1,000 يورو. هيكل شفاف، وتسعير قائم على اليورو، وخلق قيمة طويلة الأجل."
    }
  },
  "placeholder": {
    "Name*": {
      "de": "Name*",
      "ru": "Имя*",
      "ka": "სახელი*",
      "tr": "Ad*",
      "ar": "الاسم*"
    },
    "Email*": {
      "de": "E-Mail*",
      "ru": "Эл. почта*",
      "ka": "ელფოსტა*",
      "tr": "E-posta*",
      "ar": "البريد الإلكتروني*"
    },
    "Participation interest": {
      "de": "Interesse an Teilnahme",
      "ru": "Интерес к участию",
      "ka": "მონაწილეობის ინტერესი",
      "tr": "Katılım ilgisi",
      "ar": "اهتمام بالمشاركة"
    },
    "Message*": {
      "de": "Nachricht*",
      "ru": "Сообщение*",
      "ka": "შეტყობინება*",
      "tr": "Mesaj*",
      "ar": "الرسالة*"
    }
  },
  "value": {}
} as const;
