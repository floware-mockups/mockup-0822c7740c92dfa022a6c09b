// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("GanttPratiche");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("GanttPratiche");
import { useState } from "react";
import { Card, Button, Badge, Select, Checkbox, useTable, usePrototype } from "../floware";

function leggiGiorno(testo) {__mk();
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
function dataBreve(g) {__mk();
 return new Intl.DateTimeFormat("it-IT",{day:"2-digit",month:"2-digit",year:"numeric",timeZone:"UTC"}).format(new Date(g*86400000));
}

export default function GanttPratiche({pageId}) {__mk();
 const table=useTable(pageId);
 const {openDetail}=usePrototype();
 const [stato,setStato]=useState("");
 const [soloCorso,setSoloCorso]=useState(false);
 const [ordine,setOrdine]=useState("fine");
 if(!table)return null;
 if(["Pratica","Data di attivazione","Scadenza","Stato"].some(c=>(__mk(), table.column(c)<0)))return <Card title="Gantt delle pratiche"><p>Servono le colonne Pratica, Data di attivazione, Scadenza e Stato.</p></Card>;
 const adesso=new Date();
 const oggi=Date.UTC(adesso.getFullYear(),adesso.getMonth(),adesso.getDate())/86400000;
 const tutte=table.rows.map((r,i)=>((__mk(), {i,nome:table.value(r,"Pratica"),stato:table.value(r,"Stato"),inizio:leggiGiorno(table.value(r,"Data di attivazione")),fine:leggiGiorno(table.value(r,"Scadenza"))})));
 const valide=tutte.filter(r=>(__mk(), r.inizio!==null&&r.fine!==null&&r.fine>=r.inizio));
 const stati=[...new Set(tutte.map(r=>(__mk(), r.stato)))].filter(s=>(__mk(), s));
 const filtro=stati.includes(stato)?stato:"";
 const righe=valide.filter(r=>(__mk(), (!filtro||r.stato===filtro)&&(!soloCorso||r.stato.toLowerCase().includes("in corso")))).sort((a,b)=>(__mk(), ordine==="fine"?a.fine-b.fine:a.inizio-b.inizio));
 const min=valide.reduce((n,r)=>(__mk(), Math.min(n,r.inizio)),valide.length?valide[0].inizio:oggi);
 const max=valide.reduce((n,r)=>(__mk(), Math.max(n,r.fine)),min+1);
 const ampiezza=Math.max(1,max-min+1);
 const prossima=righe.filter(r=>(__mk(), r.fine>=oggi)).sort((a,b)=>(__mk(), a.fine-b.fine))[0];
 const scadute=righe.filter(r=>(__mk(), r.fine<oggi)).length;
 const tacche=[0,0.25,0.5,0.75,1];
 const bordi=["solid","dashed","dotted"];
 return <Card title="Gantt delle pratiche"><div className="space-y-4 text-(--mk-text)">
 <p className="text-(--mk-muted)">Intervallo dall’attivazione alla scadenza. Ogni barra rappresenta una pratica; numero e bordo distinguono lo stato corrente, non la durata delle singole fasi.</p>
 <div className="grid gap-3 md:grid-cols-3"><Select label="Stato" value={filtro} options={[{value:"",label:"Tutti gli stati"},...stati.map(s=>((__mk(), {value:s,label:s})))]} onChange={setStato}/><Select label="Ordina per" value={ordine} options={[{value:"fine",label:"Scadenza più vicina prima"},{value:"inizio",label:"Attivazione"}]} onChange={setOrdine}/><Checkbox label="Solo stati con «in corso»" checked={soloCorso} onChange={setSoloCorso}/></div>
 <div className="flex flex-wrap gap-2">{stati.map((s,i)=>(__mk(), <Badge key={s} tone={s.toLowerCase().includes("in corso")?"primary":"neutral"}>{i+1} · {s}</Badge>))}</div>
 <p aria-live="polite">{righe.length} pratiche mostrate · {scadute} con scadenza superata rispetto al {dataBreve(oggi)}.</p>
 {prossima?<p>Prossima scadenza non superata: <strong>{prossima.nome} · {dataBreve(prossima.fine)}</strong> · tra {prossima.fine-oggi} giorni.</p>:<p className="text-(--mk-muted)">Nessuna scadenza futura tra le pratiche mostrate.</p>}
 {tutte.length>valide.length&&<p className="text-(--mk-danger)">{tutte.length-valide.length} pratiche escluse: date mancanti, non valide o fine precedente all’inizio.</p>}
 {righe.length>0?<div className="overflow-x-auto"><div style={{minWidth:"640px"}}>
 <div className="grid gap-4 border-b border-(--mk-divider) pb-2" style={{gridTemplateColumns:"220px 1fr"}}><strong>Pratica e date</strong><div className="flex justify-between gap-1 text-xs text-(--mk-muted)">{tacche.map(t=>(__mk(), <span key={t}>{dataBreve(Math.round(min+(max-min)*t))}</span>))}</div></div>
 {righe.map(r=>{__mk();const fase=stati.indexOf(r.stato);const indiceBordo=fase%3;const bordo=bordi[indiceBordo] || "solid";return <div key={r.i} className="grid items-center gap-4 border-b border-(--mk-divider) py-3" style={{gridTemplateColumns:"220px 1fr"}}><div className="space-y-1"><Button variant="link" onClick={()=>(__mk(), openDetail(pageId,r.i))}>{r.nome || "Pratica senza etichetta"}</Button><p className="text-xs">{dataBreve(r.inizio)} – {dataBreve(r.fine)}</p><p className="text-xs">{r.stato}</p>{r.fine<oggi&&<Badge tone="danger">Scadenza superata</Badge>}</div><div className="rounded bg-(--mk-subtle) py-2" aria-label={r.nome+": dal "+dataBreve(r.inizio)+" al "+dataBreve(r.fine)+", "+r.stato}><div className="overflow-hidden rounded bg-(--mk-primary) px-1 text-xs text-(--mk-on-primary)" style={{marginLeft:String((r.inizio-min)/ampiezza*100)+"%",width:String((r.fine-r.inizio+1)/ampiezza*100)+"%",border:"2px "+bordo+" var(--mk-text)"}}>{fase+1} · {r.stato}</div></div></div>;})}
 </div></div>:<p>Nessuna pratica con date valide corrisponde ai filtri.</p>}
 <p className="text-xs text-(--mk-muted)">Scala comune a tutte le pratiche valide. Apri una pratica dal nome per consultarne il dettaglio. Date e stati si aggiornano con i dati della tabella. Il filtro «in corso» considera gli stati che contengono queste parole.</p>
 </div></Card>;
}
