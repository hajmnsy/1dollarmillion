import { LegalPage } from "@/components/landing/LegalPage";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Page({ params }: Props) {
  return <LegalPage params={params} pageKey="docs" />;
}
