import { redirect } from "next/navigation";
import { getSignatureById } from "@/lib/data";

export const dynamic = "force-dynamic";

/** Per-signature layout editing is deprecated — design lives on global templates. */
export default async function EditSignatureRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const signature = await getSignatureById(id);
  if (!signature) {
    redirect("/admin");
  }
  redirect(`/admin/templates/${signature.template_id}/edit`);
}
