import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

// Root path redirects to default locale
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}
