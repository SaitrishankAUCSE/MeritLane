"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";

export default function TestAuthPage() {
  const { user, userProfile, loading } = useAuth();
  const [resData, setResData] = useState<any>(null);

  useEffect(() => {
    if (loading || !user) return;
    user.getIdToken().then(token => {
      fetch("/api/start-assessment", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then(r => Promise.all([r.status, r.json()]))
      .then(([status, data]) => {
        setResData({ status, data });
      })
      .catch(e => setResData({ error: e.message }));
    });
  }, [user, loading]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;

  return (
    <div className="p-8 bg-[#FFFFFF] text-[#0D0D0D]">
      <h1>Test Auth</h1>
      <pre>{JSON.stringify(userProfile, null, 2)}</pre>
      <h2>API Result</h2>
      <pre>{JSON.stringify(resData, null, 2)}</pre>
    </div>
  );
}
