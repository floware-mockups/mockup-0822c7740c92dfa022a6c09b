// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("ScadenzaImminente");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("ScadenzaImminente");
import { useEffect } from "react";
import { Select, Badge, useTable } from "../floware";
function leggiData(testo) {__mk();
 const s=String(testo||"").trim(), italiana=s.includes("/");
 const p=italiana?s.split("/"):s.split("-");
 if(p.length!==3)return null;
 const ia=italiana?2:0, ig=italiana?0:2;
 const a=Number(p[ia]),m=Number(p[1]),g=Number(p[ig]);
 if(!Number.isInteger(a)||a<1900||a>2200||!Number.isInteger(m)||!Number.isInteger(g))return null;
 const d=new Date(Date.UTC(a,m-1,g));
 return d.getUTCFullYear()===a&&d.getUTCMonth()===m-1&&d.getUTCDate()===g?d.getTime():null;
}
function durata(testo) {__mk();
 const n=Number(String(testo||"").replaceAll("giorni","").trim());
 return [30,60,90].includes(n)?n:null;
}
function scadenza(inizio,n) {__mk();
 const d=leggiData(inizio);
 return d===null||n===null?"":new Date(d+n*86400000).toISOString().slice(0,10);
}
export default function ScadenzaImminente({pageId,rowIndex,value}) {__mk();
 const table=useTable(pageId);
 const pronto=table&&["Data di attivazione","Scadenza","Giorni di istruttoria"].every(c=>(__mk(), table.column(c)>=0))&&Boolean(table.rows[rowIndex]);
 const inizio=pronto?table.value(rowIndex,"Data di attivazione"):"";
 const corrente=pronto?table.value(rowIndex,"Giorni di istruttoria"):value;
 const n=durata(corrente),fine=scadenza(inizio,n);
 const salvata=pronto?table.value(rowIndex,"Scadenza"):"";
 useEffect(()=>{__mk();
 if(!table||!pronto)return;
 if(n!==null&&corrente!==String(n))table.setCell(rowIndex,"Giorni di istruttoria",String(n));
 if(fine&&salvata!==fine)table.setCell(rowIndex,"Scadenza",fine);
 },[table,pronto,rowIndex,n,corrente,fine,salvata]);
 if(!table||!pronto)return <span>{value}</span>;
 const aggiorna=testo=>{__mk();
 const giorni=durata(testo);
 if(giorni===null)return;
 table.setCell(rowIndex,"Giorni di istruttoria",String(giorni));
 const nuova=scadenza(inizio,giorni);
 if(nuova)table.setCell(rowIndex,"Scadenza",nuova);
 };
 const ora=new Date(),oggi=Date.UTC(ora.getFullYear(),ora.getMonth(),ora.getDate());
 const distanza=fine?(leggiData(fine)-oggi)/86400000:null;
 const opzioni=[{value:"30",label:"30 giorni"},{value:"60",label:"60 giorni"},{value:"90",label:"90 giorni"}];
 return <div className="space-y-2"><span className="text-xs text-(--mk-muted)">{value||"Durata da scegliere"}</span><Select label="Giorni di istruttoria" value={n===null?"":String(n)} options={n===null?[{value:"",label:"Scegli la durata"},...opzioni]:opzioni} onChange={aggiorna}/>{!fine&&<p className="text-xs text-(--mk-muted)">Scegliere una durata e una data di attivazione valida.</p>}{distanza!==null&&distanza>=0&&distanza<=7&&<Badge tone="danger">{distanza===0?"Scade oggi":distanza===1?"Scade domani":"Scade tra "+String(distanza)+" giorni"}</Badge>}</div>;
}
