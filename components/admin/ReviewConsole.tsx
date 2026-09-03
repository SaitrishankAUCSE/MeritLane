import React from "react";
import { Button } from "@/components/ui/Button";
import { ProofTrace } from "@/components/ui/ProofTrace";
import { ProofSignal } from "@/components/ui/ProofSignal";
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Code, FileText, ExternalLink, Clock } from "lucide-react";
import { StatusMark } from "@/components/proof/StatusMark";

export function ReviewConsole({
  queueCandidates,
  selectedCandidate,
  setSelectedCandidate,
  actionType,
  setActionType,
  actionReason,
  setActionReason,
  actionLoading,
  handleExecuteAction,
  FEEDBACK_PRESETS,
}: any) {
  const [runningAudit, setRunningAudit] = React.useState(false);

  const handleAutomatedAudit = () => {
    if (!selectedCandidate) return;
    setRunningAudit(true);
    
    // Simulate heuristic AI processing
    setTimeout(() => {
      let report = "SYSTEM AUDIT REPORT\n-------------------\n";
      const c = selectedCandidate;
      const gh = c.githubEvidence;
      const hasGh = gh && gh.totalCommits > 10;
      const scores = c.assessmentScores;
      const passedTest = scores && scores.passed === true;
      const hasProjects = c.projects && c.projects.length > 0;

      if (hasGh) {
        report += `✓ Verified GitHub: ${gh.totalCommits} commits across ${gh.repoCount} repositories.\n`;
      } else {
        report += `✗ Insufficient or missing GitHub evidence.\n`;
      }

      if (passedTest) {
        report += `✓ Technical Assessment: Passed (${scores.score} points).\n`;
      } else {
        report += `✗ Technical Assessment: Not passed or not taken.\n`;
      }

      if (hasProjects) {
        report += `✓ Portfolio: Contains ${c.projects.length} project artifacts.\n`;
      } else {
        report += `✗ Portfolio: Missing project artifacts.\n`;
      }

      report += "\nRECOMMENDATION: ";

      if (hasGh && passedTest && hasProjects) {
        report += "Highly Qualified. Verify object.";
        setActionType("verified");
      } else if (!passedTest) {
        report += "Does not meet technical bar. Reject object.";
        setActionType("rejected");
      } else {
        report += "Incomplete portfolio evidence. Request changes.";
        setActionType("changes_required");
      }

      setActionReason(report);
      setRunningAudit(false);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[80vh]">
      {/* ZONE 1: REVIEW QUEUE (Col 1-3) */}
      <div className="lg:col-span-3 border border-border bg-surface flex flex-col max-h-[300px] lg:max-h-none h-full overflow-hidden">
        <div className="p-4 border-b border-border bg-surface-low">
          <h2 className="font-label text-muted-foreground uppercase tracking-widest text-xs">Review Queue</h2>
          <p className="text-[10px] text-muted-foreground mt-1 font-data">{queueCandidates.length} Pending</p>
        </div>
        <div className="overflow-y-auto flex-1">
          {queueCandidates.length === 0 ? (
            <div className="p-8 text-center text-[#737373] font-sans text-sm">Queue is clear</div>
          ) : (
            queueCandidates.map((c: any) => (
              <button
                key={c.uid}
                onClick={() => setSelectedCandidate(c)}
                className={`w-full text-left p-4 border-b border-border transition-colors ${
                  selectedCandidate?.uid === c.uid ? "bg-surface-low border-l-2 border-l-foreground" : "hover:bg-surface-low/50 border-l-2 border-l-transparent"
                }`}
              >
                <div className="font-serif text-lg font-medium text-foreground">{c.name}</div>
                <div className="font-data text-xs text-muted-foreground uppercase mt-1">{c.branch}</div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ZONE 2: CANDIDATE EVIDENCE (Col 4-9) */}
      <div className="lg:col-span-6 border border-border bg-surface flex flex-col h-full overflow-hidden relative">
        {selectedCandidate ? (
          <>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-foreground/20 to-transparent"></div>
            <div className="p-6 border-b border-border bg-surface-low">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-serif text-3xl font-medium tracking-tight text-foreground">{selectedCandidate.name}</h2>
                  <p className="font-data text-sm text-muted-foreground mt-1 uppercase">ID: {selectedCandidate.uid.slice(0,8)} • {selectedCandidate.college}</p>
                </div>
                <ProofTrace 
                  status={selectedCandidate.verificationStatus} 
                  assessmentScores={selectedCandidate.assessmentScores} 
                  assessmentDate={selectedCandidate.assessmentDate}
                  candidateName={selectedCandidate.name}
                  size="sm"
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-8">
              
              <section>
                <h3 className="font-label text-muted-foreground uppercase text-xs mb-4">Core Competencies</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skills?.map((s: string) => (
                    <span key={s} className="px-2.5 py-1 bg-surface-low border border-border text-xs font-data font-bold text-foreground">{s}</span>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="font-label text-muted-foreground uppercase text-xs mb-4">External Artifacts</h3>
                <div className="flex gap-4">
                  {selectedCandidate.githubUrl && (
                    <a href={selectedCandidate.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold font-data bg-surface-low border border-border px-3 py-2 hover:bg-surface transition-colors">
                      <Code className="h-4 w-4" /> GitHub
                    </a>
                  )}
                  {selectedCandidate.resumeUrl && (
                    <a href={selectedCandidate.resumeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold font-data bg-surface-low border border-border px-3 py-2 hover:bg-surface transition-colors">
                      <FileText className="h-4 w-4" /> Resume
                    </a>
                  )}
                </div>
              </section>

              <section>
                <h3 className="font-label text-muted-foreground uppercase text-xs mb-4">Project Evidence</h3>
                {selectedCandidate.projects?.length > 0 ? (
                  <div className="space-y-4">
                    {selectedCandidate.projects.map((proj: any, idx: number) => (
                      <div key={idx} className="border border-border p-4 bg-surface-low/50 relative">
                        <div className="absolute top-0 left-0 w-[2px] h-full bg-border"></div>
                        <h4 className="font-serif text-xl font-medium text-foreground mb-2">{proj.title}</h4>
                        <p className="text-sm text-muted-foreground mb-4">{proj.description}</p>
                        <div className="flex gap-3">
                          {proj.repoUrl && <a href={proj.repoUrl} target="_blank" rel="noreferrer" className="text-xs font-bold font-data text-muted-foreground hover:text-foreground">Source ↗</a>}
                          {proj.liveUrl && <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-xs font-bold font-data text-accent hover:text-[#064E3B]">Demo ↗</a>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-data text-muted-foreground italic">No projects provided.</p>
                )}
              </section>

            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#737373] font-sans text-sm">
            Select a candidate from the queue to inspect evidence
          </div>
        )}
      </div>

      {/* ZONE 3: DECISION CONSOLE (Col 10-12) */}
      <div className="lg:col-span-3 border border-border bg-surface flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-border bg-surface-low">
          <h2 className="font-label text-muted-foreground uppercase tracking-widest text-xs">Decision Console</h2>
        </div>
        <div className="flex-1 p-4 flex flex-col justify-end space-y-4">
          {selectedCandidate ? (
            <>
              {!actionType ? (
                <>
                  <div className="mb-4 bg-surface-low p-4 border border-border rounded-lg">
                    <p className="text-xs text-muted-foreground mb-3 font-sans">Run a quick automated pass over candidate artifacts to generate a baseline recommendation.</p>
                    <Button 
                      className="w-full justify-center bg-[#FAF8F5] hover:bg-white text-[#1C1917] border border-[#E7E2DA]" 
                      onClick={handleAutomatedAudit}
                      disabled={runningAudit}
                    >
                      {runningAudit ? "Running checks..." : "Run Automated Checks"}
                    </Button>
                  </div>
                  
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-border"></div>
                    <span className="flex-shrink-0 mx-4 text-muted-foreground text-[10px] uppercase font-bold tracking-widest">Manual Override</span>
                    <div className="flex-grow border-t border-border"></div>
                  </div>

                  <Button variant="success" className="w-full justify-start" leftIcon={<ShieldCheck className="h-4 w-4" />} onClick={() => { setActionType("verified"); setActionReason("Standard verification approval."); }}>
                    Verify Object
                  </Button>
                  <Button variant="secondary" className="w-full justify-start" leftIcon={<AlertTriangle className="h-4 w-4" />} onClick={() => setActionType("changes_required")}>
                    Request Changes
                  </Button>
                  <Button variant="danger" className="w-full justify-start" leftIcon={<XCircle className="h-4 w-4" />} onClick={() => setActionType("rejected")}>
                    Reject Object
                  </Button>
                </>
              ) : (
                <div className="space-y-3 animate-in slide-in-from-bottom-2">
                  <label className="text-xs font-bold font-data uppercase tracking-widest text-foreground">
                    {actionType === "verified" ? "Verification Audit Summary" : actionType === "changes_required" ? "Required Changes" : "Rejection Reason"}
                  </label>
                  <textarea 
                    value={actionReason} 
                    onChange={e => setActionReason(e.target.value)}
                    className="w-full bg-surface-low border border-border p-3 text-sm font-data text-foreground h-32 focus:border-foreground focus:outline-none"
                    placeholder="Enter audit findings..."
                  />
                  <div className="flex flex-wrap gap-1 mb-2">
                    {FEEDBACK_PRESETS.map((p: string, i: number) => (
                      <button key={i} onClick={() => setActionReason(p)} className="text-[10px] bg-surface-low border border-border px-2 py-1 text-left hover:bg-surface">
                        {p.substring(0,25)}...
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => setActionType(null)}>Cancel</Button>
                    <Button variant="primary" size="sm" className="flex-1" loading={actionLoading} onClick={() => handleExecuteAction()}>Commit</Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-sm font-sans text-[#737373] mb-4">
              Decision actions locked
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

