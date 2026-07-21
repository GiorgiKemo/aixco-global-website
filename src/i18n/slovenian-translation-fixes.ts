import type { Lang } from "./languages";

type SlovenianTranslationFix = Partial<Record<Lang, string>>;

/**
 * Human-reviewed Slovenian copy for the most visible customer journeys.
 *
 * This intentionally sits above the generated Slovenian catalog: machine
 * translation gives us broad coverage, while these overrides protect brand
 * names, commercial figures, calls to action, and natural Slovenian phrasing.
 */
export const slovenianTranslationFixes = {
  // Navigation and calls to action
  "Home": { sl: "Domov" },
  "About AIXCO": { sl: "O podjetju AIXCO" },
  "Our journey": { sl: "Naša pot" },
  "Dubai": { sl: "Dubaj" },
  "Batumi": { sl: "Batumi" },
  "Download Materials": { sl: "Prenesite gradiva" },
  "How to work with AIXCO": { sl: "Kako sodelovati z AIXCO" },
  "How AIXCO Works": { sl: "Kako deluje AIXCO" },
  "Our Team": { sl: "Naša ekipa" },
  "Partners": { sl: "Partnerji" },
  "FAQs": { sl: "Pogosta vprašanja" },
  "Contact": { sl: "Kontakt" },
  "AIXCO Philosophy": { sl: "Filozofija AIXCO" },
  "More": { sl: "Več" },
  "Login": { sl: "Prijava" },
  "Register": { sl: "Registrirajte se" },
  "Explore opportunities": { sl: "Raziščite priložnosti" },
  "Contact AIXCO": { sl: "Kontaktirajte AIXCO" },
  "About": { sl: "O nas" },
  "Philosophy": { sl: "Filozofija" },
  "Origins": { sl: "Začetki" },
  "Principles": { sl: "Načela" },
  "Risk": { sl: "Tveganje" },
  "Objectives": { sl: "Cilji" },
  "Access": { sl: "Dostop" },
  "Legacy": { sl: "Dediščina" },
  "Opportunities": { sl: "Priložnosti" },
  "How to work": { sl: "Kako sodelovati" },
  "Journeys": { sl: "Poti sodelovanja" },
  "Company": { sl: "Podjetje" },
  "Team": { sl: "Ekipa" },
  "Explore": { sl: "Raziščite" },
  "Current project": { sl: "Trenutni projekt" },
  "REGISTER": { sl: "REGISTRIRAJTE SE" },
  "CONTACT ME": { sl: "KONTAKTIRAJTE ME" },
  "EXPLORE OPPORTUNITIES": { sl: "RAZIŠČITE PRILOŽNOSTI" },
  "Schedule a Call": { sl: "Dogovorite se za klic" },
  "Send an Email": { sl: "Pošljite e-pošto" },
  "Email": { sl: "E-pošta" },
  "Submit": { sl: "Pošlji" },
  "Sending...": { sl: "Pošiljanje ..." },
  "Download": { sl: "Prenesi" },
  "Download brochure": { sl: "Prenesite brošuro" },
  "Reverance Brochure": { sl: "Brošura Reverance" },
  "Projects": { sl: "Projekti" },
  "CURRENT PROJECT IN BATUMI": { sl: "TRENUTNI PROJEKT V BATUMIJU" },
  "Current project image gallery": { sl: "Galerija trenutnega projekta" },
  "Select current project image": { sl: "Izberite sliko trenutnega projekta" },
  "Reverance exterior project render": { sl: "Vizualizacija zunanjosti projekta Reverance" },
  "Reverance residential towers project render": { sl: "Vizualizacija stanovanjskih stolpnic Reverance" },
  "Reverance courtyard and pool project render": { sl: "Vizualizacija dvorišča in bazena Reverance" },
  "Reverance arrival and landscaped exterior project render": { sl: "Vizualizacija prihoda in urejene okolice Reverance" },
  "Enter your contact details to download the brochure.": { sl: "Vnesite svoje kontaktne podatke za prenos brošure." },
  "Country code": { sl: "Klicna številka države" },
  "Your brochure is ready.": { sl: "Vaša brošura je pripravljena." },
  "Your download should begin automatically. You can also use the button below.": { sl: "Prenos bi se moral začeti samodejno. Uporabite lahko tudi spodnji gumb." },
  "AIXCO.GLOBAL home": { sl: "Domov na AIXCO.GLOBAL" },

  // Homepage story and primary positioning
  "Global Real Estate": { sl: "Globalne nepremičnine" },
  "Emerging Market Opportunities": { sl: "Priložnosti na nastajajočih trgih" },
  "Emerging Market Opportunities with AIXCO": { sl: "Priložnosti na nastajajočih trgih z AIXCO" },
  "Own property in some of the world's fastest-growing destinations.": {
    sl: "Postanite lastnik nepremičnine v nekaterih najhitreje rastočih destinacijah na svetu.",
  },
  "Trusted Clients": { sl: "Stranke, ki nam zaupajo" },
  "Gross Development Value (GDV)": { sl: "Bruto razvojna vrednost (GDV)" },
  "Total Transactions": { sl: "Skupno transakcij" },
  "In Business Since": { sl: "Poslujemo od" },
  "Every client starts with a different objective": { sl: "Vsaka stranka ima drugačen cilj" },
  "Some are looking to build long-term wealth through real estate ownership. Others want recurring income, international diversification, or simply a way to participate in a market they believe has strong future potential.": {
    sl: "Nekateri želijo z lastništvom nepremičnin dolgoročno ustvarjati premoženje. Drugi iščejo redne prihodke, mednarodno razpršitev ali preprosto možnost sodelovanja na trgu, za katerega verjamejo, da ima velik prihodnji potencial.",
  },
  "Rather than offering a one-size-fits-all solution, we begin by understanding what matters most to you.": {
    sl: "Namesto univerzalne rešitve najprej razumemo, kaj je za vas najpomembnejše.",
  },
  "Customer Real Estate Buyer": { sl: "Kupec nepremičnine" },
  "For clients buying apartments or reserving units in selected emerging markets through a guided digital process.": {
    sl: "Za stranke, ki prek vodenega digitalnega postopka kupujejo stanovanja ali rezervirajo enote na izbranih nastajajočih trgih.",
  },
  "Property Owner Administration": { sl: "Upravljanje za lastnike nepremičnin" },
  "For owners who want AIXCO support after purchase with handover, rental coordination, documents, and reporting.": {
    sl: "Za lastnike, ki želijo podporo AIXCO po nakupu pri prevzemu, usklajevanju oddajanja, dokumentaciji in poročanju.",
  },
  "For intermediaries and distribution partners introducing clients and managing deal flow.": {
    sl: "Za posrednike in distribucijske partnerje, ki predstavljajo stranke ter upravljajo potek poslov.",
  },
  "Developer": { sl: "Nepremičninski razvijalec" },
  "For developers seeking project visibility, buyer access, tour coordination, and a stronger real estate sales channel.": {
    sl: "Za razvijalce, ki želijo večjo prepoznavnost projekta, dostop do kupcev, usklajevanje ogledov in močnejši prodajni kanal za nepremičnine.",
  },
  "A real estate foundation built on wise selection": { sl: "Nepremičninski temelji, zgrajeni na premišljeni izbiri" },
  "Since its first acquisition in 2009, the company has grown through carefully selected real estate decisions, building a portfolio defined by resilience, stability, and recurring income generation.": {
    sl: "Od prve pridobitve leta 2009 je podjetje raslo s premišljenimi nepremičninskimi odločitvami ter zgradilo portfelj, ki ga zaznamujejo odpornost, stabilnost in redni prihodki.",
  },
  "Over the decades, AIXCO has evolved into a diversified international group combining Swiss real estate heritage with disciplined asset selection in emerging markets.": {
    sl: "AIXCO se je skozi desetletja razvil v razvejano mednarodno skupino, ki združuje švicarsko nepremičninsko tradicijo z discipliniranim izborom sredstev na nastajajočih trgih.",
  },
  "Since 2009, AIXCO has bought, sold, and brokered real estate across Europe and the Gulf - today focused on selected emerging-market opportunities, with a legacy track record in Switzerland and Dubai.": {
    sl: "AIXCO od leta 2009 kupuje, prodaja in posreduje pri nepremičninah po Evropi in Zalivu; danes se osredotoča na izbrane priložnosti na nastajajočih trgih, pri čemer se opira na pretekle rezultate v Švici in Dubaju.",
  },
  "Swiss Real Estate Expertise and Knowledge Conquering Emerging Markets": {
    sl: "Švicarsko strokovno znanje o nepremičninah osvaja nastajajoče trge",
  },
  "Expanding through carefully selected opportunities": { sl: "Širitev s skrbno izbranimi priložnostmi" },
  "AIXCO Global was built on disciplined real estate ownership, practical execution, and long-term property services.": {
    sl: "AIXCO Global temelji na discipliniranem lastništvu nepremičnin, učinkoviti izvedbi in dolgoročnih nepremičninskih storitvah.",
  },
  "First acquisition": { sl: "Prvi nakup" },
  "Current gross development value": { sl: "Trenutna bruto razvojna vrednost" },
  "Current GDV": { sl: "Trenutni GDV" },
  "Transactions completed": { sl: "Zaključene transakcije" },
  "Transactions": { sl: "Transakcije" },
  "Real estate transacted across markets": { sl: "Vrednost nepremičninskih transakcij na različnih trgih" },
  "Value transacted": { sl: "Vrednost transakcij" },
  "Professional and highly skilled employees": { sl: "Strokovni in visoko usposobljeni zaposleni" },
  "Skilled employees": { sl: "Usposobljeni zaposleni" },
  "Disciplined ownership": { sl: "Disciplinirano lastništvo" },
  "Property administration": { sl: "Upravljanje nepremičnin" },
  "Responsible risk assessment": { sl: "Odgovorna ocena tveganj" },
  "Long-term value creation": { sl: "Dolgoročno ustvarjanje vrednosti" },
  "Global opportunities": { sl: "Globalne priložnosti" },
  "AIXCO combines local market expertise with international experience to provide access to opportunities positioned for long-term growth and capital appreciation.": {
    sl: "AIXCO združuje poznavanje lokalnih trgov z mednarodnimi izkušnjami ter omogoča dostop do priložnosti z možnostjo dolgoročne rasti in povečanja vrednosti kapitala.",
  },
  "A distinctly Swiss philosophy of managing risk": { sl: "Izrazito švicarska filozofija obvladovanja tveganj" },
  "Client objectives": { sl: "Cilji strank" },
  "Client approach": { sl: "Pristop do strank" },
  "in business, supporting clients across property ownership, brokerage, and administration.": {
    sl: "— leto začetka poslovanja. Od takrat strankam pomagamo pri lastništvu, posredovanju in upravljanju nepremičnin.",
  },
  "Ownership or flexible participation": { sl: "Lastništvo ali prilagodljivo sodelovanje" },
  "For many clients, this leads to direct ownership of carefully selected properties in emerging, profitable, sustainable markets.": {
    sl: "Za mnoge stranke to pomeni neposredno lastništvo skrbno izbranih nepremičnin na nastajajočih, donosnih in trajnostnih trgih.",
  },
  "For others, AIXCO offers an alternative participation program for clients who would like exposure to the market without the commitments that come with owning and managing property themselves.": {
    sl: "Drugim AIXCO ponuja alternativni program sodelovanja, ki jim omogoča izpostavljenost trgu brez obveznosti, povezanih z lastništvom in samostojnim upravljanjem nepremičnine.",
  },
  "Our commitment remains the same: transparent guidance, long-term support, and access to opportunities that align with your personal goals.": {
    sl: "Naša zaveza ostaja enaka: pregledno svetovanje, dolgoročna podpora in dostop do priložnosti, usklajenih z vašimi osebnimi cilji.",
  },
  "Swiss real estate heritage": { sl: "Švicarska nepremičninska tradicija" },
  "CHF 1.1 billion": { sl: "CHF 1.1 milijarde" },
  "Gulf developments delivered": { sl: "Zaključeni projekti v Zalivu" },
  "USD 800m+ development volume": { sl: "USD 800m+ obsega projektov" },
  "Current focus in Georgia": { sl: "Trenutni poudarek v Gruziji" },
  "Selected apartments from €45,000": { sl: "Izbrana stanovanja od €45,000" },
  "ACQUIRE.PARTNER.CREATE VALUE.": { sl: "PRIDOBITE.SODELUJTE.USTVARJAJTE VREDNOST." },
  "From property ownership and strategic partnership to professional asset management, AIXCO is with you at every stage of the journey.": {
    sl: "Od lastništva nepremičnin in strateških partnerstev do strokovnega upravljanja sredstev – AIXCO vas spremlja na vsakem koraku.",
  },
  "Buy an Apartment with AIXCO": { sl: "Kupite stanovanje z AIXCO" },
  "Broker Real Estate with AIXCO": { sl: "Posredujte pri prodaji nepremičnin z AIXCO" },
  "Administer Your Property": { sl: "Zaupajte upravljanje svoje nepremičnine" },
  "Choose the journey that fits your role. The process is structured, transparent, and digitally managed.": {
    sl: "Izberite pot, ki ustreza vaši vlogi. Postopek je strukturiran, pregleden in digitalno voden.",
  },
  "Journey 01": { sl: "Pot 01" },
  "Journey 02": { sl: "Pot 02" },
  "Journey 03": { sl: "Pot 03" },
  "Journey 04": { sl: "Pot 04" },
  "Broker": { sl: "Nepremičninski posrednik" },
  "AIXCO leadership": { sl: "Vodstvo AIXCO" },
  "Founder": { sl: "Ustanovitelj" },
  "Group companies and strategic partners": { sl: "Družbe v skupini in strateški partnerji" },
  "Group companies": { sl: "Družbe v skupini" },
  "Strategic partners": { sl: "Strateški partnerji" },
  "Start with AIXCO": { sl: "Začnite z AIXCO" },
  "Register for the correct customer, broker, property owner, or developer journey and the AIXCO team will follow up.": {
    sl: "Registrirajte se za ustrezno pot kupca, nepremičninskega posrednika, lastnika nepremičnine ali razvijalca; ekipa AIXCO bo nato stopila v stik z vami.",
  },
  "Frequently asked questions": { sl: "Pogosta vprašanja" },
  "Rental income is not guaranteed and depends on occupancy, market conditions, and property management.": {
    sl: "Prihodki od najemnin niso zagotovljeni in so odvisni od zasedenosti, tržnih razmer ter upravljanja nepremičnine.",
  },

  // Dubai legacy portfolio
  "DUBAI - LEGACY PORTFOLIO": { sl: "DUBAJ – PRETEKLI PORTFELJ" },
  "Dubai - Legacy portfolio": { sl: "Dubaj – pretekli portfelj" },
  "Our history in Dubai": { sl: "Naša zgodovina v Dubaju" },
  "Legacy market - we are not opening new Dubai real estate offers. Below is a snapshot of delivered and in-progress real estate volume.": {
    sl: "Pretekli trg – novih nepremičninskih ponudb v Dubaju ne odpiramo. Spodaj je pregled obsega zaključenih in tekočih nepremičninskih projektov.",
  },
  "Eden House — The Canal & The Park (Dubai)": { sl: "Eden House — The Canal & The Park (Dubai)" },
  "Status": { sl: "Status" },
  "Legacy portfolio — realized": { sl: "Pretekli portfelj — zaključen" },
  "Units": { sl: "Enote" },
  "Development value": { sl: "Vrednost projekta" },
  "USD 462m": { sl: "$462M" },
  "Volume": { sl: "Obseg" },
  "Canal-front residential sold and handed over": { sl: "Stanovanjski projekt ob kanalu je prodan in predan" },
  "Location": { sl: "Lokacija" },
  "Dubai Water Canal district": { sl: "Območje Dubai Water Canal" },
  "Highlights": { sl: "Ključne prednosti" },
  "Prime canal-front location, strong partnerships, premium delivery": {
    sl: "Vrhunska lokacija ob kanalu, močna partnerstva in izvedba najvišje kakovosti",
  },
  "Dubai Healthcare City (legacy development)": { sl: "Dubai Healthcare City (pretekli projekt)" },
  "Legacy portfolio — in progress": { sl: "Pretekli portfelj — v izvajanju" },
  "Development scope": { sl: "Obseg projekta" },
  "USD 350m mixed-use program": { sl: "$350M program mešane rabe" },
  "Site progress": { sl: "Napredek gradnje" },
  "~20% developed, ~20% under construction": { sl: "~20% dokončano, ~20% v gradnji" },
  "Dubai Creek - Dubai, UAE": { sl: "Dubai Creek – Dubai, ZAE" },
  "Classification": { sl: "Namembnost" },
  "Residential buildings, offices, retail, gastronomy, healthcare": {
    sl: "Stanovanjske stavbe, pisarne, maloprodaja, gostinstvo in zdravstvo",
  },
  "Al Khail Rd, 2nd Za'abeel Rd, Metro Green Line, Bus": {
    sl: "Al Khail Rd, 2nd Za'abeel Rd, zelena linija metroja, avtobus",
  },
  "Strategy": { sl: "Strategija" },
  "Mixed-use masterplan combining Build-to-Rent and Build-to-Sell for an underserved millennial market": {
    sl: "Glavni načrt mešane rabe, ki za premalo oskrbovan trg milenijcev združuje gradnjo za oddajo in gradnjo za prodajo",
  },
  "Connectivity": { sl: "Povezljivost" },
  "Near DIFC, Downtown Dubai, Business Bay, Ras Al Khor Wildlife Sanctuary, and Dubai Creek Golf Club": {
    sl: "V bližini DIFC, Downtown Dubai, Business Bay, naravnega rezervata Ras Al Khor in golf kluba Dubai Creek",
  },

  // Batumi opportunity
  "Emerging market opportunity": { sl: "Priložnost na nastajajočem trgu" },
  "Selected emerging-market projects and apartments through AIXCO, with Batumi as the current focus, entry from €45,000, 100% foreign ownership, bank financing minimum 60%, and a transparent ISO-certified process.": {
    sl: "Izbrani projekti in stanovanja na nastajajočih trgih prek AIXCO, pri čemer je Batumi trenutno v ospredju; vstop od €45,000, 100% lastništvo za tuje kupce, najmanj 60% bančnega financiranja in pregleden postopek s certifikatom ISO.",
  },
  "Selected projects and apartments available exclusively through AIXCO": {
    sl: "Izbrani projekti in stanovanja, ki so ekskluzivno na voljo prek AIXCO",
  },
  "100% foreign ownership": { sl: "100% lastništvo za tuje kupce" },
  "No residency permit required": { sl: "Dovoljenje za prebivanje ni potrebno" },
  "Secure your position from €5,000": { sl: "Zagotovite si izbrano enoto že od €5,000" },
  "Entry from €45,000": { sl: "Vstopna cena od €45,000" },
  "Bank financing minimum 60%": { sl: "Bančno financiranje najmanj 60%" },
  "Approx. 12% net rental yields": { sl: "Pribl. 12% neto donosnost od najema" },
  "Full commission payable from only a 10% down payment": {
    sl: "Celotna provizija se izplača že ob 10% pologu",
  },
  "0% capital gains tax after 2 years of ownership": {
    sl: "0% davka na kapitalski dobiček po 2 letih lastništva",
  },
  "1% tax on rental income": { sl: "1% davek na dohodek od najemnin" },
  "Full transparency through an ISO-certified system": {
    sl: "Popolna preglednost prek sistema s certifikatom ISO",
  },
  "Prime apartments from our own stock at the best available prices": {
    sl: "Vrhunska stanovanja iz naše lastne ponudbe po najboljših razpoložljivih cenah",
  },
  "Ours: a current AIXCO residential project with selected apartments, structured buyer guidance, and completion targeted for July 2028.": {
    sl: "Naš projekt: trenutni stanovanjski projekt AIXCO z izbranimi stanovanji, strukturiranim vodenjem kupcev in načrtovanim dokončanjem julija 2028.",
  },
  "Access property reference images and supporting documentation.": {
    sl: "Oglejte si referenčne fotografije nepremičnine in podporno dokumentacijo.",
  },

  // Current project / Reverance
  "Our current project": { sl: "Naš trenutni projekt" },
  "Batumi property profile": { sl: "Profil nepremičninskega projekta v Batumiju" },
  "Reverance": { sl: "Reverance" },
  "Reverance is a premium residential complex on Batumi's New Boulevard. AIXCO currently offers 28 selected apartments on the 13th and 14th floors, with completion targeted for July 2028.": {
    sl: "Reverance je vrhunski stanovanjski kompleks na Novem bulvarju v Batumiju. AIXCO trenutno ponuja 28 izbranih stanovanj v 13. in 14. nadstropju, dokončanje pa je predvideno za julij 2028.",
  },
  "Available apartments": { sl: "Razpoložljiva stanovanja" },
  "13th and 14th floors": { sl: "13. in 14. nadstropje" },
  "Current availability": { sl: "Trenutna razpoložljivost" },
  "28 selected apartments on the 13th and 14th floors.": {
    sl: "28 izbranih stanovanj v 13. in 14. nadstropju.",
  },
  "private residences": { sl: "zasebne rezidence" },
  "Floors": { sl: "Nadstropja" },
  "per building": { sl: "na stavbo" },
  "Apartments": { sl: "Stanovanja" },
  "total units": { sl: "skupno število enot" },
  "Completion": { sl: "Dokončanje" },
  "Jul 2028": { sl: "julij 2028" },
  "target": { sl: "predvidoma" },
  "Scale": { sl: "Obseg" },
  "Rental case": { sl: "Potencial oddajanja" },
  "25,000 sqm": { sl: "25,000 m²" },
  "infrastructure": { sl: "infrastrukture" },
  "25,000 sqm of comfort and community infrastructure across a 45,000 sqm planned site.": {
    sl: "25,000 m² površin za udobje in skupnostno infrastrukturo na načrtovanem območju velikosti 45,000 m².",
  },
  "59 Adlia Street, with New Boulevard 5 minutes away, shopping and airport access 7 minutes away, and Batumi Medical Center 8 minutes away.": {
    sl: "59 Adlia Street; New Boulevard je oddaljen 5 minut, trgovine in letališče 7 minut, Batumi Medical Center pa 8 minut.",
  },
  "$600/month average long-term rent, $80/night average short-stay rent, and 90% potential occupancy shown in the project deck.": {
    sl: "Projektna dokumentacija navaja povprečno dolgoročno najemnino $600/mesec, povprečno ceno kratkoročnega najema $80/noč in možno 90% zasedenost.",
  },
  "The investment case": { sl: "Naložbeni potencial" },
  "100% Ownership": { sl: "100% lastništvo" },
  "Full freehold, no local partner, no conditions. Yours entirely.": {
    sl: "Popolna lastninska pravica, brez lokalnega partnerja in brez pogojev. V celoti vaše.",
  },
  "No Residency Permit": { sl: "Dovoljenje za prebivanje ni potrebno" },
  "Ownership without relocation. Buy from anywhere.": {
    sl: "Lastništvo brez selitve. Nakup je mogoč od koder koli.",
  },
  "1% Rental Income Tax": { sl: "1% davek na dohodek od najemnin" },
  "Keep 99% of what your asset earns - rental income taxed at just 1%.": {
    sl: "Obdržite 99% donosa svoje nepremičnine – dohodek od najemnin je obdavčen le z 1%.",
  },
  "0% Capital Gains": { sl: "0% davek na kapitalski dobiček" },
  "Hold for more than two years and keep the full upside.": {
    sl: "Nepremičnino obdržite več kot dve leti in ohranite celoten kapitalski dobiček.",
  },
  "Minimum 60% Financing": { sl: "Najmanj 60% financiranja" },
  "Local bank financing can cover at least 60% of the purchase price.": {
    sl: "Financiranje pri lokalni banki lahko krije najmanj 60% nakupne cene.",
  },
  "Transparent Title": { sl: "Pregledna lastninska pravica" },
  "ISO-certified guidance with clear, verifiable documentation.": {
    sl: "Svetovanje po sistemu s certifikatom ISO ter jasna in preverljiva dokumentacija.",
  },
  "Project highlights": { sl: "Poudarki projekta" },
  "Selected access, structured for ownership.": {
    sl: "Izbran dostop, zasnovan za pridobitev lastništva.",
  },
  "Clear guidance, real project information, and supporting materials from AIXCO.": {
    sl: "Jasno svetovanje, preverjene informacije o projektu in podporna gradiva AIXCO.",
  },
  "Exclusive access": { sl: "Ekskluzivni dostop" },
  "Ownership": { sl: "Lastništvo" },
  "Financing": { sl: "Financiranje" },
  "Tax & transparency": { sl: "Davki in preglednost" },

  // FAQ: current public real-estate questions
  "FAQ essentials": { sl: "Ključna vprašanja in odgovori" },
  "Click a question to read the answer.": { sl: "Kliknite vprašanje in preberite odgovor." },
  "Real Estate Investment": { sl: "Naložbe v nepremičnine" },
  "Questions and answers for clients reviewing AIXCO real estate opportunities in Batumi.": {
    sl: "Vprašanja in odgovori za stranke, ki preučujejo nepremičninske priložnosti AIXCO v Batumiju.",
  },
  "How do I get started?": { sl: "Kako začnem?" },
  "To get started, please register on our website. Once your account is created, you will receive all further information via email.": {
    sl: "Za začetek se registrirajte na naši spletni strani. Ko bo vaš račun ustvarjen, boste vse nadaljnje informacije prejeli po e-pošti.",
  },
  "What is the minimum investment amount?": { sl: "Kolikšen je najnižji znesek naložbe?" },
  "The minimum investment amount is €5,000.": { sl: "Najnižji znesek naložbe je €5,000." },
  "Why is Batumi an attractive location for real estate investment?": {
    sl: "Zakaj je Batumi privlačna lokacija za naložbe v nepremičnine?",
  },
  "Batumi is one of the fastest-growing coastal cities in Eastern Europe, offering tourism growth, modern infrastructure, and investor-friendly policies.": {
    sl: "Batumi je eno najhitreje rastočih obalnih mest v vzhodni Evropi ter ponuja rast turizma, sodobno infrastrukturo in vlagateljem prijazne politike.",
  },
  "Can foreigners buy property in Batumi, Georgia?": {
    sl: "Ali lahko tujci kupijo nepremičnine v Batumiju v Gruziji?",
  },
  "Yes, foreigners can freely purchase and own real estate with minimal restrictions.": {
    sl: "Da, tujci lahko prosto kupujejo nepremičnine in so njihovi lastniki z minimalnimi omejitvami.",
  },
  "What is the process of buying property in Batumi?": {
    sl: "Kako poteka nakup nepremičnine v Batumiju?",
  },
  "The process is simple: sign agreement and register ownership, often within days.": {
    sl: "Postopek je preprost: podpišete pogodbo in vpišete lastništvo, pogosto v le nekaj dneh.",
  },
  "Are there additional costs when buying property?": {
    sl: "Ali pri nakupu nepremičnine nastanejo dodatni stroški?",
  },
  "There are very low costs and no property purchase tax.": {
    sl: "Stroški so zelo nizki, davka na nakup nepremičnine pa ni.",
  },
  "How secure is a real estate investment in Batumi?": {
    sl: "Kako varna je naložba v nepremičnino v Batumiju?",
  },
  "Georgia offers strong legal protection and transparent ownership systems.": {
    sl: "Gruzija zagotavlja močno pravno varstvo in pregleden sistem lastništva.",
  },
  "Can I invest through a company or only as an individual?": {
    sl: "Ali lahko vlagam prek podjetja ali samo kot fizična oseba?",
  },
  "You can invest either as an individual or through a company, depending on your personal, tax, or investment objectives.": {
    sl: "Vlagate lahko kot fizična oseba ali prek podjetja, odvisno od osebnih, davčnih ali naložbenih ciljev.",
  },
  "What value increase can I calculate for my apartment?": {
    sl: "Kakšno rast vrednosti lahko pričakujem za svoje stanovanje?",
  },
  "Independent market research from Colliers Georgia indicates that residential property prices in Batumi have historically increased by approximately 8-15% annually, depending on location and property type.": {
    sl: "Neodvisna tržna raziskava Colliers Georgia kaže, da so se cene stanovanjskih nepremičnin v Batumiju v preteklosti zvišale za približno 8-15% letno, odvisno od lokacije in vrste nepremičnine.",
  },
  "What kind of reporting do I get?": { sl: "Kakšna poročila prejemam?" },
  "You will receive quarterly reports covering your property's performance and the general market.": {
    sl: "Vsako četrtletje boste prejeli poročilo o uspešnosti svoje nepremičnine in splošnih razmerah na trgu.",
  },
  "Is a credit check required for bank financing?": {
    sl: "Ali je za bančno financiranje potrebno preverjanje kreditne sposobnosti?",
  },
  "For 60% financing a traditional credit check is not required. Higher financing amounts may require standard bank credit approval and income verification.": {
    sl: "Za 60% financiranje tradicionalno preverjanje kreditne sposobnosti ni potrebno. Pri višjih zneskih financiranja lahko banka zahteva standardno odobritev kredita in dokazila o prihodkih.",
  },
  "How much equity do I need to have to purchase an apartment?": {
    sl: "Koliko lastnih sredstev potrebujem za nakup stanovanja?",
  },
  "Typically, buyers contribute 40% equity, with financing available for up to 60% of the property value. Depending on your financial profile and financing structure, the required equity contribution may be lower.": {
    sl: "Kupci praviloma prispevajo 40% lastnih sredstev, financiranje pa je na voljo do 60% vrednosti nepremičnine. Glede na vaš finančni profil in strukturo financiranja je lahko potreben delež lastnih sredstev nižji.",
  },

  // FAQ yes/no answers used by the role-specific journeys
  "Yes. Customers may pursue direct apartment purchase, brokerage support, or property administration.": {
    sl: "Da. Stranke lahko izberejo neposredni nakup stanovanja, podporo pri posredovanju ali upravljanje nepremičnine.",
  },
  "Yes. Customers may pursue direct purchase, structured participation, or both.": {
    sl: "Da. Stranke se lahko odločijo za neposreden nakup, strukturirano sodelovanje ali oboje.",
  },
  "No. Approx. 10-12% net rental yields are scenario-based and depend on occupancy, market conditions, property management, project delivery, and external factors.": {
    sl: "Ne. Pribl. 10-12% neto donosnost od najema temelji na scenarijih in je odvisna od zasedenosti, tržnih razmer, upravljanja nepremičnine, dokončanja projekta in zunanjih dejavnikov.",
  },
  "Yes. Reporting, documents, project updates, and transparent workflow are available through the portal and ISO-certified system.": {
    sl: "Da. Poročila, dokumenti, posodobitve projekta in pregleden potek dela so na voljo prek portala in sistema s certifikatom ISO.",
  },
  "Yes. Selected Batumi apartments allow 100% foreign ownership, and no residency permit is required to buy.": {
    sl: "Da. Izbrana stanovanja v Batumiju omogočajo 100% lastništvo tujim kupcem, za nakup pa dovoljenje za prebivanje ni potrebno.",
  },
  "Yes. Selected apartments in AIXCO's current focus allow 100% foreign ownership, and no residency permit is required to buy.": {
    sl: "Da. Izbrana stanovanja v trenutni ponudbi AIXCO omogočajo 100% lastništvo tujim kupcem, za nakup pa dovoljenje za prebivanje ni potrebno.",
  },
  "Yes. The platform supports tour coordination and a smoother customer journey.": {
    sl: "Da. Platforma omogoča usklajevanje ogledov in bolj tekoč postopek za stranke.",
  },
  "Yes. Login opens the relevant portal. Register starts the onboarding process for access approval.": {
    sl: "Da. Prijava odpre ustrezni portal. Registracija začne postopek vključitve in odobritve dostopa.",
  },
  "Yes. AIXCO can function as a structured distribution and presentation channel for selected listings.": {
    sl: "Da. AIXCO lahko deluje kot strukturiran distribucijski in predstavitveni kanal za izbrane nepremičninske ponudbe.",
  },
  "Yes. Support can include project visibility, lead handling, tours, and documentation flow.": {
    sl: "Da. Podpora lahko vključuje predstavitev projekta, obravnavo povpraševanj, oglede in urejanje dokumentacije.",
  },
  "Yes. AIXCO.Global is presented first as a real estate services company for buying, brokering, and administering property. Separate company-financing information may be available on request from the AIXCO team; it is not a primary website journey and no bond terms are promoted on this page.": {
    sl: "Da. AIXCO.Global je predstavljena predvsem kot družba za nepremičninske storitve pri nakupu, posredovanju in upravljanju nepremičnin. Ločene informacije o financiranju družbe so lahko na zahtevo na voljo pri ekipi AIXCO; to ni primarna pot na spletni strani in na tej strani niso predstavljeni pogoji obveznic.",
  },

  // Corrections for conspicuous generated-translation defects
  "From Switzerland to Dubai to Batumi": { sl: "Od Švice prek Dubaja do Batumija" },
  "From Switzerland to Dubai to Batumi—disciplined real estate execution since 2009.": {
    sl: "Od Švice prek Dubaja do Batumija — disciplinirano izvajanje nepremičninskih projektov od leta 2009.",
  },
  "Today, AIXCO manages projects representing more than $400 million in gross development value, supported by an international team of over 90 professionals and a global network of clients, brokers, developers, and partners.": {
    sl: "Danes AIXCO upravlja projekte, katerih bruto razvojna vrednost presega $400 milijonov. Pri njihovem izvajanju sodelujejo mednarodna ekipa več kot 90 strokovnjakov ter globalna mreža strank, posrednikov, razvijalcev in partnerjev.",
  },
  "Today, AIXCO manages projects representing more than $400 million in gross development value, supported by an international team of over 90 professional and highly skilled employees and a global network of clients, brokers, developers, and partners.": {
    sl: "Danes AIXCO upravlja projekte, katerih bruto razvojna vrednost presega $400 milijonov. Pri njihovem izvajanju sodelujejo mednarodna ekipa več kot 90 strokovnih in visoko usposobljenih zaposlenih ter globalna mreža strank, posrednikov, razvijalcev in partnerjev.",
  },
  "Built upon decades of market experience and responsible ownership, AIXCO continues to expand internationally through selected opportunities in Dubai and Georgia.": {
    sl: "AIXCO na temelju desetletij tržnih izkušenj in odgovornega lastništva nadaljuje mednarodno širitev z izbranimi priložnostmi v Dubaju in Gruziji.",
  },
  "AIXCO has completed more than 2,000 real estate transactions and transacted over $4.2 billion in property value across international markets.": {
    sl: "Podjetje AIXCO je na mednarodnih trgih izvedlo več kot 2,000 nepremičninskih transakcij v skupni vrednosti, ki presega $4.2 milijarde.",
  },
} satisfies Partial<Record<string, SlovenianTranslationFix>>;
