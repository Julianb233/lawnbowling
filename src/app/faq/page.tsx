import type { Metadata } from "next";
import { getFAQSchema, jsonLd } from "@/lib/schema";
import { FaqPage } from "./FaqPage";

export const metadata: Metadata = {
  title: "FAQ | Lawnbowling",
  description:
    "Frequently asked questions about Lawnbowling — the real-time player board for recreational sports. Get answers about playing, insurance, venues, and more.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "FAQ | Lawnbowling",
    description:
      "Frequently asked questions about Lawnbowling — the real-time player board for recreational sports.",
    url: "https://lawnbowl.app/faq",
    type: "website",
  },
};

const faqItems = [
  { question: "What is Lawnbowling?", answer: "Lawnbowling is a real-time digital player board for recreational sports at community venues. It replaces the traditional clipboard sign-up sheet, letting you check in, find partners, and get matched to courts — all from your phone or the venue kiosk." },
  { question: "Is Lawnbowling free for players?", answer: "Yes. Lawnbowling is completely free for players. You can check in, browse available players, send partner requests, and get assigned to courts at no cost." },
  { question: "Do I need to download an app?", answer: "No. Lawnbowling is a Progressive Web App (PWA). Just visit the site on your phone's browser and tap 'Add to Home Screen' for an app-like experience." },
  { question: "What sports are supported?", answer: "Currently supported: pickleball, tennis, lawn bowling, badminton, racquetball, and flag football. We're actively adding more sports based on venue and player requests." },
  { question: "How much does it cost for venues?", answer: "We offer a free Starter tier (up to 4 courts), a Pro tier at $49/month (unlimited courts, analytics, insurance revenue share), and custom Enterprise pricing for multi-location organizations." },
  { question: "What is Daily Event Insurance?", answer: "Daily Event Insurance provides per-participant liability coverage for recreational sports. It fills gaps in general liability policies that protect only employees, not participants." },
];

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(getFAQSchema(faqItems)) }}
      />
      <FaqPage />
    </>
  );
}
