import { addMonths, todayISO } from "./money";

export type MoneyType = "taken" | "given";
export type RepaymentCondition = "on_demand" | "specific_date" | "flexible";
export type DemandStatus = "not_demanded" | "demanded" | "partially_paid" | "fully_paid";

export type TxnType =
  | "principal"
  | "monthly_extra"
  | "advance_given"
  | "advance_received"
  | "principal_adjustment"
  | "extra_adjustment"
  | "other";

export type Person = {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  is_demo: boolean;
  created_at: string;
};

export type MoneyRecord = {
  id: string;
  person_id: string;
  type: MoneyType;
  principal_amount: number;
  date_started: string;
  monthly_extra_amount: number;
  monthly_extra_start_date: string | null;
  principal_repayment_condition: RepaymentCondition;
  principal_due_date: string | null;
  principal_demand_status: DemandStatus;
  principal_demand_date: string | null;
  demand_note: string | null;
  notes: string | null;
  is_demo: boolean;
  created_at: string;
};

export type Transaction = {
  id: string;
  money_record_id: string;
  person_id: string;
  transaction_type: TxnType;
  amount: number;
  transaction_date: string;
  notes: string | null;
  related_transaction_id?: string | null;
  related_record_id?: string | null;
  period?: string | null; // e.g. '2026-08' for monthly-extra period
  is_demo: boolean;
  created_at: string;
  updated_at?: string | null;
};

export const MONEY_TYPE_LABEL: Record<MoneyType, string> = {
  taken: "Money Taken",
  given: "Money Given",
};

export const REPAYMENT_LABEL: Record<RepaymentCondition, string> = {
  on_demand: "On Demand",
  specific_date: "Specific Date",
  flexible: "Flexible / No Fixed Date",
};

export const DEMAND_LABEL: Record<DemandStatus, string> = {
  not_demanded: "Not Demanded",
  demanded: "Demanded",
  partially_paid: "Partially Paid",
  fully_paid: "Fully Paid",
};

export const TXN_LABEL: Record<TxnType, string> = {
  principal: "Principal Payment",
  monthly_extra: "Monthly Extra",
  advance_given: "Advance Given",
  advance_received: "Advance Received",
  principal_adjustment: "Principal Adjustment",
  extra_adjustment: "Extra Adjustment",
  other: "Other",
};

export type ExtraStatus = "upcoming" | "due_today" | "overdue" | "none";

export type RecordSummary = {
  record: MoneyRecord;
  transactions: Transaction[];
  /** Sum of principal transactions (principal + principal_adjustment). */
  principalPaid: number;
  /** Sum of monthly_extra transactions only. NEVER reduces principal. */
  extraPaid: number;
  otherPaid: number;
  advanceTotal: number;
  remainingPrincipal: number;
  extrasPaidCount: number;
  nextExtraDue: string | null;
  extraStatus: ExtraStatus;
  isSettled: boolean;
};

const sum = (list: Transaction[], types: TxnType[] | TxnType) => {
  const wanted = Array.isArray(types) ? types : [types];
  return list
    .filter((t) => wanted.includes(t.transaction_type))
    .reduce((acc, t) => acc + Number(t.amount), 0);
};

export function summarise(record: MoneyRecord, allTransactions: Transaction[]): RecordSummary {
  // Include transactions that either belong to the record directly or reference it via related_record_id.
  const transactions = allTransactions
    .filter((t) => t.money_record_id === record.id || t.related_record_id === record.id)
    .slice()
    .sort((a, b) => a.transaction_date.localeCompare(b.transaction_date));

  // Principal reductions come only from 'principal' and explicit 'principal_adjustment'
  const principalPaid = sum(transactions, ["principal", "principal_adjustment"]);
  // Monthly extras and extra adjustments are counted separately and do NOT reduce principal
  const extraPaid = sum(transactions, ["monthly_extra", "extra_adjustment"]);
  const otherPaid = sum(transactions, "other");
  // Advances are tracked separately
  const advanceTotal = sum(transactions, ["advance_given", "advance_received"]);

  const remainingPrincipal = Math.max(0, Number(record.principal_amount) - principalPaid);

  const extrasPaidCount = transactions.filter((t) => t.transaction_type === "monthly_extra").length;
  const extraStart = record.monthly_extra_start_date ?? record.date_started;
  const hasExtra = Number(record.monthly_extra_amount) > 0 && remainingPrincipal > 0;
  const nextExtraDue = hasExtra ? addMonths(extraStart, extrasPaidCount) : null;

  let extraStatus: ExtraStatus = "none";
  if (nextExtraDue) {
    const today = todayISO();
    if (nextExtraDue === today) extraStatus = "due_today";
    else if (nextExtraDue < today) extraStatus = "overdue";
    else extraStatus = "upcoming";
  }

  return {
    record,
    transactions,
    principalPaid,
    extraPaid,
    otherPaid,
    advanceTotal,
    remainingPrincipal,
    extrasPaidCount,
    nextExtraDue,
    extraStatus,
    isSettled: remainingPrincipal <= 0,
  };
}

export function summariseAll(records: MoneyRecord[], transactions: Transaction[]) {
  return records.map((r) => summarise(r, transactions));
}

export type Totals = {
  owe: number;
  owed: number;
  monthlyExtraExpected: number;
  extraPaid: number;
  originalTaken: number;
  originalGiven: number;
  principalPaid: number;
  activeRecords: number;
};

export function computeTotals(summaries: RecordSummary[]): Totals {
  const t: Totals = {
    owe: 0,
    owed: 0,
    monthlyExtraExpected: 0,
    extraPaid: 0,
    originalTaken: 0,
    originalGiven: 0,
    principalPaid: 0,
    activeRecords: 0,
  };
  for (const s of summaries) {
    const active = !s.isSettled;
    if (active) t.activeRecords += 1;
    t.extraPaid += s.extraPaid;
    t.principalPaid += s.principalPaid;
    if (active) t.monthlyExtraExpected += Number(s.record.monthly_extra_amount);
    if (s.record.type === "taken") {
      t.originalTaken += Number(s.record.principal_amount);
      if (active) t.owe += s.remainingPrincipal;
    } else {
      t.originalGiven += Number(s.record.principal_amount);
      if (active) t.owed += s.remainingPrincipal;
    }
  }
  return t;
}

export function csvEscape(value: unknown) {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCSV(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]!);
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(",")),
  ].join("\n");
}

export function downloadFile(filename: string, content: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
