
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Meritlane",
  description: "Terms of Service for the Meritlane platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-20 lg:px-8">
      <div className="prose prose-zinc max-w-none dark:prose-invert">
        <h1 className="font-serif text-4xl mb-8 tracking-tight">Terms of Service</h1>
        <p className="text-muted-foreground mb-8 font-mono text-sm">Last updated: August 2026</p>
        
        <h2 className="font-serif text-2xl mt-10 mb-4">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing or using the Meritlane platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our services.
        </p>

        <h2 className="font-serif text-2xl mt-10 mb-4">2. Description of Service</h2>
        <p className="mb-4">
          Meritlane is a project-based engineering hiring and verification platform. We evaluate, audit, and provide cryptographic proof of skill for engineering candidates to be presented to prospective employers.
        </p>

        <h2 className="font-serif text-2xl mt-10 mb-4">3. User Conduct</h2>
        <p className="mb-4">
          As a candidate or employer on Meritlane, you agree to:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Provide accurate, truthful, and current information.</li>
          <li>Submit only original code and project work for evaluation. Plagiarism or AI-generated work represented as original human work may result in immediate suspension.</li>
          <li>Maintain the confidentiality of your account credentials.</li>
          <li>Not abuse, exploit, or attempt to bypass the verification mechanisms of the platform.</li>
        </ul>

        <h2 className="font-serif text-2xl mt-10 mb-4">4. Intellectual Property</h2>
        <p className="mb-4">
          The code you submit for evaluation remains your intellectual property. However, by submitting it to Meritlane, you grant us a license to store, execute, analyze, and display the code and its evaluation results to authorized employers on the platform.
        </p>

        <h2 className="font-serif text-2xl mt-10 mb-4">5. Limitation of Liability</h2>
        <p className="mb-4">
          Meritlane provides skill verification "as is". While we strive for absolute accuracy in our technical assessments, we do not guarantee employment outcomes for candidates or the ultimate performance of hired candidates for employers. In no event shall Meritlane be liable for any indirect, incidental, or consequential damages.
        </p>
      </div>
    </div>
  );
}

