import { redirect } from "next/navigation";

// App Store requires a /support URL. Redirect to the contact page.
export default function SupportPage() {
  redirect("/contact");
}
