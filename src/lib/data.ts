import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { MoneyRecord, Person, Transaction } from "./tracker";

const throwIf = <T>(res: { data: T | null; error: { message: string } | null }) => {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T;
};

async function currentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("You must be signed in.");
  return data.user.id;
}

export function usePeople() {
  return useQuery({
    queryKey: ["people"],
    queryFn: async () => {
      const user_id = await currentUserId();
      return throwIf<Person[]>(
        await supabase
          .from("people")
          .select("id,name,phone,notes,is_demo,created_at")
          .eq("user_id", user_id)
          .order("name", { ascending: true }),
      );
    },
  });
}

export function useRecords() {
  return useQuery({
    queryKey: ["money_records"],
    queryFn: async () => {
      const user_id = await currentUserId();
      return throwIf<MoneyRecord[]>(
        await supabase
          .from("money_records")
          .select("*")
          .eq("user_id", user_id)
          .order("date_started", { ascending: false }),
      );
    },
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const user_id = await currentUserId();
      return throwIf<Transaction[]>(
        await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user_id)
          .order("transaction_date", { ascending: false }),
      );
    },
  });
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

type Row = Record<string, unknown>;

export function useSaveRow(table: "people" | "money_records" | "transactions") {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string | undefined; values: Row }) => {
      const user_id = await currentUserId();
      if (id) {
        // Ensure updates are scoped to the authenticated user
        const { data, error } = await supabase
          .from(table)
          .update(values as never)
          .eq("id", id)
          .eq("user_id", user_id)
          .select()
          .single();
        if (error) throw new Error(error.message);
        return data;
      }
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
      const user_id = await currentUserId();
      const { error } = await supabase.from(table).delete().eq("id", id).eq("user_id", user_id);
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
