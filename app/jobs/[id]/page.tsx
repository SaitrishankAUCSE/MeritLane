import { redirect } from "next/navigation";

export default async function RootJobDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/candidate/jobs/${id}`);
}
