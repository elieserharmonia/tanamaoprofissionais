import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'email' | 'phone' | 'google'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (activeTab === 'email') await authService.signInWithEmail(email, password);
      else await authService.signInWithPhone(phone, password);
      navigate('/dashboard');
    } catch (err: any) { alert('Erro: ' + err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#1B2A6B] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm border border-slate-100">
        <h1 className="text-3xl font-black text-[#1B2A6B] text-center mb-2">TanaMão</h1>
        <p className="text-center text-slate-500 mb-6 text-sm">Acesse sua conta profissional</p>
        
        <div className="flex gap-1 mb-6 p-1 bg-slate-100 rounded-full">
           {(['email', 'phone', 'google'] as const).map(tab => (
             <button key={tab} 
             onClick={() => setActiveTab(tab)}
             className={`flex-1 py-2 text-xs font-bold rounded-full capitalize transition ${activeTab === tab ? 'bg-[#1B2A6B] text-[#F5C800]' : 'text-slate-500 hover:text-[#1B2A6B]'}`}>
               {tab}
             </button>
           ))}
        </div>

        {activeTab === 'google' ? (
           <button onClick={authService.signInWithGoogle} className="w-full py-3 border border-slate-200 rounded-xl flex items-center justify-center gap-2 font-bold text-slate-700 hover:bg-slate-50">
             Entrar com Google
           </button>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            {activeTab === 'email' ? (
              <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white" required />
            ) : (
              <input type="tel" placeholder="Telefone (+55...)" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white" required />
            )}
            <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white" required />
            
            <button disabled={loading} className="w-full py-3 bg-[#F5C800] text-[#1B2A6B] font-black rounded-xl hover:bg-[#e0b500] transition shadow-md">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
            <div className='text-center text-xs text-slate-400'>Esqueceu sua senha?</div>
          </form>
        )}
      </div>
    </div>
  );
};
