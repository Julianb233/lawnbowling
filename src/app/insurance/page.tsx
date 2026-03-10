import type { Metadata } from "next";
import { InsurancePage } from "./InsurancePage";

export const metadata: Metadata = {
  title: "Event Insurance | Pick a Partner",
  description:
    "Protect yourself with affordable per-event liability insurance for pickleball, tennis, lawn bowling, and more. Powered by Daily Event Insurance.",
};

export default function Page() {
  return <InsurancePage />;
}
