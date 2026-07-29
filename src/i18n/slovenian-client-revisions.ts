import type { CatalogLang } from "./languages";

type TranslationSource = Partial<Record<string, Partial<Record<CatalogLang, string>>>>;

/**
 * Client-approved Slovenian copy from AIXCO-Global-EN-SL-dvojezicno.docx.
 *
 * This catalog is intentionally loaded before every generated or historical
 * Slovenian catalog. It covers every website string specified by the bilingual
 * document, including values that are split from their labels in the UI.
 */
export const slovenianClientRevisions = {
  // Meta and hero
  "AIXCO.Global | Real Estate Investment": { sl: "AIXCO.Global | Naložbe v nepremičnine" },
  "Explore selected real estate opportunities with transparent euro pricing from EUR 45,000, brokerage, and property administration through AIXCO.": {
    sl: "Odkrijte izbrane nepremičninske priložnosti s pregledno oblikovanimi cenami v evrih že od €45.000, posredovanjem in upravljanjem nepremičnin prek podjetja AIXCO.",
  },
  "Switzerland · Dubai · Batumi": { sl: "Švica · Dubaj · Batumi" },
  "Wise selection. Recurring income generation.": { sl: "Modra izbira. Ponavljajoči se prihodki." },
  "Selected real estate opportunities, transparent guidance, and long-term property support since 2009.": {
    sl: "Izbrane nepremičninske priložnosti, pregledno svetovanje in dolgoročna podpora pri upravljanju nepremičnin od leta 2009.",
  },
  "Contact AIXCO": { sl: "Kontaktirajte AIXCO" },
  "View current project": { sl: "Ogled trenutnega projekta" },
  "Global Real Estate": { sl: "Global Real Estate" },
  "Emerging Market Opportunities": { sl: "Priložnosti na razvijajočih se trgih" },
  "Own property in some of the world's fastest-growing destinations.": {
    sl: "Postanite lastnik nepremičnine v nekaterih najhitreje rastočih destinacijah na svetu.",
  },
  "Current project": { sl: "Trenutni projekt" },
  "Register": { sl: "Registracija" },
  "REGISTER": { sl: "REGISTRACIJA" },
  "CONTACT ME": { sl: "KONTAKTIRAJTE ME" },

  // About AIXCO
  "About AIXCO": { sl: "O podjetju AIXCO" },
  "Since 2009, AIXCO has bought, sold, and brokered real estate across Europe and the Gulf - today focused on selected emerging-market opportunities, with a legacy track record in Switzerland and Dubai.": {
    sl: "Od leta 2009 je podjetje AIXCO kupovalo, prodajalo in posredovalo pri prodaji nepremičnin po Evropi in Zalivu - danes se osredotoča na izbrane priložnosti na razvijajočih se trgih, z bogato tradicijo v Švici in Dubaju.",
  },
  "5,000+": { sl: "5.000+" },
  "Trusted Clients": { sl: "Zaupanja vrednih strank" },
  "Trusted clients": { sl: "Zaupanja vrednih strank" },
  "$400M": { sl: "$400M" },
  "Gross Development Value (GDV)": { sl: "Skupna razvojna vrednost (GDV)" },
  "2000+": { sl: "2000+" },
  "Total Transactions": { sl: "Skupno število transakcij" },
  "Total transactions": { sl: "Skupno število transakcij" },
  "In Business Since": { sl: "Poslujemo od leta" },
  "In business since": { sl: "Poslujemo od leta" },

  // Philosophy
  "AIXCO Philosophy": { sl: "Filozofija AIXCO" },
  "Swiss Real Estate Expertise and Knowledge Conquering Emerging Markets": {
    sl: "Švicarsko strokovno znanje na področju nepremičnin, ki osvaja razvijajoče se trge",
  },
  "AIXCO Global was built on disciplined real estate ownership, practical execution, and long-term property services.": {
    sl: "Podjetje AIXCO je zgrajeno na discipliniranem lastništvu nepremičnin, praktičnem izvajanju in dolgoročnih storitvah upravljanja nepremičnin.",
  },
  "First acquisition": { sl: "Prva pridobitev" },
  "Current gross development value": { sl: "Trenutna skupna razvojna vrednost" },
  "$400M+": { sl: "$400M+" },
  "Transactions completed": { sl: "Zaključene transakcije" },
  "2,000+": { sl: "2.000+" },
  "Real estate transacted across markets": {
    sl: "Skupna vrednost nepremičninskih transakcij, s katerimi se je trgovalo na vseh trgih",
  },
  "$4.2B+": { sl: "$4.2B+" },
  "Disciplined ownership": { sl: "Disciplinirano lastništvo" },
  "Property administration": { sl: "Upravljanje nepremičnin" },
  "Responsible risk assessment": { sl: "Odgovorno ocenjevanje tveganj" },
  "Long-term value creation": { sl: "Ustvarjanje dolgoročne vrednosti" },
  "Swiss discipline in practice": { sl: "Švicarska disciplina v praksi" },
  "A real estate foundation built on wise selection": {
    sl: "Temelj v nepremičninah, zgrajen na modri izbiri",
  },
  "AIXCO's philosophy starts with wise selection: durable assets, disciplined risk assessment, and recurring income generation.": {
    sl: "Filozofija podjetja AIXCO se začne z modro izbiro: trajnimi sredstvi, discipliniranim ocenjevanjem tveganj in ustvarjanjem ponavljajočih se prihodkov.",
  },
  "Origins": { sl: "Izvor" },
  "Since its first acquisition in 2009, the company has grown through carefully selected real estate decisions, building a portfolio defined by resilience, stability, and recurring income generation.": {
    sl: "Od svoje prve pridobitve leta 2009 je podjetje raslo s skrbno izbranimi odločitvami na področju nepremičnin ter zgradilo portfelj, za katerega so značilni odpornost, stabilnost in ustvarjanje ponavljajočih se prihodkov.",
  },
  "Over the decades, AIXCO has evolved into a diversified international group combining Swiss real estate heritage with disciplined asset selection in emerging markets.": {
    sl: "Skozi desetletja se je AIXCO razvil v raznoliko mednarodno skupino, ki združuje švicarsko nepremičninsko dediščino z discipliniranim izborom sredstev na razvijajočih se trgih.",
  },
  "Risk": { sl: "Tveganje" },
  "A distinctly Swiss philosophy of managing risk": {
    sl: "Izrazito švicarska filozofija obvladovanja tveganj",
  },
  "At the core of AIXCO lies a distinctly Swiss philosophy of managing risk. AIXCO approaches real estate decisions with discipline, conservatism, and a long-term perspective, focusing on durable properties and practical operating fundamentals.": {
    sl: "V jedru podjetja AIXCO je izrazito švicarska filozofija obvladovanja tveganj. AIXCO pristopa k odločitvam o nepremičninah z disciplino, konzervativnostjo in dolgoročno perspektivo, s poudarkom na trajnih lastnostih in praktičnih osnovah delovanja.",
  },
  "Through carefully selected real estate purchases, sales, brokerage mandates, and property administration, AIXCO focuses on durable assets, practical risk assessment, and sustainable long-term growth.": {
    sl: "Preko skrbno izbranih nakupov, prodaj, posredniških mandatov in upravljanja nepremičnin se AIXCO osredotoča na trajna sredstva, praktično ocenjevanje tveganj in trajnostno dolgoročno rast.",
  },
  "Global opportunities": { sl: "Globalne priložnosti" },
  "Expanding through carefully selected opportunities": {
    sl: "Širitev prek skrbno izbranih priložnosti",
  },
  "AIXCO combines local market expertise with international experience to provide access to opportunities positioned for long-term growth and capital appreciation.": {
    sl: "AIXCO združuje poznavanje lokalnih trgov z mednarodnimi izkušnjami, da zagotovi dostop do priložnosti, usmerjenih v dolgoročno rast in povečanje vrednosti kapitala.",
  },
  "Current GDV": { sl: "Trenutna skupna razvojna vrednost" },
  "Skilled employees": { sl: "Usposobljeni zaposleni" },
  "Transactions": { sl: "Transakcije" },
  "Value transacted": { sl: "Vrednost nepremičnin, s katerimi se je trgovalo" },
  "Built upon decades of market experience and responsible ownership, AIXCO continues to expand internationally through selected opportunities in Dubai and Georgia.": {
    sl: "Zgrajen na desetletjih tržnih izkušenj in odgovornega lastništva, AIXCO nadaljuje mednarodno širitev prek izbranih priložnosti v Dubaju in Gruziji.",
  },
  "Today, AIXCO manages projects representing more than $400 million in gross development value, supported by an international team of over 90 professional and highly skilled employees and a global network of clients, brokers, developers, and partners.": {
    sl: "Danes AIXCO upravlja projekte v skupni razvojni vrednosti več kot 400 milijonov ameriških dolarjev, podprte z mednarodno ekipo več kot 90 strokovno usposobljenih zaposlenih ter globalno mrežo strank, posrednikov, razvijalcev in partnerjev.",
  },
  "AIXCO has completed more than 2,000 real estate transactions and transacted over $4.2 billion in property value across international markets.": {
    sl: "AIXCO je zaključil več kot 2.000 nepremičninskih transakcij in na mednarodnih trgih realiziral prek 4,2 milijarde ameriških dolarjev vrednosti nepremičnin.",
  },
  "Principles": { sl: "Načela" },
  "Integrity, stability, discipline, and responsible risk assessment": {
    sl: "Integriteta, stabilnost, disciplina in odgovorno ocenjevanje tveganj",
  },
  "Integrity, stability, discipline, and responsible risk assessment remain central to every aspect of our real estate practice.": {
    sl: "Integriteta, stabilnost, disciplina in odgovorno ocenjevanje tveganj ostajajo osrednjega pomena za vse vidike naše nepremičninske dejavnosti.",
  },
  "As AIXCO continues to grow internationally, its vision remains unchanged: to build resilient real estate services - buy, broker, and manage property - rooted in Swiss heritage, disciplined execution, and enduring long-term value.": {
    sl: "Medtem ko se AIXCO še naprej mednarodno širi, njegova vizija ostaja nespremenjena: graditi odporne nepremičninske storitve - nakup, posredovanje in upravljanje nepremičnin - zakoreninjene v švicarski dediščini, disciplinirani izvedbi in trajni dolgoročni vrednosti.",
  },

  // Client objectives and journey
  "Client objectives": { sl: "Cilji strank" },
  "Every client starts with a different objective": {
    sl: "Vsaka stranka izhaja iz drugačnega cilja",
  },
  "Some are looking to build long-term wealth through real estate ownership. Others want recurring income, international diversification, or simply a way to participate in a market they believe has strong future potential.": {
    sl: "Nekateri želijo z lastništvom nepremičnin zgraditi dolgoročno premoženje. Drugi si želijo ponavljajočih se prihodkov, mednarodne razpršitve ali preprosto načina, kako sodelovati na trgu, za katerega verjamejo, da ima velik prihodnji potencial.",
  },
  "Rather than offering a one-size-fits-all solution, we begin by understanding what matters most to you.": {
    sl: "Namesto da bi ponudili univerzalno rešitev, začnemo tako, da najprej razumemo, kaj je za vas najpomembnejše.",
  },
  "Client approach": { sl: "Pristop do strank" },
  "in business, supporting clients across property ownership, brokerage, and administration.": {
    sl: "leto začetka poslovanja, s podporo strankam pri lastništvu nepremičnin, posredovanju in upravljanju.",
  },
  "Ownership or flexible participation": { sl: "Lastništvo ali prilagodljivo sodelovanje" },
  "For many clients, this leads to direct ownership of carefully selected properties in emerging, profitable, sustainable markets.": {
    sl: "Za mnoge stranke to vodi do neposrednega lastništva skrbno izbranih nepremičnin na razvijajočih se, dobičkonosnih in trajnostnih trgih.",
  },
  "For others, AIXCO offers an alternative participation program for clients who would like exposure to the market without the commitments that come with owning and managing property themselves.": {
    sl: "Za druge AIXCO ponuja alternativni program sodelovanja za stranke, ki bi želele izpostavljenost trgu brez obveznosti, ki jih prinaša lastno lastništvo in upravljanje nepremičnine.",
  },
  "Our commitment remains the same: transparent guidance, long-term support, and access to opportunities that align with your personal goals.": {
    sl: "Naša zaveza ostaja enaka: pregledno svetovanje, dolgoročna podpora in dostop do priložnosti, ki so v skladu z vašimi osebnimi cilji.",
  },
  "Our journey": { sl: "Naša pot" },
  "From Switzerland to Dubai to Batumi": { sl: "Od Švice do Dubaja do Batumija" },
  "Swiss real estate heritage": { sl: "Švicarska nepremičninska dediščina" },
  "CHF 1.1 billion": { sl: "CHF 1,1 milijarde" },
  "Gulf developments delivered": { sl: "Zaključeni razvojni projekti v Zalivu" },
  "USD 800m+ development volume": { sl: "$800M+ vrednost razvojnega obsega projektov" },
  "Current focus in Georgia": { sl: "Trenutni fokus v Gruziji" },
  "Selected apartments from €45,000": { sl: "Izbrana stanovanja že od €45.000" },

  // Dubai legacy portfolio
  "DUBAI - LEGACY PORTFOLIO": { sl: "DUBAJ - PRETEKLO POSLOVANJE" },
  "Dubai - Legacy portfolio": { sl: "Dubaj - Preteklo poslovanje" },
  "Our history in Dubai": { sl: "Naša zgodovina v Dubaju" },
  "Legacy market - we are not opening new Dubai real estate offers. Below is a snapshot of delivered and in-progress real estate volume.": {
    sl: "Trg, ki ga ne širimo naprej - v Dubaju ne odpiramo novih nepremičninskih ponudb. Spodaj je pregled zaključenega in trenutno potekajočega nepremičninskega obsega.",
  },
  "Eden House — The Canal & The Park (Dubai)": {
    sl: "Eden House — The Canal & The Park (Dubaj)",
  },
  "Status": { sl: "Status" },
  "Legacy portfolio — realized": { sl: "Portfelj — zaključeno" },
  "Units": { sl: "Enote" },
  "Development value": { sl: "Razvojna vrednost" },
  "USD 462m": { sl: "$462M" },
  "$462M": { sl: "$462M" },
  "Dubai Healthcare City (legacy development)": {
    sl: "Dubai Healthcare City (razvoj iz preteklega poslovanja)",
  },
  "Legacy portfolio — in progress": { sl: "Portfelj — v izvajanju" },
  "Development scope": { sl: "Obseg razvoja" },
  "USD 350m mixed-use program": { sl: "$350M, večnamenski program" },
  "$350M": { sl: "$350M" },
  "mixed-use program": { sl: "večnamenski program" },
  "Site progress": { sl: "Napredek gradnje" },
  "~20% developed, ~80% under construction": { sl: "~20 % zgrajeno, ~80 % v gradnji" },
  "developed,": { sl: "zgrajeno," },
  "under construction": { sl: "v gradnji" },

  // Current project in Batumi
  "Emerging market opportunity": { sl: "Priložnost na razvijajočem se trgu" },
  "CURRENT PROJECT IN BATUMI": { sl: "TRENUTNI PROJEKT V BATUMIJU" },
  "Selected emerging-market projects and apartments through AIXCO, with Batumi as the current focus, entry from €45,000, 100% foreign ownership, bank financing minimum 60%, and a transparent ISO-certified process.": {
    sl: "Izbrani projekti in stanovanja na razvijajočih se trgih prek podjetja AIXCO, s Batumijem kot trenutnim fokusom, vstopom že od €45.000, 100-odstotnim tujim lastništvom, bančnim financiranjem najmanj 60 % in preglednim, ISO-certificiranim postopkom.",
  },
  "€5k": { sl: "€5k" },
  "Secure your position from €5,000": { sl: "Zavarujte si mesto že od €5.000" },
  "€45k": { sl: "€45k" },
  "Entry from €45,000": { sl: "Vstop že od €45.000" },
  "60%+": { sl: "60 %+" },
  "Bank financing minimum 60%": { sl: "Bančno financiranje najmanj 60 %" },
  "12%": { sl: "12 %" },
  "Approx. 12% net rental yields": {
    sl: "Približno 12-odstotna neto najemniška donosnost",
  },
  "Project Reverance": { sl: "Projekt Reverance" },
  "Reverance is a premium residential complex on Batumi's New Boulevard. AIXCO currently offers 28 selected apartments on the 13th and 14th floors, with completion targeted for July 2028.": {
    sl: "Reverance je vrhunski stanovanjski kompleks na Novem bulvarju v Batumiju. AIXCO trenutno ponuja 28 izbranih stanovanj v 13. in 14. nadstropju, z dokončanjem, predvidenim za julij 2028.",
  },
  "Explore": { sl: "Raziščite" },

  // Materials and ways to work with AIXCO
  "Download Materials": { sl: "Prenos gradiv" },
  "Access property reference images and supporting documentation.": {
    sl: "Dostopajte do referenčnih slik nepremičnin in spremljajoče dokumentacije.",
  },
  "Reverance Brochure": { sl: "Brošura Reverance" },
  "Eden House legacy image": { sl: "Slika stanovanja Eden House" },
  "Dubai Healthcare City image": { sl: "Slika Dubai Healthcare City" },
  "Clients and partners": { sl: "Za stranke in partnerje" },
  "How to work with AIXCO": { sl: "Kako sodelovati z AIXCO" },
  "ACQUIRE.PARTNER.CREATE VALUE.": { sl: "KUPITE. SODELUJTE. USTVARITE VREDNOST." },
  "ACQUIRE. PARTNER. CREATE VALUE.": { sl: "KUPITE. SODELUJTE. USTVARITE VREDNOST." },
  "From property ownership and strategic partnership to professional asset management, AIXCO is with you at every stage of the journey.": {
    sl: "Od lastništva nepremičnin in strateškega partnerstva do strokovnega upravljanja sredstev je AIXCO ob vaši strani v vsaki fazi poti.",
  },
  "Buy an Apartment with AIXCO": { sl: "Kupite stanovanje z AIXCO" },
  "Customers sign up, review selected apartments, book a private tour, and move through reservation and purchase with the AIXCO team.": {
    sl: "Stranke se registrirajo, si ogledajo izbrana stanovanja, rezervirajo zasebni ogled ter skupaj z ekipo AIXCO opravijo rezervacijo in nakup.",
  },
  "Broker Real Estate with AIXCO": { sl: "Posredujte nepremičnine z AIXCO" },
  "Brokers and partners can introduce qualified buyers, coordinate tours, and manage deal flow through a structured real estate sales process.": {
    sl: "Posredniki in partnerji lahko predstavijo kvalificirane kupce, usklajujejo oglede ter upravljajo potek poslov prek strukturiranega postopka prodaje nepremičnin.",
  },
  "Administer Your Property": { sl: "Upravljajte svojo nepremičnino" },
  "Property owners can work with AIXCO on documentation, buyer handover, reporting, rental coordination, and ongoing administration after purchase.": {
    sl: "Lastniki nepremičnin lahko z AIXCO sodelujejo pri dokumentaciji, predaji kupcu, poročanju, usklajevanju najema in nadaljnjem upravljanju po nakupu.",
  },

  // Journeys
  "Journeys": { sl: "Poti sodelovanja" },
  "How AIXCO Works": { sl: "Kako deluje AIXCO" },
  "Choose the journey that fits your role. The process is structured, transparent, and digitally managed.": {
    sl: "Izberite pot, ki ustreza vaši vlogi. Postopek je strukturiran, pregleden in digitalno voden.",
  },
  "Journey 01": { sl: "Pot 01" },
  "Customer Real Estate Buyer": { sl: "Kupec nepremičnine" },
  "For clients buying apartments or reserving units in selected emerging markets through a guided digital process.": {
    sl: "Za stranke, ki kupujejo stanovanja ali rezervirajo enote na izbranih razvijajočih se trgih prek vodenega digitalnega postopka.",
  },
  "Journey 02": { sl: "Pot 02" },
  "Property Owner Administration": { sl: "Upravljanje za lastnike nepremičnin" },
  "For owners who want AIXCO support after purchase with handover, rental coordination, documents, and reporting.": {
    sl: "Za lastnike, ki po nakupu želijo podporo AIXCO pri predaji, usklajevanju najema, dokumentih in poročanju.",
  },
  "Journey 03": { sl: "Pot 03" },
  "Broker": { sl: "Posrednik" },
  "For intermediaries and distribution partners introducing clients and managing deal flow.": {
    sl: "Za posrednike in distribucijske partnerje, ki predstavljajo stranke in upravljajo potek poslov.",
  },
  "Journey 04": { sl: "Pot 04" },
  "Developer": { sl: "Razvijalec" },
  "For developers seeking project visibility, buyer access, tour coordination, and a stronger real estate sales channel.": {
    sl: "Za razvijalce, ki iščejo prepoznavnost projekta, dostop do kupcev, usklajevanje ogledov in močnejši prodajni kanal za nepremičnine.",
  },

  // Team and partners
  "Team": { sl: "Ekipa" },
  "AIXCO leadership": { sl: "Vodstvo AIXCO" },
  "Founder": { sl: "Ustanovitelj" },
  "Leadership, vision, and overall group direction.": {
    sl: "Vodenje, vizija in splošna usmeritev skupine.",
  },
  "Capital markets, banking relationships, and financial structuring.": {
    sl: "Kapitalski trgi, bančni odnosi in finančno strukturiranje.",
  },
  "Product positioning, channel development, and distribution strategy.": {
    sl: "Pozicioniranje izdelkov, razvoj prodajnih kanalov in distribucijska strategija.",
  },
  "Partners": { sl: "Partnerji" },
  "Group companies and strategic partners": {
    sl: "Skupinska podjetja in strateški partnerji",
  },
  "Group companies": { sl: "Skupinska podjetja" },
  "Strategic partners": { sl: "Strateški partnerji" },

  // FAQ
  "FAQs": { sl: "Pogosta vprašanja" },
  "FAQ essentials": { sl: "Osnovna pogosta vprašanja" },
  "Click a question to read the answer.": {
    sl: "Kliknite na vprašanje, da preberete odgovor.",
  },
  "How do I get started?": { sl: "Kako začnem?" },
  "To get started, please register on our website. Once your account is created, you will receive all further information via email.": {
    sl: "Za začetek se prosimo registrirajte na naši spletni strani. Ko bo vaš račun ustvarjen, boste vse nadaljnje informacije prejeli po e-pošti.",
  },
  "What is the minimum investment amount?": { sl: "Kakšen je minimalni znesek naložbe?" },
  "The minimum investment amount is €5,000.": {
    sl: "Minimalni znesek naložbe je €5.000.",
  },
  "Why is Batumi an attractive location for real estate investment?": {
    sl: "Zakaj je Batumi privlačna lokacija za naložbe v nepremičnine?",
  },
  "Batumi is one of the fastest-growing coastal cities in Eastern Europe, offering tourism growth, modern infrastructure, and investor-friendly policies.": {
    sl: "Batumi je eno najhitreje rastočih obalnih mest v vzhodni Evropi, ki ponuja rast turizma, sodobno infrastrukturo in naložbam prijazno politiko.",
  },
  "Can foreigners buy property in Batumi, Georgia?": {
    sl: "Ali lahko tujci kupijo nepremičnino v Batumiju v Gruziji?",
  },
  "Yes, foreigners can freely purchase and own real estate with minimal restrictions.": {
    sl: "Da, tujci lahko prosto kupujejo in imajo v lasti nepremičnine z minimalnimi omejitvami.",
  },
  "What is the process of buying property in Batumi?": {
    sl: "Kakšen je postopek nakupa nepremičnine v Batumiju?",
  },
  "The process is simple: sign agreement and register ownership, often within days.": {
    sl: "Postopek je preprost: podpis pogodbe in vpis lastništva, pogosto v nekaj dneh.",
  },
  "Are there additional costs when buying property?": {
    sl: "Ali so pri nakupu nepremičnine dodatni stroški?",
  },
  "There are very low costs and no property purchase tax.": {
    sl: "Stroški so zelo nizki, davka na nakup nepremičnine pa ni.",
  },
  "How secure is a real estate investment in Batumi?": {
    sl: "Kako varna je naložba v nepremičnino v Batumiju?",
  },
  "Georgia offers strong legal protection and transparent ownership systems.": {
    sl: "Gruzija ponuja močno pravno zaščito in pregledne sisteme lastništva.",
  },
  "Can I invest through a company or only as an individual?": {
    sl: "Ali lahko investiram prek podjetja ali le kot posameznik?",
  },
  "You can invest either as an individual or through a company, depending on your personal, tax, or investment objectives.": {
    sl: "Investirate lahko bodisi kot posameznik bodisi prek podjetja, odvisno od vaših osebnih, davčnih ali naložbenih ciljev.",
  },
  "What value increase can I calculate for my apartment?": {
    sl: "Kakšno povečanje vrednosti lahko pričakujem za svoje stanovanje?",
  },
  "Independent market research from Colliers Georgia indicates that residential property prices in Batumi have historically increased by approximately 8-15% annually, depending on location and property type.": {
    sl: "Neodvisne tržne raziskave podjetja Colliers Georgia kažejo, da so se cene stanovanjskih nepremičnin v Batumiju v preteklosti letno povečevale za približno 8-15 %, odvisno od lokacije in vrste nepremičnine.",
  },
  "What kind of reporting do I get?": { sl: "Kakšno poročanje prejmem?" },
  "You will receive quarterly reports covering your property's performance and the general market.": {
    sl: "Prejemali boste četrtletna poročila o uspešnosti vaše nepremičnine in splošnem stanju na trgu.",
  },
  "Is a credit check required for bank financing?": {
    sl: "Ali je za bančno financiranje potrebno preverjanje kreditne sposobnosti?",
  },
  "For 60% financing a traditional credit check is not required. Higher financing amounts may require standard bank credit approval and income verification.": {
    sl: "Za 60-odstotno financiranje običajno preverjanje kreditne sposobnosti ni potrebno. Za višje zneske financiranja je lahko potrebna standardna bančna odobritev kredita in preverjanje dohodka.",
  },
  "How much equity do I need to have to purchase an apartment?": {
    sl: "Koliko lastnega kapitala potrebujem za nakup stanovanja?",
  },
  "Typically, buyers contribute 40% equity, with financing available for up to 60% of the property value. Depending on your financial profile and financing structure, the required equity contribution may be lower.": {
    sl: "Kupci običajno prispevajo 40 % lastnega kapitala, pri čemer je na voljo financiranje od minimalno 60 % vrednosti nepremičnine. Glede na vaš finančni profil in strukturo financiranja je lahko potreben delež lastnega kapitala nižji.",
  },

  // Footer
  "Start with AIXCO": { sl: "Začnite z AIXCO" },
  "Register for the correct customer, broker, property owner, or developer journey and the AIXCO team will follow up.": {
    sl: "Registrirajte se za ustrezno pot - kot stranka, posrednik, lastnik nepremičnine ali razvijalec - in ekipa AIXCO vas bo kontaktirala.",
  },
  "Login": { sl: "Prijava" },
  "Email": { sl: "E-pošta" },
  "Address": { sl: "Naslov" },
  "Grüngasse 16, 1050 Wien, Austria": { sl: "Grüngasse 16, 1050 Dunaj, Avstrija" },
  "SOCIAL MEDIA": { sl: "DRUŽBENI MEDIJI" },
  "Website": { sl: "Spletna stran" },
  "Official systems certified": { sl: "Uradno certificirani sistemi" },
  "ISO 27001-2022 Certified Systems.": { sl: "Certificirani sistemi ISO 27001-2022." },
  "All Rights Reserved.": { sl: "Vse pravice pridržane." },
  "Terms & Conditions": { sl: "Splošni pogoji poslovanja" },
  "Privacy Policy": { sl: "Politika zasebnosti" },
} satisfies TranslationSource;
