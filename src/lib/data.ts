import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { MoneyRecord, Person, Transaction } from "./tracker";

const throwIf = <T>(res: { data: T | null; error: { message: string } | null }) => {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T;
};

export function usePeople() {
  return useQuery({
    queryKey: ["people"],
    queryFn: async () =>
      throwIf<Person[]>(
        await supabase
          .from("people")
          .select("id,name,phone,notes,is_demo,created_at")
          .order("name", { ascending: true }),
      ),
  });
}

export function useRecords() {
  return useQuery({
    queryKey: ["money_records"],
    queryFn: async () =>
      throwIf<MoneyRecord[]>(
        await supabase
          .from("money_records")
          .select("*")
          .order("date_started", { ascending: false }),
      ),
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () =>
      throwIf<Transaction[]>(
        await supabase
          .from("transactions")
          .select("*")
          .order("transaction_date", { ascending: false }),
      ),
  });
}

export function useUser() {
  const query = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw new Error(error.message);
      return data.user;
    },
  });
  return { user: query.data ?? null, isLoading: query.isLoading };
}

export function useTracker() {
  const people = usePeople();
  const records = useRecords();
  const transactions = useTransactions();
  return {
    people: people.data ?? [],
    records: records.data ?? [],
    transactions: transactions.data ?? [],
    isLoading: people.isLoading || records.isLoading || transactions.isLoading,
    error: people.error || records.error || transactions.error,
    refetch: () => {
      void people.refetch();
      void records.refetch();
      void transactions.refetch();
    },
  };
}

export function useInvalidateAll() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["people"] });
    qc.invalidateQueries({ queryKey: ["money_records"] });
    qc.invalidateQueries({ queryKey: ["transactions"] });
  };
}

async function currentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("You must be signed in.");
  return data.user.id;
}

type Row = Record<string, unknown>;

export function useSaveRow(table: "people" | "money_records" | "transactions") {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string | undefined; values: Row }) => {
      if (id) {
        const { data, error } = await supabase
          .from(table)
          .update(values as never)
          .eq("id", id)
          .select()
          .single();
        if (error) throw new Error(error.message);
        return data;
      }
      const user_id = await currentUserId();
      const { data, error } = await supabase
        .from(table)
        .insert({ ...values, user_id } as never)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteRow(table: "people" | "money_records" | "transactions") {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });
}

export function useDemoData() {
  const invalidate = useInvalidateAll();
  const seed = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("seed_demo_data");
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("delete_demo_data");
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });
  return { seed, remove };
}
