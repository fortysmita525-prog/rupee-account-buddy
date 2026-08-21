import { DollarSign, CreditCard, Gift, RefreshCcw, PlusCircle, MinusCircle } from "lucide-react";
import type { TxnType } from "@/lib/tracker";

export function TxnIcon({ type, className = "size-5" }: { type: TxnType; className?: string }) {
  const base = className + " sci-txn-icon";
  switch (type) {
    case "principal":
      return <MinusCircle className={base + " sci-principal"} />;
    case "monthly_extra":
      return <CreditCard className={base + " sci-extra"} />;
    case "advance_given":
      return <Gift className={base + " sci-advance-given"} />;
    case "advance_received":
      return <Gift className={base + " sci-advance-received"} />;
    case "principal_adjustment":
      return <RefreshCcw className={base + " sci-adjust"} />;
    case "extra_adjustment":
      return <RefreshCcw className={base + " sci-adjust"} />;
    default:
      return <DollarSign className={base + " sci-other"} />;
  }
}
