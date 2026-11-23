// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("ScadenzaImminente");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("ScadenzaImminente");
import { useTable, Badge } from "../floware";

function leggiData(testo) {__mk();
 const s = String(testo || "").trim();
 const italiana = s.includes("/");
 const p = italiana ? s.split("/") : s.split("-");
 if (p.length !== 3) return null;
 const ia = italiana ? 2 : 0;
 const ig = italiana ? 0 : 2;
 const a = Number(p[ia]);
 const m = Number(p[1]);
 const g = Number(p[ig]);
 if (!Number.isInteger(a) || a < 1900 || a > 2200 || !Number.isInteger(m) || !Number.isInteger(g)) return null;
 const d = new Date(Date.UTC(a, m - 1, g));
 if (d.getUTCFullYear() !== a || d.getUTCMonth() !== m - 1 || d.getUTCDate() !== g) return null;
 return d.getTime() / 86400000;
}

export default function ScadenzaImminente({ pageId, rowIndex, value }) {__mk();
 const table = useTable(pageId);
 if (!table || table.column("Scadenza") < 0 || !table.rows[rowIndex]) return <span>{value}</span>;
 const fine = leggiData(table.value(rowIndex, "Scadenza"));
 const adesso = new Date();
 const oggi = Date.UTC(adesso.getFullYear(), adesso.getMonth(), adesso.getDate()) / 86400000;
 const giorni = fine === null ? null : fine - oggi;
 const imminente = giorni !== null && giorni >= 0 && giorni <= 7;
 if (!imminente) return <span>{value}</span>;
 return <div className="space-y-1 text-(--mk-danger)"><strong>{value}</strong><div><Badge tone="danger">{giorni === 0 ? "Scade oggi" : giorni === 1 ? "Scade domani" : "Scade tra " + String(giorni) + " giorni"}</Badge></div></div>;
}
