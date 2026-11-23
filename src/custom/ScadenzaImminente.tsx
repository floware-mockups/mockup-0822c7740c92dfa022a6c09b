// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("ScadenzaImminente");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("ScadenzaImminente");
import { useEffect, useState } from "react";
import { Card, useTable } from "../floware";

function leggiGiorno(testo) {__mk();
 const s=String(testo||"").trim();
 const italiana=s.includes("/");
 const parti=italiana?s.split("/"):s.split("-");
 if(parti.length!==3)return null;
 const ia=italiana?2:0, ig=italiana?0:2;
 const anno=Number(parti[ia]), mese=Number(parti[1]), giorno=Number(parti[ig]);
 if(!Number.isInteger(anno)||anno<1900||anno>2200||!Number.isInteger(mese)||mese<1||mese>12||!Number.isInteger(giorno)||giorno<1||giorno>31)return null;
 const data=new Date(Date.UTC(anno,mese-1,giorno));
 if(data.getUTCFullYear()!==anno||data.getUTCMonth()!==mese-1||data.getUTCDate()!==giorno)return null;
 return data.getTime()/86400000;
}

export default function ScadenzaImminente({pageId}) {__mk();
 const table=useTable(pageId);
 const [orologio,setOrologio]=useState(0);
 useEffect(()=>{__mk();
 const timer=setInterval(()=>(__mk(), setOrologio(v=>(__mk(), v+1))),60000);
 return ()=>(__mk(), clearInterval(timer));
 },[]);
 const adesso=new Date();
 const oggi=Date.UTC(adesso.getFullYear(),adesso.getMonth(),adesso.getDate())/86400000;
 const pronto=table&&["Data di attivazione","Giorni di istruttoria"].every(nome=>(__mk(), table.column(nome)>=0));
 useEffect(()=>{__mk();
 if(!table||!pronto)return;
 table.rows.forEach((riga,indice)=>{__mk();
 const inizio=leggiGiorno(table.value(riga,"Data di attivazione"));
 const risultato=inizio===null?"Data non valida":String(Math.max(0,oggi-inizio));
 if(table.value(riga,"Giorni di istruttoria")!==risultato)table.setCell(indice,"Giorni di istruttoria",risultato);
 });
 },[table,pronto,oggi,orologio]);
 if(!table)return null;
 if(!pronto)return <p>Servono le colonne Data di attivazione e Giorni di istruttoria.</p>;
 const nonValide=table.rows.filter(r=>(__mk(), leggiGiorno(table.value(r,"Data di attivazione"))===null)).length;
 return <Card title="Durata e scadenza automatica"><div className="space-y-2 text-(--mk-muted)"><p>Giorni di istruttoria: giorni di calendario trascorsi dall’attivazione della singola pratica a oggi, escluso il giorno iniziale. Per attivazioni future il valore è 0.</p><p>Calcolo automatico a ogni modifica e ogni minuto mentre questa pagina è aperta. Le sospensioni non vengono sottratte. La scadenza prevista resta invariata: la durata scelta nel modulo di aggiunta serve soltanto a determinarla.</p>{nonValide>0&&<p className="text-(--mk-danger)">Date di attivazione mancanti o non valide: {nonValide}. Correggerle per ottenere il conteggio.</p>}</div></Card>;
}
