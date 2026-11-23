// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("ReportTempiAnnuali");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("ReportTempiAnnuali");
import { useState } from "react";
import { Card, Badge, Select, TextInput, useTable } from "../floware";
function giorno(testo) {__mk();
 const s=String(testo || "").trim();
 const p=s.includes("/")?s.split("/"):s.split("-");
 if(p.length!==3)return null;
 const ia=s.includes("/")?2:0;
 const ig=s.includes("/")?0:2;
 const a=Number(p[ia]), m=Number(p[1]), g=Number(p[ig]);
 if(!Number.isInteger(a)||a<1900||a>2200||m<1||m>12||g<1||g>31)return null;
 const d=new Date(Date.UTC(a,m-1,g));
 return d.getUTCFullYear()===a&&d.getUTCMonth()===m-1&&d.getUTCDate()===g?d.getTime()/86400000:null;
}
function barre(voci) {__mk();
 const max=voci.reduce((n,v)=>(__mk(), Math.max(n,v.numero)),1);
 return <div className="space-y-3">{!voci.length&&<p>Nessun dato disponibile.</p>}{voci.map(v=>(__mk(), <div key={v.nome}><div className="flex justify-between gap-3"><span>{v.nome}</span><strong>{v.numero}</strong></div><div className="h-3 rounded bg-(--mk-subtle)"><div className="h-3 rounded bg-(--mk-primary)" style={{width:String(v.numero/max*100)+"%"}} /></div></div>))}</div>;
}
export default function ReportTempiAnnuali(props) {__mk();
 const q=useTable("quadro-pratiche"), f=useTable("fasi-e-pareri"), s=useTable("sospensione-termini");
 const [anno,setAnno]=useState("Tutti");
 const [data,setData]=useState(()=>{__mk();const d=new Date();return new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())).toISOString().slice(0,10);});
 if(!q||!f||!s)return <p>Pagine sorgenti non disponibili.</p>;
 if(["Pratica","Data di attivazione"].some(c=>(__mk(), q.column(c)<0))||["Pratica","Fase"].some(c=>(__mk(), f.column(c)<0))||["Pratica","Data richiesta integrazioni","Data ripresa termini"].some(c=>(__mk(), s.column(c)<0)))return <p>Mancano colonne necessarie nelle pagine sorgenti.</p>;
 const oggi=giorno(data), ids=new Set(), pratiche=[];
 let escluse=0;
 for(const r of q.rows){__mk();
 const id=q.value(r,"Pratica").trim(), inizio=giorno(q.value(r,"Data di attivazione"));
 if(!id||inizio===null||ids.has(id)){escluse++;continue;}
 ids.add(id);pratiche.push({id,inizio,anno:String(new Date(inizio*86400000).getUTCFullYear())});
 }
 const anni=[...new Set(pratiche.map(p=>(__mk(), p.anno)))].sort();
 const filtro=anni.includes(anno)?anno:"Tutti";
 const scelte=pratiche.filter(p=>(__mk(), filtro==="Tutti"||p.anno===filtro));
 const valide=scelte.filter(p=>(__mk(), oggi!==null&&p.inizio<=oggi));
 let anomalie=0;
 const durate=valide.map(p=>{__mk();
 const intervalli=[];
 for(const r of s.rows.filter(r=>(__mk(), s.value(r,"Pratica").trim()===p.id))){__mk();
 const richiesta=s.value(r,"Data richiesta integrazioni").trim(), ripresa=s.value(r,"Data ripresa termini").trim();
 const vuota=!richiesta||richiesta==="—"||richiesta==="-";
 const aperta=!ripresa||ripresa==="—"||ripresa==="-";
 if(vuota&&aperta)continue;
 const a=giorno(richiesta), b=aperta?oggi:giorno(ripresa);
 if(a===null||b===null||a<p.inizio||b<a){anomalie++;continue;}
 if(a<=oggi)intervalli.push({a,b:Math.min(b,oggi)});
 }
 intervalli.sort((x,y)=>(__mk(), x.a-y.a));
 let fine=p.inizio, sospesi=0;
 for(const i of intervalli){__mk();sospesi+=Math.max(0,i.b-Math.max(fine,i.a));fine=Math.max(fine,i.b);}
 return {sospesi,netti:oggi-p.inizio-sospesi};
 });
 const media=campo=>(__mk(), durate.length?(durate.reduce((n,d)=>(__mk(), n+d[campo]),0)/durate.length).toFixed(1):"—");
 const gruppi=new Map();
 for(const r of f.rows){__mk();
 const id=f.value(r,"Pratica").trim(), fase=f.value(r,"Fase").trim();
 if(!fase||!scelte.some(p=>(__mk(), p.id===id)))continue;
 if(!gruppi.has(fase))gruppi.set(fase,new Set());
 gruppi.get(fase).add(id);
 }
 const distribuzione=[...gruppi.entries()].map(([nome,elenco])=>((__mk(), {nome,numero:elenco.size})));
 const senza=scelte.filter(p=>(__mk(), !f.rows.some(r=>(__mk(), f.value(r,"Pratica").trim()===p.id&&f.value(r,"Fase").trim())))).length;
 if(senza)distribuzione.push({nome:"Senza fase registrata",numero:senza});
 const orfane=new Set(s.rows.map(r=>(__mk(), s.value(r,"Pratica").trim())).filter(id=>(__mk(), !ids.has(id)))).size;
 return <div className="space-y-4 text-(--mk-text)"><Card title="Report calcolato dai dati sorgenti"><div className="space-y-3"><Badge tone="primary">Calcoli dinamici · dati in memoria</Badge><div className="grid gap-3 md:grid-cols-2"><Select label="Anno di attivazione" value={filtro} options={[{value:"Tutti",label:"Tutti gli anni"},...anni.map(a=>((__mk(), {value:a,label:a})))]} onChange={setAnno}/><TextInput label="Data di riferimento per i tempi" type="date" value={data} onChange={setData}/></div>{oggi===null&&<p className="text-(--mk-danger)">Scegliere una data valida.</p>}<div className="grid gap-3 md:grid-cols-3" aria-live="polite"><div>Pratiche selezionate: <strong>{scelte.length}</strong></div><div>Istruttoria netta media: <strong>{media("netti")} giorni</strong></div><div>Sospensione media: <strong>{media("sospesi")} giorni</strong></div></div><p className="text-(--mk-muted)">Medie su {valide.length} pratiche attivate entro la data scelta. Istruttoria netta maturata = giorni dall’attivazione meno sospensioni, non durata finale. Manca la data di conclusione. La sospensione media include le pratiche senza sospensioni; gli intervalli aperti arrivano alla data scelta, le sovrapposizioni contano una sola volta. Giorni di calendario, escluso quello iniziale.</p><p className="text-(--mk-muted)">Escluse {escluse} righe duplicate, senza pratica o con attivazione non valida; {anomalie} intervalli non validi. Pratiche nelle sospensioni senza collegamento al quadro: {orfane}. Collegamento tramite Pratica.</p></div></Card><div className="grid gap-4 md:grid-cols-2"><Card title="Pratiche per fase registrata">{barre(distribuzione)}<p className="mt-3 text-(--mk-muted)">Filtro annuo applicato; una pratica conta una volta per fase e può comparire in più fasi. Non indica la sola fase corrente.</p></Card><Card title="Totale annuo per attivazione">{barre(anni.map(a=>((__mk(), {nome:a,numero:pratiche.filter(p=>(__mk(), p.anno===a)).length}))))}<p className="mt-3">Tutti gli anni, senza filtri: {pratiche.length} pratiche uniche valide.</p></Card></div><Card title="Esempi statici separati"><p>Gli indicatori e la tabella sottostanti sono dati dimostrativi statici: non alimentano il report. I risultati sopra derivano esclusivamente dalle tre pagine sorgenti e si aggiornano alle loro modifiche.</p></Card></div>;
}
