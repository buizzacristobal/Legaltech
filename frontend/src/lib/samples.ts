import type { Instrument } from "./types";

const creditor = { name: "Banco Ejemplo SpA", rut: "76.086.428-5", address: "Av. Apoquindo 1000", commune: "Las Condes" };
const debtor = { name: "Juan Pérez González", rut: "12.345.678-5", address: "Los Olmos 123", commune: "Ñuñoa" };
const jurisdiction = { court_name: "12° Juzgado Civil de Santiago", city: "Santiago" };

export const SAMPLE_PAGARE_TEXT = `PAGARÉ
Lugar y fecha: Santiago, 20 de enero de 2024.
Debo y pagaré a Banco Ejemplo SpA, RUT 76.086.428-5, la suma de $1.000.000 (un millón de pesos)
el día 20 de marzo de 2024. Interés convencional: 24% anual. Firma autorizada ante notario.
Deudor: Juan Pérez González, RUT 12.345.678-5, domiciliado en Los Olmos 123, Ñuñoa.`;

export const SAMPLE_FACTURA_TEXT = `FACTURA ELECTRÓNICA N° 1234
Emisor: Banco Ejemplo SpA, RUT 76.086.428-5. Receptor: Juan Pérez González, RUT 12.345.678-5.
Fecha de emisión: 20-01-2024. Vencimiento: 20-03-2024.
Neto $1.000.000  IVA $190.000  Total $1.190.000. Acuse de recibo: SI.`;

export const SAMPLE_PAGARE: Instrument = {
  kind: "pagare", amount: "1000000", currency: "CLP", issue_date: "2024-01-20",
  maturity_date: "2024-03-20", agreed_rate_annual: "24", creditor, debtor, jurisdiction,
  signature_authorized: true,
};
export const SAMPLE_FACTURA: Instrument = {
  kind: "factura", folio: "1234", net_amount: "1000000", vat_amount: "190000", total_amount: "1190000",
  issue_date: "2024-01-20", due_date: "2024-03-20", receipt_acknowledged: true, creditor, debtor, jurisdiction,
};
