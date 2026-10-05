"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { auth } from "@/lib/firebase/config";
import { 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Save,
  Trash2
} from "lucide-react";

export default function AdminQuestionsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"mcq" | "coding">("mcq");
  const [skill, setSkill] = useState("Python");
  
  const [mcqData, setMcqData] = useState({
    question: "",
    options: ["", "", "", ""],
    answerIndex: 0,
    difficulty: "easy" as "easy" | "medium" | "hard",
    topic: "",
    explanation: ""
  });

  const [codingData, setCodingData] = useState({
    title: "",
    instructions: "",
    difficulty: "easy" as "easy" | "medium_hard",
    functionName: "",
    starterCode: "def solution():\n    pass",
    referenceCode: "",
    publicTests: [{ name: "Test 1", inputArgs: "[]", expected: "" }],
    hiddenTests: [{ name: "Hidden 1", inputArgs: "[]", expected: "" }]
  });

  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const handleMcqOptionChange = (index: number, value: string) => {
    const newOptions = [...mcqData.options];
    newOptions[index] = value;
    setMcqData({ ...mcqData, options: newOptions });
  };

  const handleSaveMcq = async () => {
    setSaving(true);
    setSaveMessage("");
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          type: "mcq",
          skill,
          data: mcqData
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSaveMessage("MCQ saved successfully!");
        setMcqData({ ...mcqData, question: "", options: ["", "", "", ""], explanation: "" });
      } else {
        setSaveMessage(`Error: ${data.error}`);
      }
    } catch (e: any) {
      setSaveMessage(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const parseTests = (tests: any[]) => {
    return tests.map(t => {
      let parsedArgs = [];
      let parsedExpected = "";
      try { parsedArgs = JSON.parse(t.inputArgs); } catch(e) {}
      try { parsedExpected = JSON.parse(t.expected); } catch(e) {}
      return {
        name: t.name,
        inputArgs: parsedArgs,
        expected: parsedExpected
      };
    });
  };

  const handleValidateCoding = async () => {
    setValidating(true);
    setValidationResult(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      const allTests = [...parseTests(codingData.publicTests), ...parseTests(codingData.hiddenTests)];
      
      const res = await fetch("/api/admin/questions/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          code: codingData.referenceCode,
          functionName: codingData.functionName,
          testCases: allTests
        })
      });
      const data = await res.json();
      if (res.ok) {
        setValidationResult(data.result);
      } else {
        setValidationResult({ success: false, stderr: data.error });
      }
    } catch (e: any) {
      setValidationResult({ success: false, stderr: e.message });
    } finally {
      setValidating(false);
    }
  };

  const handleSaveCoding = async () => {
    setSaving(true);
    setSaveMessage("");
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          type: "coding",
          skill,
          data: {
            title: codingData.title,
            instructions: codingData.instructions,
            difficulty: codingData.difficulty,
            functionName: codingData.functionName,
            starterCode: { python: codingData.starterCode },
            referenceCode: codingData.referenceCode,
            publicTests: parseTests(codingData.publicTests),
            hiddenTests: parseTests(codingData.hiddenTests)
          }
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSaveMessage("Coding question saved successfully!");
      } else {
        setSaveMessage(`Error: ${data.error}`);
      }
    } catch (e: any) {
      setSaveMessage(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const updateTest = (type: "public" | "hidden", index: number, field: string, value: string) => {
    const list = type === "public" ? [...codingData.publicTests] : [...codingData.hiddenTests];
    list[index] = { ...list[index], [field]: value };
    setCodingData({ ...codingData, [type === "public" ? "publicTests" : "hiddenTests"]: list });
  };

  const addTest = (type: "public" | "hidden") => {
    const list = type === "public" ? [...codingData.publicTests] : [...codingData.hiddenTests];
    list.push({ name: `Test ${list.length + 1}`, inputArgs: "[]", expected: "" });
    setCodingData({ ...codingData, [type === "public" ? "publicTests" : "hiddenTests"]: list });
  };
  
  const removeTest = (type: "public" | "hidden", index: number) => {
    const list = type === "public" ? [...codingData.publicTests] : [...codingData.hiddenTests];
    list.splice(index, 1);
    setCodingData({ ...codingData, [type === "public" ? "publicTests" : "hiddenTests"]: list });
  };

  const isCodingValid = validationResult && validationResult.success;

  return (
    <div className="p-8 max-w-5xl mx-auto font-sans text-neutral-900">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-[#0D1B12] mb-2">Question Authoring</h1>
        <p className="text-muted-foreground">Manually draft and validate assessment content to ensure zero external sourcing.</p>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("mcq")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "mcq" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-primary"}`}
        >
          MCQ Question
        </button>
        <button
          onClick={() => setActiveTab("coding")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "coding" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-primary"}`}
        >
          Coding Problem
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Target Skill</label>
        <input 
          type="text" 
          value={skill} 
          onChange={e => setSkill(e.target.value)} 
          className="w-full max-w-xs border rounded-md p-2"
        />
      </div>

      {activeTab === "mcq" && (
        <div className="space-y-6 bg-white p-6 border rounded-xl shadow-sm">
          <div>
            <label className="block text-sm font-medium mb-1">Question Text</label>
            <textarea 
              value={mcqData.question}
              onChange={e => setMcqData({...mcqData, question: e.target.value})}
              className="w-full border rounded-md p-2 h-24"
              placeholder="What is the time complexity of..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mcqData.options.map((opt, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input 
                  type="radio" 
                  name="correctAnswer"
                  checked={mcqData.answerIndex === idx}
                  onChange={() => setMcqData({...mcqData, answerIndex: idx})}
                />
                <input
                  type="text"
                  value={opt}
                  onChange={e => handleMcqOptionChange(idx, e.target.value)}
                  className="flex-1 border rounded-md p-2"
                  placeholder={`Option ${idx + 1}`}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Difficulty</label>
              <select 
                value={mcqData.difficulty}
                onChange={e => setMcqData({...mcqData, difficulty: e.target.value as any})}
                className="w-full border rounded-md p-2"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Topic (optional)</label>
              <input 
                type="text"
                value={mcqData.topic}
                onChange={e => setMcqData({...mcqData, topic: e.target.value})}
                className="w-full border rounded-md p-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Explanation (shown after test)</label>
            <textarea 
              value={mcqData.explanation}
              onChange={e => setMcqData({...mcqData, explanation: e.target.value})}
              className="w-full border rounded-md p-2 h-16"
            />
          </div>

          <div className="flex items-center gap-4 pt-4 border-t">
            <button 
              onClick={handleSaveMcq}
              disabled={saving || !mcqData.question || mcqData.options.some(o => !o)}
              className="px-6 py-2 bg-primary text-white font-medium rounded-md flex items-center gap-2 hover:bg-[#162D1E] disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> Save MCQ to Bank
            </button>
            {saveMessage && <span className="text-sm font-medium text-emerald-600">{saveMessage}</span>}
          </div>
        </div>
      )}

      {activeTab === "coding" && (
        <div className="space-y-6 bg-white p-6 border rounded-xl shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input 
                type="text" 
                value={codingData.title}
                onChange={e => setCodingData({...codingData, title: e.target.value})}
                className="w-full border rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Difficulty</label>
              <select 
                value={codingData.difficulty}
                onChange={e => setCodingData({...codingData, difficulty: e.target.value as any})}
                className="w-full border rounded-md p-2"
              >
                <option value="easy">Easy</option>
                <option value="medium_hard">Medium-Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Instructions (Markdown)</label>
            <textarea 
              value={codingData.instructions}
              onChange={e => setCodingData({...codingData, instructions: e.target.value})}
              className="w-full border rounded-md p-2 h-24 font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Target Function Name</label>
              <input 
                type="text" 
                value={codingData.functionName}
                onChange={e => setCodingData({...codingData, functionName: e.target.value})}
                className="w-full border rounded-md p-2 font-mono text-sm"
                placeholder="e.g. process_transactions"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Starter Code (Python)</label>
              <textarea 
                value={codingData.starterCode}
                onChange={e => setCodingData({...codingData, starterCode: e.target.value})}
                className="w-full border rounded-md p-2 h-24 font-mono text-sm bg-neutral-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Reference Solution (Used for validation)</label>
            <textarea 
              value={codingData.referenceCode}
              onChange={e => setCodingData({...codingData, referenceCode: e.target.value})}
              className="w-full border border-blue-200 rounded-md p-2 h-48 font-mono text-sm bg-blue-50/30"
              placeholder="Provide a working correct solution here..."
            />
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium text-lg">Test Cases</h3>
            <p className="text-sm text-muted-foreground mb-4">Input args and Expected must be valid JSON.</p>
            
            <div className="space-y-4 border p-4 rounded-lg bg-neutral-50">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Public Tests</h4>
                <button onClick={() => addTest("public")} className="text-sm text-primary flex items-center"><Plus className="w-4 h-4 mr-1"/> Add Public</button>
              </div>
              {codingData.publicTests.map((t, idx) => (
                <div key={idx} className="flex gap-2 items-start bg-white p-2 border rounded">
                  <input type="text" value={t.name} onChange={e => updateTest("public", idx, "name", e.target.value)} className="w-1/4 border p-1 text-sm" placeholder="Name" />
                  <input type="text" value={t.inputArgs} onChange={e => updateTest("public", idx, "inputArgs", e.target.value)} className="w-1/3 border p-1 text-sm font-mono" placeholder="Input Args (JSON Array)" />
                  <input type="text" value={t.expected} onChange={e => updateTest("public", idx, "expected", e.target.value)} className="w-1/3 border p-1 text-sm font-mono" placeholder="Expected (JSON)" />
                  <button onClick={() => removeTest("public", idx)} className="p-1 text-danger hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>

            <div className="space-y-4 border p-4 rounded-lg bg-neutral-50">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Hidden Tests</h4>
                <button onClick={() => addTest("hidden")} className="text-sm text-primary flex items-center"><Plus className="w-4 h-4 mr-1"/> Add Hidden</button>
              </div>
              {codingData.hiddenTests.map((t, idx) => (
                <div key={idx} className="flex gap-2 items-start bg-white p-2 border rounded">
                  <input type="text" value={t.name} onChange={e => updateTest("hidden", idx, "name", e.target.value)} className="w-1/4 border p-1 text-sm" placeholder="Name" />
                  <input type="text" value={t.inputArgs} onChange={e => updateTest("hidden", idx, "inputArgs", e.target.value)} className="w-1/3 border p-1 text-sm font-mono" placeholder="Input Args (JSON Array)" />
                  <input type="text" value={t.expected} onChange={e => updateTest("hidden", idx, "expected", e.target.value)} className="w-1/3 border p-1 text-sm font-mono" placeholder="Expected (JSON)" />
                  <button onClick={() => removeTest("hidden", idx)} className="p-1 text-danger hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-neutral-100 p-4 rounded-lg border">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleValidateCoding}
                disabled={validating || !codingData.referenceCode || !codingData.functionName}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
              >
                {validating ? <span className="animate-spin text-lg">⚙</span> : <Play className="w-4 h-4" />}
                Validate Reference Solution
              </button>
              {validationResult && (
                <div className="flex items-center gap-2">
                  {validationResult.success ? (
                    <span className="flex items-center text-emerald-600 font-medium"><CheckCircle2 className="w-5 h-5 mr-1"/> Validation Passed ({validationResult.passedTests}/{validationResult.totalTests} tests)</span>
                  ) : (
                    <span className="flex items-center text-red-600 font-medium"><XCircle className="w-5 h-5 mr-1"/> Validation Failed</span>
                  )}
                </div>
              )}
            </div>
            
            {validationResult && !validationResult.success && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                {validationResult.stderr || "Tests failed. Review logic."}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 pt-4 border-t">
            <button 
              onClick={handleSaveCoding}
              disabled={saving || !isCodingValid}
              className={`px-6 py-2 font-medium rounded-md flex items-center gap-2 ${isCodingValid ? 'bg-primary text-white hover:bg-[#162D1E]' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'}`}
            >
              <Save className="w-4 h-4" /> Save Coding Problem to Bank
            </button>
            {!isCodingValid && <span className="text-sm text-muted-foreground">Validation must pass before saving.</span>}
            {saveMessage && <span className="text-sm font-medium text-emerald-600">{saveMessage}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
