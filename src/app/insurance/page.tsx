import type { Metadata } from "next";
import { InsurancePage } from "./InsurancePage";

export const metadata: Metadata = {
  title: "Event Insurance | Lawnbowling",
  description:
    "Protect yourself with affordable per-event liability insurance for lawn bowling. Powered by Daily Event Insurance.",
};

export default function Page() {
  return <InsurancePage />;
}
