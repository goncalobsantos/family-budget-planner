import Papa from "papaparse";
import type { WalletRecord, NWSType, AccountType } from "@/types/budget";

interface RawCsvRow {
  category: string;
  amount: string;
  type: string;
  note: string;
  date: string;
  labels: string;
  NWS: string;
  Account: string;
  "Extra info": string;
}

const VALID_NWS: NWSType[] = [
  "Needs",
  "Wants",
  "Saves",
  "Income",
  "Ignore",
  "Start",
];
const VALID_ACCOUNTS: AccountType[] = ["Main", "Meal", "TradeRepublic"];

export function parseCsv(csvText: string): WalletRecord[] {
  const result = Papa.parse<RawCsvRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (result.errors.length > 0) {
    const critical = result.errors.filter((e) => e.type !== "FieldMismatch");
    if (critical.length > 0) {
      throw new Error(
        `CSV parsing errors: ${critical.map((e) => e.message).join(", ")}`
      );
    }
  }

  return result.data.map((row, i) => {
    const nws = row.NWS?.trim() as NWSType;
    if (!VALID_NWS.includes(nws)) {
      throw new Error(`Row ${i + 1}: invalid NWS value "${row.NWS}"`);
    }

    const account = row.Account?.trim() as AccountType;
    if (!VALID_ACCOUNTS.includes(account)) {
      throw new Error(`Row ${i + 1}: invalid Account value "${row.Account}"`);
    }

    const type = row.type?.trim();
    if (type !== "Receita" && type !== "Despesa") {
      throw new Error(`Row ${i + 1}: invalid type "${row.type}"`);
    }

    const labels = row.labels
      ? row.labels
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean)
      : [];

    return {
      category: row.category?.trim() || "Sem categoria",
      amount: parseFloat(row.amount) || 0,
      type,
      note: row.note?.trim() || "",
      date: row.date?.trim() || "",
      labels,
      nws,
      account,
      extraInfo: row["Extra info"]?.trim() || "",
    };
  });
}
