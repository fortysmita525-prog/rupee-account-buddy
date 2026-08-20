import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDeleteRow, useSaveRow, useTracker } from "@/lib/data";
import { inr, parseAmount, todayISO } from "@/lib/money";
import {
  MONEY_TYPE_LABEL,
  REPAYMENT_LABEL,
  TXN_LABEL,
  summarise,
  type MoneyRecord,
  type MoneyType,
  type Person,
  type Transaction,
  type TxnType,
} from "@/lib/tracker";

type PaymentSeed = { recordId?: string; personId?: string; type?: TxnType };

type ConfirmSeed = {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
};

type Ctx = {
  addPerson: (person?: Person) => void;
  addRecord: (type: MoneyType, personId?: string) => void;
  editRecord: (record: MoneyRecord) => void;
  markDemanded: (record: MoneyRecord) => void;
  recordPayment: (seed?: PaymentSeed) => void;
  editTransaction: (txn: Transaction) => void;
  confirmDelete: (seed: ConfirmSeed) => void;
  deletePerson: (person: Person) => void;
  deleteRecord: (record: MoneyRecord) => void;
  deleteTransaction: (txn: Transaction) => void;
};

const DialogsContext = createContext<Ctx | null>(null);

export const useDialogs = () => {
  const ctx = useContext(DialogsContext);
  if (!ctx) throw new Error("useDialogs must be used inside TrackerDialogsProvider");
  return ctx;
};

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function TrackerDialogsProvider({ children }: { children: ReactNode }) {
  const { people, records, transactions } = useTracker();
  const navigate = useNavigate();

  const [personOpen, setPersonOpen] = useState(false);
  const [personEdit, setPersonEdit] = useState<Person | null>(null);
  const [personForm, setPersonForm] = useState({ name: "", phone: "", notes: "" });

  const [recordOpen, setRecordOpen] = useState(false);
  const [recordEdit, setRecordEdit] = useState<MoneyRecord | null>(null);
  const emptyRecord = {
    type: "taken" as MoneyType,
    person_id: "",
    principal_amount: "",
    date_started: todayISO(),
    monthly_extra_amount: "",
    monthly_extra_start_date: todayISO(),
    principal_repayment_condition: "on_demand",
    principal_due_date: "",
    notes: "",
  };
  const [recordForm, setRecordForm] = useState(emptyRecord);

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [txnEdit, setTxnEdit] = useState<Transaction | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    transaction_type: "monthly_extra" as TxnType,
    person_id: "",
    money_record_id: "",
    amount: "",
    transaction_date: todayISO(),
    notes: "",
  });

  const [demandOpen, setDemandOpen] = useState(false);
  const [demandRecord, setDemandRecord] = useState<MoneyRecord | null>(null);
  const [demandForm, setDemandForm] = useState({ date: todayISO(), note: "" });

  const [confirm, setConfirm] = useState<ConfirmSeed | null>(null);

  const savePerson = useSaveRow("people");
  const saveRecord = useSaveRow("money_records");
  const saveTxn = useSaveRow("transactions");
  const delPerson = useDeleteRow("people");
  const delRecord = useDeleteRow("money_records");
  const delTxn = useDeleteRow("transactions");

  const addPerson = useCallback((person?: Person) => {
    setPersonEdit(person ?? null);
    setPersonForm({
      name: person?.name ?? "",
      phone: person?.phone ?? "",
      notes: person?.notes ?? "",
    });
    setPersonOpen(true);
  }, []);

  const addRecord = useCallback(
    (type: MoneyType, personId?: string) => {
      setRecordEdit(null);
      setRecordForm({ ...emptyRecord, type, person_id: personId ?? "" });
      setRecordOpen(true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const editRecord = useCallback((record: MoneyRecord) => {
    setRecordEdit(record);
    setRecordForm({
      type: record.type,
      person_id: record.person_id,
      principal_amount: String(record.principal_amount),
      date_started: record.date_started,
      monthly_extra_amount: String(record.monthly_extra_amount ?? 0),
      monthly_extra_start_date: record.monthly_extra_start_date ?? record.date_started,
      principal_repayment_condition: record.principal_repayment_condition,
      principal_due_date: record.principal_due_date ?? "",
      notes: record.notes ?? "",
    });
    setRecordOpen(true);
  }, []);

  const recordPayment = useCallback((seed?: PaymentSeed) => {
    setTxnEdit(null);
    const rec = seed?.recordId;
    setPaymentForm({
      transaction_type: seed?.type ?? "monthly_extra",
      person_id: seed?.personId ?? "",
      money_record_id: rec ?? "",
      amount: "",
      transaction_date: todayISO(),
      notes: "",
    });
    setPaymentOpen(true);
  }, []);

  const editTransaction = useCallback((txn: Transaction) => {
    setTxnEdit(txn);
    setPaymentForm({
      transaction_type: txn.transaction_type,
      person_id: txn.person_id,
      money_record_id: txn.money_record_id,
      amount: String(txn.amount),
      transaction_date: txn.transaction_date,
      notes: txn.notes ?? "",
    });
    setPaymentOpen(true);
  }, []);

  const markDemanded = useCallback((record: MoneyRecord) => {
    setDemandRecord(record);
    setDemandForm({ date: record.principal_demand_date ?? todayISO(), note: record.demand_note ?? "" });
    setDemandOpen(true);
  }, []);

  const confirmDelete = useCallback((seed: ConfirmSeed) => setConfirm(seed), []);

  const value = useMemo<Ctx>(
    () => ({
      addPerson,
      addRecord,
      editRecord,
      markDemanded,
      recordPayment,
      editTransaction,
      confirmDelete,
      deletePerson: (person) =>
        confirmDelete({
          title: `Delete ${person.name}?`,
          description:
            "This will permanently remove this person, all of their money records and every related transaction. This cannot be undone.",
          confirmLabel: "Delete person",
          onConfirm: async () => {
            await delPerson.mutateAsync(person.id);
            toast.success("Person deleted");
          },
        }),
      deleteRecord: (record) =>
        confirmDelete({
          title: "Delete this money record?",
          description:
            "This will permanently remove this financial record and its transaction history. This cannot be undone.",
          confirmLabel: "Delete record",
          onConfirm: async () => {
            await delRecord.mutateAsync(record.id);
            toast.success("Record deleted");
          },
        }),
      deleteTransaction: (txn) =>
        confirmDelete({
          title: "Delete this transaction?",
          description: `This will permanently remove the ${TXN_LABEL[txn.transaction_type].toLowerCase()} of ${inr(txn.amount)} and recalculate the balances.`,
          confirmLabel: "Delete transaction",
          onConfirm: async () => {
            await delTxn.mutateAsync(txn.id);
            toast.success("Transaction deleted");
          },
        }),
    }),
    [
      addPerson,
      addRecord,
      editRecord,
      markDemanded,
      recordPayment,
      editTransaction,
      confirmDelete,
      delPerson,
      delRecord,
      delTxn,
    ],
  );

  const personRecords = records.filter(
    (r) => !paymentForm.person_id || r.person_id === paymentForm.person_id,
  );
  const selectedRecord = records.find((r) => r.id === paymentForm.money_record_id) ?? null;
  const selectedSummary = selectedRecord ? summarise(selectedRecord, transactions) : null;

  async function submitPerson() {
    if (!personForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const saved = (await savePerson.mutateAsync({
      id: personEdit?.id,
      values: {
        name: personForm.name.trim(),
        phone: personForm.phone.trim() || null,
        notes: personForm.notes.trim() || null,
      },
    })) as { id: string };
    setPersonOpen(false);
    toast.success(personEdit ? "Person updated" : "Person added");
    if (!personEdit) navigate({ to: "/people/$personId", params: { personId: saved.id } });
  }

  async function submitRecord() {
    const principal = parseAmount(recordForm.principal_amount);
    if (!recordForm.person_id) {
      toast.error("Choose a person");
      return;
    }
    if (principal <= 0) {
      toast.error("Principal amount must be greater than zero");
      return;
    }
    if (!recordForm.date_started) {
      toast.error("Date is required");
      return;
    }
    const extra = parseAmount(recordForm.monthly_extra_amount);
    if (extra < 0) {
      toast.error("Monthly extra cannot be negative");
      return;
    }
    if (
      recordForm.principal_repayment_condition === "specific_date" &&
      !recordForm.principal_due_date
    ) {
      toast.error("Choose the specific repayment date");
      return;
    }

    await saveRecord.mutateAsync({
      id: recordEdit?.id,
      values: {
        person_id: recordForm.person_id,
        type: recordForm.type,
        principal_amount: principal,
        date_started: recordForm.date_started,
        monthly_extra_amount: extra,
        monthly_extra_start_date: extra > 0 ? recordForm.monthly_extra_start_date || recordForm.date_started : null,
        principal_repayment_condition: recordForm.principal_repayment_condition,
        principal_due_date:
          recordForm.principal_repayment_condition === "specific_date"
            ? recordForm.principal_due_date
            : null,
        notes: recordForm.notes.trim() || null,
      },
    });
    setRecordOpen(false);
    toast.success(recordEdit ? "Record updated" : `${MONEY_TYPE_LABEL[recordForm.type]} saved`);
  }

  async function submitPayment(force = false) {
    const amount = parseAmount(paymentForm.amount);
    if (!paymentForm.money_record_id) {
      toast.error("Choose a money record");
      return;
    }
    if (amount <= 0) {
      toast.error("Amount must be greater than zero");
      return;
    }
    if (!paymentForm.transaction_date) {
      toast.error("Date is required");
      return;
    }

    const record = records.find((r) => r.id === paymentForm.money_record_id);
    if (!record) {
      toast.error("Record not found");
      return;
    }

    if (paymentForm.transaction_type === "principal_payment" && !force) {
      const s = summarise(record, transactions.filter((t) => t.id !== txnEdit?.id));
      if (amount > s.remainingPrincipal) {
        setConfirm({
          title: "Payment exceeds remaining principal",
          description: `Remaining principal is ${inr(s.remainingPrincipal)} but you entered ${inr(amount)}. The remaining principal will be capped at ₹0 and will never go negative. Continue?`,
          confirmLabel: "Yes, record it",
          onConfirm: () => {
            void submitPayment(true);
          },
        });
        return;
      }
    }

    await saveTxn.mutateAsync({
      id: txnEdit?.id,
      values: {
        money_record_id: record.id,
        person_id: record.person_id,
        transaction_type: paymentForm.transaction_type,
        amount,
        transaction_date: paymentForm.transaction_date,
        notes: paymentForm.notes.trim() || null,
      },
    });

    // Keep the demand status in step with the principal balance.
    if (paymentForm.transaction_type === "principal_payment") {
      const after = summarise(record, [
        ...transactions.filter((t) => t.id !== txnEdit?.id),
        {
          id: "temp",
          money_record_id: record.id,
          person_id: record.person_id,
          transaction_type: "principal_payment",
          amount,
          transaction_date: paymentForm.transaction_date,
          notes: null,
          is_demo: false,
          created_at: new Date().toISOString(),
        },
      ]);
      const next =
        after.remainingPrincipal <= 0
          ? "fully_paid"
          : record.principal_demand_status === "demanded" || record.principal_demand_status === "partially_paid"
            ? "partially_paid"
            : record.principal_demand_status;
      if (next !== record.principal_demand_status) {
        await saveRecord.mutateAsync({ id: record.id, values: { principal_demand_status: next } });
      }
    }

    setPaymentOpen(false);
    toast.success(
      paymentForm.transaction_type === "monthly_extra"
        ? "Monthly extra recorded — principal unchanged"
        : "Payment recorded",
    );
  }

  async function submitDemand() {
    if (!demandRecord) return;
    await saveRecord.mutateAsync({
      id: demandRecord.id,
      values: {
        principal_demand_status: "demanded",
        principal_demand_date: demandForm.date,
        demand_note: demandForm.note.trim() || null,
      },
    });
    setDemandOpen(false);
    toast.success("Principal marked as demanded");
  }

  const personName = (id: string) => people.find((p) => p.id === id)?.name ?? "Unknown";

  return (
    <DialogsContext.Provider value={value}>
      {children}

      {/* Person */}
      <Dialog open={personOpen} onOpenChange={setPersonOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{personEdit ? "Edit Person" : "Add Person"}</DialogTitle>
            <DialogDescription>People can hold several separate money records.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Field label="Name *">
              <Input
                value={personForm.name}
                onChange={(e) => setPersonForm({ ...personForm, name: e.target.value })}
                placeholder="e.g. Rahul"
              />
            </Field>
            <Field label="Phone">
              <Input
                value={personForm.phone}
                onChange={(e) => setPersonForm({ ...personForm, phone: e.target.value })}
                placeholder="Optional"
              />
            </Field>
            <Field label="Notes">
              <Textarea
                value={personForm.notes}
                onChange={(e) => setPersonForm({ ...personForm, notes: e.target.value })}
                placeholder="Optional"
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPersonOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitPerson} disabled={savePerson.isPending}>
              Save person
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Money record */}
      <Dialog open={recordOpen} onOpenChange={setRecordOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {recordForm.type === "taken" ? "Money Taken From Someone" : "Money Given To Someone"}
            </DialogTitle>
            <DialogDescription>
              {recordForm.type === "taken"
                ? "They gave you money — you owe this principal."
                : "You gave your money — they owe you this principal."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Person *">
                <div className="flex gap-2">
                  <Select
                    value={recordForm.person_id}
                    onValueChange={(v) => setRecordForm({ ...recordForm, person_id: v })}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Choose a person" />
                    </SelectTrigger>
                    <SelectContent>
                      {people.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={() => addPerson()}>
                    New
                  </Button>
                </div>
              </Field>
            </div>
            <Field label="Principal amount (₹) *">
              <Input
                inputMode="decimal"
                value={recordForm.principal_amount}
                onChange={(e) => setRecordForm({ ...recordForm, principal_amount: e.target.value })}
                placeholder="50000"
              />
            </Field>
            <Field label={recordForm.type === "taken" ? "Date taken *" : "Date given *"}>
              <Input
                type="date"
                value={recordForm.date_started}
                onChange={(e) => setRecordForm({ ...recordForm, date_started: e.target.value })}
              />
            </Field>
            <Field label="Monthly extra (₹)" hint="Kept fully separate from principal.">
              <Input
                inputMode="decimal"
                value={recordForm.monthly_extra_amount}
                onChange={(e) =>
                  setRecordForm({ ...recordForm, monthly_extra_amount: e.target.value })
                }
                placeholder="1000"
              />
            </Field>
            <Field label="Monthly extra start date">
              <Input
                type="date"
                value={recordForm.monthly_extra_start_date}
                onChange={(e) =>
                  setRecordForm({ ...recordForm, monthly_extra_start_date: e.target.value })
                }
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Principal repayment condition">
                <Select
                  value={recordForm.principal_repayment_condition}
                  onValueChange={(v) =>
                    setRecordForm({ ...recordForm, principal_repayment_condition: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(REPAYMENT_LABEL).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            {recordForm.principal_repayment_condition === "specific_date" ? (
              <Field label="Repayment date *">
                <Input
                  type="date"
                  value={recordForm.principal_due_date}
                  onChange={(e) =>
                    setRecordForm({ ...recordForm, principal_due_date: e.target.value })
                  }
                />
              </Field>
            ) : null}
            <div className="sm:col-span-2">
              <Field label="Notes">
                <Textarea
                  value={recordForm.notes}
                  onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                  placeholder="Optional"
                />
              </Field>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRecordOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitRecord} disabled={saveRecord.isPending}>
              {recordEdit ? "Save changes" : "Save record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{txnEdit ? "Edit Transaction" : "Record Payment"}</DialogTitle>
            <DialogDescription>
              Monthly extra payments never reduce the principal.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Payment type">
                <Select
                  value={paymentForm.transaction_type}
                  onValueChange={(v) =>
                    setPaymentForm({ ...paymentForm, transaction_type: v as TxnType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TXN_LABEL).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Person">
              <Select
                value={paymentForm.person_id}
                onValueChange={(v) =>
                  setPaymentForm({ ...paymentForm, person_id: v, money_record_id: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All people" />
                </SelectTrigger>
                <SelectContent>
                  {people.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Money record *">
              <Select
                value={paymentForm.money_record_id}
                onValueChange={(v) => setPaymentForm({ ...paymentForm, money_record_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose record" />
                </SelectTrigger>
                <SelectContent>
                  {personRecords.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {personName(r.person_id)} · {MONEY_TYPE_LABEL[r.type]} · {inr(r.principal_amount)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Amount (₹) *">
              <Input
                inputMode="decimal"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                placeholder="1000"
              />
            </Field>
            <Field label="Date *">
              <Input
                type="date"
                value={paymentForm.transaction_date}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, transaction_date: e.target.value })
                }
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Notes">
                <Textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="Optional"
                />
              </Field>
            </div>
            {selectedSummary ? (
              <div className="rounded-xl bg-muted p-3 text-xs text-muted-foreground sm:col-span-2">
                Current values — Original principal{" "}
                <b className="text-foreground">{inr(selectedSummary.record.principal_amount)}</b>,
                remaining{" "}
                <b className="text-foreground">{inr(selectedSummary.remainingPrincipal)}</b>, extra
                paid <b className="text-foreground">{inr(selectedSummary.extraPaid)}</b>.
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPaymentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => submitPayment()} disabled={saveTxn.isPending}>
              {txnEdit ? "Save changes" : "Record payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Demand */}
      <Dialog open={demandOpen} onOpenChange={setDemandOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Principal as Demanded</DialogTitle>
            <DialogDescription>
              {demandRecord
                ? `${personName(demandRecord.person_id)} · ${MONEY_TYPE_LABEL[demandRecord.type]}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Field label="Demand date">
              <Input
                type="date"
                value={demandForm.date}
                onChange={(e) => setDemandForm({ ...demandForm, date: e.target.value })}
              />
            </Field>
            <Field label="Note">
              <Textarea
                value={demandForm.note}
                onChange={(e) => setDemandForm({ ...demandForm, note: e.target.value })}
                placeholder="Optional"
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDemandOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitDemand}>Mark as demanded</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm */}
      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm?.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirm?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                const c = confirm;
                setConfirm(null);
                await c?.onConfirm();
              }}
            >
              {confirm?.confirmLabel ?? "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DialogsContext.Provider>
  );
}
