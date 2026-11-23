// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("CalcoloTerminiSospesi");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("CalcoloTerminiSospesi");
import { useEffect, useState } from "react";
import { Card, Select, TextInput, useTable } from "../floware";

function leggiData(testo) {__mk();
  const s = String(testo || "").trim();
  const parti = s.includes("/") ? s.split("/") : s.split("-");
  if (parti.length !== 3) return null;
  const indiceAnno = s.includes("/") ? 2 : 0;
  const indiceGiorno = s.includes("/") ? 0 : 2;
  const anno = Number(parti[indiceAnno]);
  const mese = Number(parti[1]);
  const giorno = Number(parti[indiceGiorno]);
  if (anno < 1900 || anno > 2200 || mese < 1 || mese > 12 || giorno < 1 || giorno > 31) return null;
  const data = new Date(Date.UTC(anno, mese - 1, giorno));
  if (data.getUTCFullYear() !== anno || data.getUTCMonth() !== mese - 1 || data.getUTCDate() !== giorno) return null;
  return data.getTime() / 86400000;
}

function formatoCampo(testo) {__mk();
  const giorno = leggiData(testo);
  return giorno === null ? "" : new Date(giorno * 86400000).toISOString().slice(0, 10);
}

function presente(testo) {__mk();
  return Boolean(testo && testo.trim() !== "—" && testo.trim() !== "-");
}

function calcola(inizio, termine, richiesta, ripresa, oggi) {__mk();
  const a = leggiData(inizio);
  const b = leggiData(richiesta);
  const c = leggiData(ripresa);
  const n = Number(termine);
  if (a === null || !String(termine).trim() || !Number.isInteger(n) || n < 0) return { testo: "Completare inizio e termine", stato: "" };
  if ((presente(richiesta) && b === null) || (presente(ripresa) && c === null)) return { testo: "Controllare le date", stato: "" };
  if ((c !== null && b === null) || (b !== null && b < a) || (c !== null && c < b)) return { testo: "Sequenza date non valida", stato: "" };
  if (a > oggi || (b !== null && b > oggi) || (c !== null && c > oggi)) return { testo: "Data futura: verificare", stato: "" };
  const sospesa = b !== null && c === null;
  const trascorsi = b === null ? oggi - a : b - a + (c === null ? 0 : oggi - c);
  const residuo = n - trascorsi;
  const testo = String(Math.max(0, residuo)) + " giorni residui";
  if (sospesa) return { testo: testo + " · Sospesa", stato: "Sospesa" };
  if (residuo < 0) return { testo: testo + " · Scaduta da " + String(-residuo) + " giorni", stato: "Scaduta" };
  return { testo, stato: residuo === 0 ? "Termine esaurito" : "In corso" };
}

export default function CalcoloTerminiSospesi({ pageId }) {__mk();
  const table = useTable(pageId);
  const [scelta, setScelta] = useState("0");
  const [orologio, setOrologio] = useState(0);
  useEffect(() => {__mk();
    const timer = setInterval(() => (__mk(), setOrologio((valore) => (__mk(), valore + 1))), 60000);
    return () => (__mk(), clearInterval(timer));
  }, []);
  const adesso = new Date();
  const oggi = Date.UTC(adesso.getFullYear(), adesso.getMonth(), adesso.getDate()) / 86400000;
  const necessarie = ["Pratica", "Data inizio termini", "Termine disponibile (giorni)", "Data richiesta integrazioni", "Data ripresa termini", "Tempo residuo", "Stato"];
  const pronto = table && necessarie.every((nome) => (__mk(), table.column(nome) >= 0));
  useEffect(() => {__mk();
    if (!table || !pronto) return;
    table.rows.forEach((riga, indice) => {__mk();
      const esito = calcola(table.value(riga, "Data inizio termini"), table.value(riga, "Termine disponibile (giorni)"), table.value(riga, "Data richiesta integrazioni"), table.value(riga, "Data ripresa termini"), oggi);
      if (table.value(riga, "Tempo residuo") !== esito.testo) table.setCell(indice, "Tempo residuo", esito.testo);
      if (esito.stato && table.value(riga, "Stato") !== esito.stato) table.setCell(indice, "Stato", esito.stato);
    });
  }, [table, pronto, oggi, orologio]);
  if (!table || !pronto) return <p>Servono le colonne delle date, del termine disponibile, del residuo e dello stato.</p>;
  const indice = Number(scelta);
  const riga = table.rows[indice];
  const aggiorna = (colonna, valore) => {__mk(); if (riga) table.setCell(indice, colonna, valore); };
  const esito = riga ? calcola(table.value(riga, "Data inizio termini"), table.value(riga, "Termine disponibile (giorni)"), table.value(riga, "Data richiesta integrazioni"), table.value(riga, "Data ripresa termini"), oggi) : null;
  return <Card title="Calcolo automatico del residuo">
    <div className="space-y-3">
      <p className="text-(--mk-muted)">Giorni di calendario: dal termine disponibile si sottraggono i giorni dall’inizio alla richiesta e quelli dalla ripresa a oggi. Il giorno iniziale non si conta. Senza ripresa il residuo resta congelato. Aggiornamento ogni minuto e a ogni modifica mentre la pagina è aperta.</p>
      <p className="text-(--mk-muted)">Termine dimostrativo: 180 giorni, modificabile. Un solo intervallo di sospensione per pratica. Gli indicatori generali non fanno parte di questo calcolo.</p>
      <Select label="Pratica da modificare" value={scelta} options={table.rows.map((r, i) => ((__mk(), { value: String(i), label: table.value(r, "Pratica") })))} onChange={setScelta} />
      {riga && <div className="grid gap-3 md:grid-cols-2">
        <TextInput label="Data inizio termini" type="date" value={formatoCampo(table.value(riga, "Data inizio termini"))} onChange={(v) => (__mk(), aggiorna("Data inizio termini", v))} />
        <TextInput label="Termine disponibile (giorni)" type="number" value={table.value(riga, "Termine disponibile (giorni)")} onChange={(v) => (__mk(), aggiorna("Termine disponibile (giorni)", v))} />
        <TextInput label="Data richiesta integrazioni" type="date" value={formatoCampo(table.value(riga, "Data richiesta integrazioni"))} onChange={(v) => (__mk(), aggiorna("Data richiesta integrazioni", v))} />
        <TextInput label="Data ripresa termini" type="date" value={formatoCampo(table.value(riga, "Data ripresa termini"))} onChange={(v) => (__mk(), aggiorna("Data ripresa termini", v))} />
      </div>}
      {esito && <p className="font-semibold text-(--mk-text)" aria-live="polite">{esito.testo}</p>}
    </div>
  </Card>;
}
