"use client";

import { FormEvent, useState } from "react";
import { BriefcaseBusiness, Check, ChevronDown, Plus, Search, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { TagInput } from "@/components/ui/TagInput";
import { useAuth } from "@/lib/auth/AuthContext";

type Tab = "candidates" | "role";

type JobPosting = {
  id: string;
  title: string;
  department: string;
  skills: string[];
  experienceLevel: string;
};

export default function EmployerDashboardPage() {
  const { loading, profileLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("candidates");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState("Early career");
  const [roles, setRoles] = useState<JobPosting[]>([]);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  if (loading || profileLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><div className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" /></div>;
  }

  function submitRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !department.trim() || skills.length === 0) {
      setError("Add a role title, department, and at least one required skill.");
      return;
    }
    setRoles((current) => [{ id: crypto.randomUUID(), title: title.trim(), department: department.trim(), skills, experienceLevel: experience }, ...current]);
    setTitle(""); setDepartment(""); setSkills([]); setError(""); setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  }

  return (
    <main className="min-h-screen bg-background pb-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Employer workspace</p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Hiring overview</h1>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">Review candidates with verified technical evidence and define the roles your team needs.</p>
          </div>
          <div className="flex rounded-lg border border-border bg-card p-1" role="tablist" aria-label="Employer dashboard sections">
            <button type="button" role="tab" aria-selected={tab === "candidates"} onClick={() => setTab("candidates")} className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${tab === "candidates" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Browse Candidates</button>
            <button type="button" role="tab" aria-selected={tab === "role"} onClick={() => setTab("role")} className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${tab === "role" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Post a Role</button>
          </div>
        </header>

        {tab === "candidates" ? (
          <section className="flex flex-col gap-6" aria-labelledby="candidates-heading">
            <div className="flex items-center justify-between gap-4"><div><h2 id="candidates-heading" className="text-lg font-semibold text-foreground">Verified candidate pool</h2><p className="mt-1 text-sm text-muted-foreground">Candidates appear here after the assessment program is live.</p></div><Button variant="outline" size="sm" onClick={() => setTab("role")}><Plus data-icon="inline-start" /> Post a role</Button></div>
            <EmptyState icon={<Search className="size-5 text-muted-foreground" />} title="Verified candidates will appear here once assessments go live" description="There are no candidate profiles to review yet. Post a role to clarify the signal you are hiring for, and we will surface verified profiles when they become available." action={undefined} />
          </section>
        ) : (
          <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.75fr)]" aria-labelledby="role-heading">
            <Card>
              <CardHeader><div className="flex items-start gap-3"><span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary"><BriefcaseBusiness className="size-4" /></span><div><h2 id="role-heading" className="text-lg font-semibold text-foreground">Post a role</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Define the requirements that will guide candidate matching.</p></div></div></CardHeader>
              <CardContent><form onSubmit={submitRole} className="flex flex-col gap-6" noValidate>
                {error && <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">{error}</p>}
                <Input label="Role title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Backend Engineer" aria-invalid={Boolean(error && !title)} />
                <Input label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Platform Engineering" aria-invalid={Boolean(error && !department)} />
                <TagInput label="Required skills" tags={skills} onChange={setSkills} placeholder="Add a skill and press Enter" helperText="Use the technologies that are essential to the role." />
                <div className="flex flex-col gap-2"><label htmlFor="experience" className="text-sm font-medium text-foreground">Experience level</label><div className="relative"><select id="experience" value={experience} onChange={(e) => setExperience(e.target.value)} className="w-full appearance-none rounded-md border border-border bg-card px-3 py-2.5 pr-9 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"><option>Early career</option><option>Mid-level</option><option>Senior</option><option>Lead / Staff</option></select><ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground" /></div></div>
                <div className="flex items-center justify-between gap-3 border-t border-border pt-5"><p className="text-sm text-muted-foreground">You can update these requirements later.</p><Button type="submit"><Check data-icon="inline-start" /> Publish role</Button></div>
                {saved && <p className="text-sm text-emerald-700" role="status">Role added to this workspace.</p>}
              </form></CardContent>
            </Card>
            <Card><CardHeader><h2 className="text-base font-semibold text-foreground">Previously posted roles</h2><p className="mt-1 text-sm text-muted-foreground">Your role history will be listed here.</p></CardHeader><CardContent>{roles.length === 0 ? <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-border px-5 py-10 text-center"><BriefcaseBusiness className="size-5 text-muted-foreground" /><p className="text-sm font-medium text-foreground">No roles posted yet</p><p className="max-w-xs text-sm leading-6 text-muted-foreground">Published roles will appear here for reference.</p></div> : <div className="flex flex-col divide-y divide-border">{roles.map((role) => <article key={role.id} className="flex flex-col gap-3 py-4 first:pt-0"><div><h3 className="font-medium text-foreground">{role.title}</h3><p className="mt-1 text-sm text-muted-foreground">{role.department} · {role.experienceLevel}</p></div><div className="flex flex-wrap gap-1.5">{role.skills.map((skill) => <Badge key={skill}>{skill}</Badge>)}</div></article>)}</div>}</CardContent></Card>
          </section>
        )}
      </div>
    </main>
  );
}
