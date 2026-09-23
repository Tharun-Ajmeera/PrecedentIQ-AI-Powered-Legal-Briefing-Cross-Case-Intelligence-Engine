// client/src/pages/LoginPage.jsx
import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { Scale, ShieldCheck } from 'lucide-react';

export function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#060B16] p-4 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 mb-3 shadow-sm">
            <Scale className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-100 tracking-tight">
            Precedent<span className="text-amber-500">IQ</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-mono font-semibold">
            Enterprise Legal Intelligence & Briefing Engine
          </p>
        </div>

        <div className="p-8 rounded-2xl legal-card">
          <div className="mb-6 pb-4 border-b border-[#1D2A40]">
            <h2 className="text-base font-serif font-semibold text-slate-200">Firm Authentication</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure client-privilege workspace session
            </p>
          </div>

          <LoginForm />
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-500/80" />
          <span>Tenant Data Isolation & RLS Enforced</span>
        </div>
      </div>
    </div>
  );
}

// client/src/pages/RegisterPage.jsx
export function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#060B16] p-4 relative overflow-hidden">
      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 mb-3 shadow-sm">
            <Scale className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-100 tracking-tight">
            Precedent<span className="text-amber-500">IQ</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-mono font-semibold">
            Enterprise Firm Registration
          </p>
        </div>

        <div className="p-8 rounded-2xl legal-card">
          <div className="mb-6 pb-4 border-b border-[#1D2A40]">
            <h2 className="text-base font-serif font-semibold text-slate-200">Register Law Firm Workspace</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Create an isolated tenant workspace with role-based access control
            </p>
          </div>

          <RegisterForm />
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-500/80" />
          <span>Strict Client-Privilege Multi-Tenancy Architecture</span>
        </div>
      </div>
    </div>
  );
}
