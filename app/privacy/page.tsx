
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Meritlane",
  description: "Privacy Policy for the Meritlane platform.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-20 lg:px-8">
      <div className="prose prose-zinc max-w-none dark:prose-invert">
        <h1 className="font-serif text-4xl mb-8 tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8 font-mono text-sm">Last updated: August 2026</p>
        
        <h2 className="font-serif text-2xl mt-10 mb-4">1. Introduction</h2>
        <p className="mb-4">
          Welcome to Meritlane. We respect your privacy and are committed to protecting your personal data. 
          This privacy policy will inform you as to how we look after your personal data when you visit our website 
          (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
        </p>

        <h2 className="font-serif text-2xl mt-10 mb-4">2. Data We Collect</h2>
        <p className="mb-4">
          We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier, and educational history.</li>
          <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
          <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform.</li>
          <li><strong>Profile Data:</strong> includes your verification records, GitHub repositories linked, code submissions, assessments, and feedback.</li>
        </ul>

        <h2 className="font-serif text-2xl mt-10 mb-4">3. How We Use Your Data</h2>
        <p className="mb-4">
          We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., verifying your skills to employers).</li>
          <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
          <li>Where we need to comply with a legal obligation.</li>
        </ul>

        <h2 className="font-serif text-2xl mt-10 mb-4">4. Data Security</h2>
        <p className="mb-4">
          We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know.
        </p>

        <h2 className="font-serif text-2xl mt-10 mb-4">5. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about this privacy policy or our privacy practices, please contact us at:
          <br /><br />
          Email: <a href="mailto:privacy@meritlane.app" className="text-primary hover:underline">privacy@meritlane.app</a>
        </p>
      </div>
    </div>
  );
}

