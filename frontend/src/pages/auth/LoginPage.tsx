import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { loginUser } from '../../api';

interface LoginProps {
  onLogin: (user: any) => void;
}

export default function LoginPage({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      if (data.token) localStorage.setItem('spms_token', data.token);
      const userObj = {
        ...data.user,
        name: data.user?.name || data.user?.email?.split('@')[0] || 'Guard User'
      };
      onLogin(userObj);
    } catch (err) { 
      alert("Failed to log in"); 
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] p-4 sm:p-6">
      <div className="w-full max-w-[420px] bg-white rounded-xl shadow-lg border border-[#E2E8F0] p-6 sm:p-8 md:p-10 flex flex-col justify-center">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1E3A5F]/10 text-[#1E3A5F] mb-3">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-[22px] sm:text-[24px] font-bold text-[#1E3A5F]">SPMS Portal</h2>
          <p className="text-[13px] text-gray-500 mt-1">Sign in to your security operations account</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#1E3A5F] mb-1.5">Email address</label>
            <input 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              type="email" 
              placeholder="name@company.com" 
              className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]" 
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#1E3A5F] mb-1.5">Password</label>
            <input 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              type="password" 
              placeholder="••••••••" 
              className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]" 
            />
          </div>
          <button 
            disabled={loading} 
            type="submit" 
            className="w-full bg-[#1E3A5F] text-white py-2.5 rounded-lg text-[14px] font-semibold hover:bg-[#162D4A] mt-2 transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
