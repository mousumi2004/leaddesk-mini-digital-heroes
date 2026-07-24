import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <div className="auth-backdrop" />
      <div className="auth-shell">
        <Link className="back-link" href="/">
          <ArrowLeft aria-hidden="true" size={17} />
          Back to enquiry form
        </Link>
        <LoginForm />
        <p className="auth-security-note">
          Access is restricted to authorized LeadDesk Mini administrators.
        </p>
      </div>
    </main>
  );
}
