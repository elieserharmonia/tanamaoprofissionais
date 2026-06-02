import React, { useState } from 'react';
import { authService } from '../services/authService';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({ nome: '', email: '', phone: '', password: '', confirmPassword: '', tipo: 'client' as 'client' | 'pro', categoria: '', cidade: '', descricao: '' });
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return alert("Senhas não coincidem!");
    try {
      const userData = { nome: formData.nome, tipo: formData.tipo, categoria: formData.categoria, cidade: formData.cidade, descricao: formData.descricao };
      if (formData.email) await authService.signUpWithEmail(formData.email, formData.password, userData);
      else await authService.signUpWithPhone(formData.phone, formData.password, userData);
      alert('Cadastro realizado com sucesso! Verifique seu e-mail.');
    } catch (err: any) { alert('Erro: ' + err.message); }
  };

  return (
    <div className="min-h-screen bg-[#1B2A6B] flex items-center justify-center p-4">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-3xl w-full max-w-sm space-y-4 shadow-xl">
        <h2 className="text-2xl font-black text-[#1B2A6B] mb-4">Criar conta</h2>
        <input placeholder="Nome completo" required onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50" />
        <input placeholder="E-mail" onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50" />
        <input placeholder="Telefone (+55...)" required onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50" />
        <input type="password" placeholder="Senha" required onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50" />
        <input type="password" placeholder="Confirmar senha" required onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50" />
        
        <select onChange={e => setFormData({...formData, tipo: e.target.value as any})} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50">
            <option value="client">Cliente</option>
            <option value="pro">Profissional</option>
        </select>
        
        {formData.tipo === 'pro' && (
            <>
                <input placeholder="Categoria (ex: Pedreiro)" onChange={e => setFormData({...formData, categoria: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50" />
                <input placeholder="Cidade / Estado" onChange={e => setFormData({...formData, cidade: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50" />
                <textarea placeholder="Breve descrição" onChange={e => setFormData({...formData, descricao: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 h-24" />
            </>
        )}

        <button className="w-full py-3 bg-[#F5C800] text-[#1B2A6B] font-black rounded-xl hover:bg-[#e0b500] transition shadow-md">Cadastrar</button>
      </form>
    </div>
  );
};
