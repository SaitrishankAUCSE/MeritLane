import React from "react";

export default function EmployerTemplate({ children }: { children: React.ReactNode }) {
  return <div className="h-full w-full flex flex-col flex-1">{children}</div>;
}
