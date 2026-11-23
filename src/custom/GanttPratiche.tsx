// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("GanttPratiche");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("GanttPratiche");
import { useState } from "react";
import { Card, Button, Select, TextInput, Checkbox, Badge, useTable, usePrototype } from "../floware";
function giorno(testo) {__mk();
 const s=String(testo||"").trim(), italiana=s.includes("/");
 const p=italiana?s.split("/"):s.split("-");
 if(p.length!==3)return null;
 const ia=italiana?2:0, ig=italiana?0:2;
 const a=Number(p[ia]), m=Number(p[1]), g=Number(p[ig]);
 if(!Number.isInteger(a)||a<1900||a>2200||!Number.isInteger(m)||!Number.isInteger(g))return null;
 const d=new Date(Date.UTC(a,m-1,g));
 return d.getUTCFullYear()===a&&d.getUTCMonth()===m-1&&d.getUTCDate()===g?d.getTime()/86400000:null;
}
function data(g){__mk();return new Date(g*86400000).toISOString().slice(0,10);}
export default function GanttPratiche({pageId}) {__mk();
 const table=useTable(pageId);
 const {openDetail,notify}=usePrototype();
 const [aperto,setAperto]=useState(false);
 const [pratica,setPratica]=useState("");
 const [tipo,setTipo]=useState("");
 const [sito,setSito]=useState("");
 const [tecnico,setTecnico]=useState("");
 const [inizio,setInizio]=useState("");
 const [nuovoStato,setNuovoStato]=useState("");
 const [durata,setDurata]=useState("30");
 const [stato,setStato]=useState("");
 const [soloCorso,setSoloCorso]=useState(false);
 const [ordine,setOrdine]=useState("fine");
 if(!table)return null;
 if(["Pratica","Tipo","Sito","Tecnico","Data di attivazione","Stato","Scadenza","Giorni di istruttoria"].some(c=>(__mk(), table.column(c)<0)))return <p>Mancano colonne necessarie per le pratiche.</p>;
 const attivazione=giorno(inizio);
 const fineNuova=attivazione===null?"":data(attivazione+Number(durata));
 const duplicata=table.rows.some(r=>(__mk(), table.value(r,"Pratica").trim()===pratica.trim()));
 const valida=Boolean(pratica.trim()&&tipo.trim()&&sito.trim()&&tecnico.trim()&&nuovoStato.trim()&&fineNuova&&!duplicata&&["30","60","90"].includes(durata));
 const aggiungi=()=>{__mk();
 if(!valida)return;
 table.addRow({"Pratica":pratica.trim(),"Tipo":tipo.trim(),"Sito":sito.trim(),"Tecnico":tecnico.trim(),"Data di attivazione":inizio,"Stato":nuovoStato.trim(),"Scadenza":fineNuova,"Giorni di istruttoria":durata});
 setPratica("");setTipo("");setSito("");setTecnico("");setInizio("");setNuovoStato("");setDurata("30");setAperto(false);
 notify("Pratica aggiunta con scadenza calcolata.");
 };
 const ora=new Date(),oggi=Date.UTC(ora.getFullYear(),ora.getMonth(),ora.getDate())/86400000;
 const tutte=table.rows.map((r,i)=>((__mk(), {i,nome:table.value(r,"Pratica"),stato:table.value(r,"Stato"),inizio:giorno(table.value(r,"Data di attivazione")),fine:giorno(table.value(r,"Scadenza"))})));
 const stati=[...new Set(tutte.map(r=>(__mk(), r.stato)))].filter(s=>(__mk(), s));
 const filtro=stati.includes(stato)?stato:"";
 const valide=tutte.filter(r=>(__mk(), r.inizio!==null&&r.fine!==null&&r.fine>=r.inizio));
 const righe=valide.filter(r=>(__mk(), (!filtro||r.stato===filtro)&&(!soloCorso||r.stato.toLowerCase().includes("in corso")))).sort((a,b)=>(__mk(), ordine==="fine"?a.fine-b.fine:a.inizio-b.inizio));
 const min=valide.reduce((n,r)=>(__mk(), Math.min(n,r.inizio)),valide.length?valide[0].inizio:oggi);
 const max=valide.reduce((n,r)=>(__mk(), Math.max(n,r.fine)),min+1),ampiezza=Math.max(1,max-min+1);
 const prossima=righe.find(r=>(__mk(), r.fine>=oggi));
 return <div className="space-y-4"><Card title="Aggiungi pratica"><div className="space-y-3">
 <p className="text-(--mk-muted)">Modulo dedicato con durata a scelta singola. Usare soltanto dati inventati.</p>
 <Button variant="secondary" onClick={()=>(__mk(), setAperto(!aperto))}>{aperto?"Chiudi modulo":"Apri modulo"}</Button>
 {aperto&&<div className="space-y-3"><div className="grid gap-3 md:grid-cols-2">
 <TextInput label="Pratica" value={pratica} onChange={setPratica}/><TextInput label="Tipo" value={tipo} onChange={setTipo}/><TextInput label="Sito" value={sito} onChange={setSito}/><TextInput label="Tecnico" value={tecnico} onChange={setTecnico}/><TextInput label="Data di attivazione" type="date" value={inizio} onChange={setInizio}/><TextInput label="Stato" value={nuovoStato} onChange={setNuovoStato}/>
 <Select label="Giorni di istruttoria" value={durata} options={[{value:"30",label:"30 giorni"},{value:"60",label:"60 giorni"},{value:"90",label:"90 giorni"}]} onChange={setDurata}/><p aria-live="polite">Scadenza: {fineNuova||"Scegliere una data valida"}</p></div>
 <p>Compilare tutti i campi. Giorni di calendario, escluso quello di attivazione.</p>{duplicata&&<p className="text-(--mk-danger)">Pratica già presente.</p>}<Button onClick={aggiungi} disabled={!valida}>Aggiungi pratica</Button></div>}</div></Card>
 <Card title="Gantt delle pratiche"><div className="space-y-4"><div className="grid gap-3 md:grid-cols-3"><Select label="Stato" value={filtro} options={[{value:"",label:"Tutti gli stati"},...stati.map(s=>((__mk(), {value:s,label:s})))]} onChange={setStato}/><Select label="Ordina per" value={ordine} options={[{value:"fine",label:"Scadenza"},{value:"inizio",label:"Attivazione"}]} onChange={setOrdine}/><Checkbox label="Solo stati con «in corso»" checked={soloCorso} onChange={setSoloCorso}/></div>
 <p>{righe.length} pratiche mostrate · {righe.filter(r=>(__mk(), r.fine<oggi)).length} scadute.</p>{prossima&&<p>Scadenza futura: {prossima.nome} · {data(prossima.fine)}</p>}
 <p className="text-(--mk-muted)">Scala comune: {data(min)} – {data(max)}. Date non valide escluse: {tutte.length-valide.length}.</p>
 {righe.map(r=>(__mk(), <div key={r.i} className="space-y-2 border-b border-(--mk-divider) pb-3"><Button variant="link" onClick={()=>(__mk(), openDetail(pageId,r.i))}>{r.nome}</Button><p>{data(r.inizio)} – {data(r.fine)} · {r.stato}</p>{r.fine<oggi&&<Badge tone="danger">Scadenza superata</Badge>}<div className="rounded bg-(--mk-subtle) py-1"><div className="h-4 rounded bg-(--mk-primary)" style={{marginLeft:String((r.inizio-min)/ampiezza*100)+"%",width:String((r.fine-r.inizio+1)/ampiezza*100)+"%"}} /></div></div>))}{!righe.length&&<p>Nessuna pratica corrisponde ai filtri.</p>}</div></Card></div>;
}
