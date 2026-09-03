import { redirect } from "next/navigation";

export default function RootJobsRedirect() {
  redirect("/candidate/jobs");
}
