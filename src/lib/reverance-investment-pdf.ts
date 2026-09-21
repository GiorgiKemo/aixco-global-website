import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFPage, type RGB, type PDFImage } from "pdf-lib";
import type { Lang } from "@/i18n/languages";
import { translateReveranceCalculatorText } from "@/i18n/reverance-calculator-translations";
import { OFFER_COPY } from "@/i18n/reverance-offer-copy";
import { calculateReveranceInvestment, type InvestmentCalculation } from "./reverance-investment-calculator";
import { isGoldenPremiumUnit } from "@/data/golden-premium-apartments";
import catalog from "../../public/aixco-global-op2/images/reverance-offer/catalog.json";

const W = 595.28, H = 841.89, M = 48, WIDTH = W - 2 * M;
const C = {
  dark: rgb(16/255,28/255,24/255), ink: rgb(23/255,34/255,30/255),
  muted: rgb(100/255,113/255,107/255), bronze: rgb(164/255,123/255,58/255),
  sea: rgb(46/255,120/255,106/255), fog: rgb(242/255,239/255,232/255),
  line: rgb(216/255,211/255,201/255), white: rgb(1,1,1), light: rgb(.79,.83,.8),
};
export type GenerateReverancePdfOptions = {
  calculation: InvestmentCalculation; lang: Lang; clientName?: string; clientAddress?: string;
};

export async function generateReveranceInvestmentPdf({ calculation: a, lang, clientName, clientAddress }: GenerateReverancePdfOptions) {
  const c = OFFER_COPY[lang];
  const t = (value: string) => translateReveranceCalculatorText(value, lang);
  const goldenPremium = isGoldenPremiumUnit(a.unit.code);
  const art = catalog[a.unit.code as keyof typeof catalog];
  if (!art || !c || (clientName?.length ?? 0) > 100 || (clientAddress?.length ?? 0) > 300) throw Error("Invalid PDF details");
  const cash = calculateReveranceInvestment({ ...a.inputs, financingPercent: 0 });
  const money = (value: number) => new Intl.NumberFormat(lang, {style:"currency",currency:"EUR",maximumFractionDigits:0}).format(value);
  const num = (value: number, digits = 1) => new Intl.NumberFormat(lang,{maximumFractionDigits:digits}).format(value);
  const pct = (value: number) => num(value) + "%";
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(t("Project Reverance investment calculator | AIXCO.Global"));
  doc.setAuthor("AIXCO.Global");
  doc.setSubject(t("Illustrative investment brief"));
  const fontDir = path.join(process.cwd(),"public/aixco-global-op2/fonts/reverance-pdf");
  const fonts = await Promise.all(["latin","latin-ext","cyrillic"].flatMap(script => [400,700].map(async weight => {
    const bytes = new Uint8Array(await fs.readFile(path.join(fontDir,"noto-sans-"+script+"-"+weight+"-normal.ttf")));
    return { pdf: await doc.embedFont(bytes,{subset:false}), source:fontkit.create(bytes), bold:weight===700 };
  })));
  const face = (char: string, bold: boolean) => {
    const selected = fonts.find(f => f.bold === bold && f.source.glyphForCodePoint(char.codePointAt(0)!).id !== 0);
    if (!selected) throw Error("Unsupported character");
    return selected.pdf;
  };
  const width = (text: string, size: number, bold = false) => Array.from(text).reduce((sum,char)=>sum+face(char,bold).widthOfTextAtSize(char,size),0);
  function text(page: PDFPage, value: string, x: number, top: number, size = 10, bold = false, color: RGB = C.ink) {
    for (const char of value) {
      const font = face(char,bold);
      page.drawText(char,{x,y:H-top-size,size,font,color});
      x += font.widthOfTextAtSize(char,size);
    }
  }
  function wrap(page: PDFPage, value: string, x: number, top: number, maxWidth = WIDTH, size = 10, bold = false, color: RGB = C.ink) {
    const lines: string[] = [];
    let current = "";
    for (const word of value.trim().split(/\s+/)) {
      if (current && width(current+" "+word,size,bold) <= maxWidth) { current += " "+word; continue; }
      if (current) { lines.push(current); current=""; }
      for (const char of word) {
        if (current && width(current+char,size,bold)>maxWidth) { lines.push(current); current=""; }
        current += char;
      }
    }
    if (current) lines.push(current);
    lines.forEach((line,i)=>text(page,line,x,top+i*size*1.4,size,bold,color));
    return top+lines.length*size*1.4;
  }
  function rect(page: PDFPage,x: number,top: number,w: number,h: number,color: RGB) {
    page.drawRectangle({x,y:H-top-h,width:w,height:h,color});
  }
  function rule(page: PDFPage,top: number,x=M,w=WIDTH,color=C.line) {
    page.drawLine({start:{x,y:H-top},end:{x:x+w,y:H-top},thickness:.6,color});
  }
  function contain(page: PDFPage,image: PDFImage,x: number,top: number,w: number,h: number) {
    const scale=Math.min(w/image.width,h/image.height), iw=image.width*scale, ih=image.height*scale;
    const left=x+(w-iw)/2, bottom=H-top-(h+ih)/2;
    page.drawImage(image,{x:left,y:bottom,width:iw,height:ih});
    return {x:left,y:bottom,width:iw,height:ih};
  }
  function heading(page: PDFPage,kicker: string,title: string,description?: string) {
    text(page,kicker.toUpperCase(),M,59,8,true,C.bronze);
    const bottom=wrap(page,title,M,82,WIDTH,25,true);
    if(description) wrap(page,description,M,Math.max(123,bottom+8),WIDTH,9,false,C.muted);
  }
  function page(background=C.white) {
    const p=doc.addPage([W,H]);
    rect(p,0,0,W,H,background);
    rule(p,795);
    text(p,"AIXCO.Global | www.aixco.global",M,808,7,false,C.muted);
    const footer=a.unit.code+"  |  "+doc.getPageCount()+" / 6";
    text(p,footer,W-M-width(footer,7),808,7,false,C.muted);
    return p;
  }
  const assetDir=path.join(process.cwd(),"public/aixco-global-op2/images/reverance-offer");
  const imageBytes = await Promise.all([a.unit.code+"-plan.png",a.unit.code+"-rooms.jpg","floor-"+art.floor+".jpg","hero.jpg"].map(file=>fs.readFile(path.join(assetDir,file))));
  const [plan,rooms,floor,hero] = await Promise.all(imageBytes.map((bytes,i)=>i===0?doc.embedPng(new Uint8Array(bytes)):doc.embedJpg(new Uint8Array(bytes))));

  // 1. The selected offer, with its actual individual plan on the cover.
  {
    const p=page();
    rect(p,0,0,W,340,C.dark);
    // Crop to a portrait view, using an embedded image sized to the right panel.
    p.drawImage(hero,{x:W-270,y:H-340,width:270,height:340});
    text(p,"REVERANCE LIVING BATUMI",M,47,8,true,C.bronze);
    text(p,"REVERANCE",M,97,31,true,C.white);
    wrap(p,t("Apartment").toUpperCase(),M,144,260,24,true,C.white);
    rule(p,204,M,118,C.bronze);
    text(p,a.unit.code,M,227,23,true,C.white);
    wrap(p,t(a.unit.type)+" | "+t("Building")+" A | "+t("Floor")+" "+a.unit.floor,M,267,260,10,false,C.light);
    text(p,c.offer.toUpperCase(),M,365,9,true,C.bronze);
    if (goldenPremium) text(p,t("GOLDEN PREMIUM APARTMENT").toUpperCase(),M,384,9,true,C.bronze);
    text(p,c.prepared+": "+new Intl.DateTimeFormat(lang).format(new Date()),M,402,8,false,C.muted);
    let top=410;
    if(clientName?.trim()) top=wrap(p,clientName,M,top,WIDTH,10,true)+5;
    if(clientAddress?.trim()) top=wrap(p,clientAddress,M,top,WIDTH,9,false,C.muted);
    const cardTop=Math.max(535,top+14);
    const cardWidth=(WIDTH-20)/3;
    [[t("Unit"),a.unit.code],[t("Area"),num(a.unit.area)+" m²"],[t("Purchase price"),money(a.listPrice)]].forEach(([label,value],i)=>{
      const x=M+i*(cardWidth+10);
      rect(p,x,cardTop,cardWidth,58,C.fog);
      text(p,label.toUpperCase(),x+12,cardTop+10,7,true,C.muted);
      text(p,value,x+12,cardTop+29,13,true,i===2?C.bronze:C.ink);
    });
    const planTop=cardTop+77;
    wrap(p,c.plan,M,planTop,265,8,true,C.bronze);
    contain(p,plan,M,planTop+22,270,145);
    wrap(p,c.planNote,338,planTop+25,W-M-338,9,false,C.muted);
    wrap(p,t("Illustrative only"),338,planTop+104,W-M-338,9,true,C.sea);
  }
  // 2. Both payment scenarios use exactly the website calculator formulas.
  {
    const p=page(C.fog);
    heading(p,t("Scenario calculator"),c.payment,a.unit.code+" | "+num(a.unit.area)+" m² | "+money(a.inputs.pricePerSquareMetre)+"/m²");
    const cardWidth=(WIDTH-16)/2;
    [a,cash].forEach((model,index)=>{
      const dark=index===0,x=M+index*(cardWidth+16), fg=dark?C.white:C.ink;
      rect(p,x,170,cardWidth,512,dark?C.dark:C.white);
      const title=index===0?c.withLoan+" ("+pct(a.inputs.financingPercent)+")":c.cash;
      wrap(p,title,x+14,187,cardWidth-28,12,true,fg);
      const rows: [string,string][] = [
        [t("Purchase price"),money(model.listPrice)],
        [t("Down payment")+" ("+pct(model.assumptions.downPaymentPercent)+")",money(model.downPayment)],
        [c.monthlyConstruction,money(model.constructionInstallments/model.assumptions.constructionInstallmentMonths)+" × "+model.assumptions.constructionInstallmentMonths],
        [t("Financing amount"),money(model.loanAmount)],
        [c.grossRent,money(model.grossMonthlyRent)],
        [t("Net monthly rent"),money(model.netMonthlyRent)],
        [t("Monthly bank payment"),money(model.monthlyBankPayment)],
        [t("Monthly surplus"),money(model.monthlySurplus)],
        [t("Invested equity"),money(model.investedEquity)],
        [t("Net worth after")+" "+model.inputs.holdingYears+" "+t("years"),money(model.holdingProjection.netWorth)],
      ];
      rows.forEach(([label,value],i)=>{
        const top=240+i*42;
        wrap(p,label,x+14,top,cardWidth-28,8,false,dark?C.light:C.muted);
        text(p,value,x+14,top+22,11,true,i>6?(dark?rgb(.85,.72,.43):C.bronze):fg);
      });
    });
    wrap(p,c.modelNote,M,705,WIDTH,9,false,C.muted);
  }
  // 3. Architectural plan, room measurements, and exact floor position.
  {
    const p=page();
    heading(p,t("The asset"),t("Apartment")+" "+a.unit.code,c.planNote);
    rect(p,M,168,275,266,C.fog);
    wrap(p,c.plan,M+12,181,251,8,true,C.bronze);
    contain(p,plan,M+8,212,259,207);
    const x=342, w=W-M-x;
    text(p,c.roomAreas.toUpperCase(),x,181,8,true,C.bronze);
    let top=211;
    const labels:Record<string,string>={living_room_and_kitchen:c.living,bathroom:c.bathroom,bedroom:c.bedroom,balcony:c.balcony,hallway:c.hallway};
    for(const area of art.areas) {
      top=wrap(p,labels[area.type] ?? t("Area"),x,top,w,9);
      text(p,num(area.size,2)+" m²",x,top+3,11,true); top+=32;
    }
    wrap(p,c.areaNote,x,top+4,w,7.5,false,C.muted);
    text(p,c.location.toUpperCase()+" | A / "+art.floor,M,468,8,true,C.bronze);
    rect(p,M,492,WIDTH,268,C.fog);
    const box=contain(p,floor,M+10,499,WIDTH-20,229);
    const polygon=art.points.map((point,i)=>(i?"L":"M")+" "+point.x*box.width/100+" "+point.y*box.height/100).join(" ")+" Z";
    p.drawSvgPath(polygon,{x:box.x,y:box.y+box.height,color:C.bronze,opacity:.4,borderColor:C.bronze,borderWidth:1.3});
    wrap(p,c.mapNote,M+12,733,WIDTH-24,8,true,C.bronze);
    text(p,c.source,M,772,7,false,C.muted);
  }
  // 4. A dedicated furnished-room example, not generic stock photography.
  {
    const p=page();
    heading(p,t("Apartment")+" "+a.unit.code,c.rooms,c.roomNote);
    contain(p,rooms,M,183,WIDTH,480);
    rect(p,M,698,WIDTH,69,C.fog);
    wrap(p,c.roomNote,M+14,711,WIDTH-28,9,false,C.muted);
    text(p,c.source,M,778,7,false,C.muted);
  }
  // 5. Financing and cash purchase remain separately labelled throughout.
  {
    const p=page();
    heading(p,t("Projection"),c.chart,c.chartNote);
    const legends=[[c.withLoan,C.sea],[c.cash,C.bronze]] as const;
    legends.forEach(([label,color],i)=>{
      const x=M+i*255;
      rect(p,x,181,8,8,color);
      wrap(p,label,x+14,179,225,8,true,color);
    });
    const max=Math.max(1,...a.milestones.map(m=>m.netWorth),...cash.milestones.map(m=>m.netWorth));
    const chartTop=230, chartHeight=210, group=WIDTH/a.milestones.length, bar=Math.min(32,group*.26);
    rule(p,chartTop+chartHeight);
    a.milestones.forEach((milestone,i)=>{
      const other=cash.milestones[i];
      [milestone.netWorth,other.netWorth].forEach((value,j)=>{
        const x=M+group*i+group/2+(j===0?-bar-4:4),h=Math.max(0,value/max*chartHeight);
        rect(p,x,chartTop+chartHeight-h,bar,h,j===0?C.sea:C.bronze);
        const label=money(value),size=Math.min(7,(group/2-4)/width(label,1,true));
        text(p,label,x+bar/2-width(label,size,true)/2,chartTop+chartHeight-h-14,size,true,j===0?C.sea:C.bronze);
      });
      const label=num(milestone.year,0)+" "+t("years");
      text(p,label,M+group*i+group/2-width(label,8)/2,451,8);
    });
    wrap(p,c.goldNote,M,483,WIDTH,9,false,C.muted);
    wrap(p,c.worthNote,M,540,WIDTH,8,true,C.muted);
    const columns=[M,M+43,M+145,M+244,M+371], widths=[38,95,90,119,128];
    [t("year"),t("Property value"),t("Remaining debt"),c.withLoan,c.cash].forEach((label,i)=>wrap(p,label,columns[i],580,widths[i],7,true,C.bronze));
    a.milestones.forEach((m,i)=>{
      const top=621+i*25;
      rule(p,top-5);
      [String(m.year),money(m.propertyValue),money(m.remainingDebt),money(m.netWorth),money(cash.milestones[i].netWorth)].forEach((value,j)=>text(p,value,columns[j],top,8,j>=3));
    });
    wrap(p,t("Illustrative only"),M,770,WIDTH,8,true,C.bronze);
  }
  // 6. Assumptions disclose the live model, rather than silently copying old rates.
  {
    const p=page(C.fog);
    heading(p,t("Assumptions"),c.assumptions,c.modelNote);
    const rows:[string,string][]=[
      [t("Price per m²"),money(a.inputs.pricePerSquareMetre)],
      [t("Financing"),pct(a.inputs.financingPercent)],
      [t("Down payment"),pct(a.assumptions.downPaymentPercent)],
      [t("Construction payment period"),String(a.assumptions.constructionInstallmentMonths)+" "+t("months")],
      [t("Interest rate"),pct(a.assumptions.interestPercent)],
      [t("Loan term"),String(a.assumptions.loanYears)+" "+t("years")],
      [t("Value uplift to completion"),pct(a.assumptions.completionUpliftPercent)],
      [t("Gross rental yield"),pct(a.inputs.grossYieldPercent)],
      [t("Rental income tax"),pct(a.assumptions.rentalTaxPercent)],
      [t("Operating / vacancy reserve"),pct(a.assumptions.operatingAndVoidPercent)],
      [t("Annual value growth"),pct(a.inputs.annualGrowthPercent)],
      [t("Holding period"),String(a.inputs.holdingYears)+" "+t("years")],
    ];
    rows.forEach(([label,value],i)=>{
      const top=208+i*33; rule(p,top-7);
      wrap(p,label,M,top,WIDTH-110,9,false,C.muted);
      text(p,value,W-M-width(value,10,true),top,10,true);
    });
    rect(p,M,637,WIDTH,120,C.white);
    wrap(p,t("This is not financial, legal or tax advice."),M+15,653,WIDTH-30,10,true);
    wrap(p,c.modelNote,M+15,685,WIDTH-30,9,false,C.muted);
  }
  return doc.save();
}
