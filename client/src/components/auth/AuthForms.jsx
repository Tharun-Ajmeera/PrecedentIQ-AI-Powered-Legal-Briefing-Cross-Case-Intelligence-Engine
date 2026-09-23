// client/src/components/auth/LoginForm.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';
import { ErrorBanner } from '../common/ErrorBanner';
import { Lock, Mail } from 'lucide-react';

export function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <div>
        <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="attorney@lawfirm.com"
            className="w-full pl-9 pr-3 py-2.5 bg-[#0B1220] border border-[#1D2A40] rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all font-sans"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Password
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full pl-9 pr-3 py-2.5 bg-[#0B1220] border border-[#1D2A40] rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all font-sans"
          />
        </div>
      </div>

      <Button type="submit" variant="primary" loading={loading} className="w-full mt-2">
        Sign In to Workspace
      </Button>

      <div className="text-center pt-2">
        <span className="text-xs text-slate-400">Need to register a new firm? </span>
        <Link to="/register" className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline font-mono">
          Create Account
        </Link>
      </div>
    </form>
  );
}

// client/src/components/auth/RegisterForm.jsx
export function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [firmName, setFirmName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('attorney');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [details, setDetails] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setDetails(null);

    if (password.length < 10) {
      setError('Password must be at least 10 characters in accordance with firm security policy.');
      return;
    }

    setLoading(true);

    try {
      await register({
        firmName,
        fullName,
        email,
        password,
        role,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
      setDetails(err.details);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorBanner message={error} details={details} onDismiss={() => setError(null)} />}

      <div>
        <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Law Firm / Organization Name
        </label>
        <input
          type="text"
          required
          value={firmName}
          onChange={(e) => setFirmName(e.target.value)}
          placeholder="e.g. Wachtell, Lipton & Rosen LLP"
          className="w-full px-3.5 py-2.5 bg-[#0B1220] border border-[#1D2A40] rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all font-sans"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe, Esq."
            className="w-full px-3.5 py-2.5 bg-[#0B1220] border border-[#1D2A40] rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all font-sans"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#0B1220] border border-[#1D2A40] rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all cursor-pointer font-sans"
          >
            <option value="attorney">Attorney (Full Authority)</option>
            <option value="paralegal">Paralegal (Research & Drafts)</option>
            <option value="compliance_officer">Compliance Officer (Audit & Oversight)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Corporate Email Address
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jdoe@firm.com"
          className="w-full px-3.5 py-2.5 bg-[#0B1220] border border-[#1D2A40] rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all font-sans"
        />
      </div>

      <div>
        <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Password (min 10 characters)
        </label>
        <input
          type="password"
          required
          minLength={10}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••"
          className="w-full px-3.5 py-2.5 bg-[#0B1220] border border-[#1D2A40] rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all font-sans"
        />
        <p className="text-[11px] font-mono text-slate-500 mt-1">Must be at least 10 characters.</p>
      </div>

      <Button type="submit" variant="primary" loading={loading} className="w-full mt-2">
        Register Firm & Admin User
      </Button>

      <div className="text-center pt-2">
        <span className="text-xs text-slate-400">Already registered? </span>
        <Link to="/login" className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline font-mono">
          Sign In
        </Link>
      </div>
    </form>
  );
}
