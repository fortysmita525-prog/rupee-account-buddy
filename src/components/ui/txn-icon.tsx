import { DollarSign, CreditCard, Gift, RefreshCcw, PlusCircle, MinusCircle } from "lucide-react";
import type { TxnType } from "@/lib/tracker";

export function TxnIcon({ type, className = "size-5" }: { type: TxnType; className?: string }) {
  switch (type) {
    case "principal":
      return <MinusCircle className={className + " text-owe"} />;
    case "monthly_extra":
      return <CreditCard className={className + " text-muted-foreground"} />;
    case "advance_given":
      return <Gift className={className + " text-owed"} />;
    case "advance_received":
      return <Gift className={className + " text-owe"} />;
    case "principal_adjustment":
      return <RefreshCcw className={className + " text-primary"} />;
    case "extra_adjustment":
      return <RefreshCcw className={className + " text-primary"} />;
    default:
      return <DollarSign className={className} />;
  }
}
