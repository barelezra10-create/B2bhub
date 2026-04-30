import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { DeleteButton } from "@/app/admin/_components/DeleteButton";
import { ComparisonEditForm } from "../_components/ComparisonForm";
import { updateComparisonAction, deleteComparisonAction } from "../actions";

export default async function EditComparisonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cmp = await db.comparison.findUnique({
    where: { slug },
    include: { vendorA: true, vendorB: true },
  });
  if (!cmp) notFound();

  return (
    <div>
      <AdminPageHeader
        title={`${cmp.vendorA.name} vs ${cmp.vendorB.name}`}
        description={`/compare/${cmp.slug}`}
        actions={
          <DeleteButton
            confirmMessage="Delete this comparison?"
            action={async () => {
              "use server";
              await deleteComparisonAction(cmp.id);
            }}
          />
        }
      />
      <ComparisonEditForm
        action={updateComparisonAction}
        initial={{
          id: cmp.id,
          slug: cmp.slug,
          hookCopy: cmp.hookCopy,
          summaryCopy: cmp.summaryCopy,
          verdictCopy: cmp.verdictCopy,
          isPublished: cmp.isPublished,
        }}
      />
    </div>
  );
}
