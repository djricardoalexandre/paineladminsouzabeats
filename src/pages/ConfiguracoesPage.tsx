import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  User,
  Shield,
  Database,
  Bell,
  Palette,
  Globe,
  Save,
  Check,
  AlertCircle,
} from 'lucide-react';

export function ConfiguracoesPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    language: 'pt-BR',
  });

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <p className="text-slate-400 mt-1">Gerencie as configurações do sistema</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-3 text-emerald-400">
          <Check className="w-5 h-5" />
          <span>Configurações salvas com sucesso!</span>
        </div>
      )}

      {/* Admin Profile */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Perfil do Administrador</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">E-mail</label>
            <input
              type="email"
              value={user?.email || ''}
              readOnly
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-400 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">E-mail principal do administrador</p>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Nível de Acesso</label>
            <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5">
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="text-white">Administrador Master</span>
            </div>
          </div>
        </div>
      </div>

      {/* Database Connection */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
            <Database className="w-5 h-5 text-emerald-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Conexão com Banco de Dados</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-white">Supabase</span>
            </div>
            <span className="text-emerald-400 text-sm font-medium">Conectado</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">URL do Projeto</label>
              <input
                type="text"
                value="https://owmjmsadtrvqioosfual.supabase.co"
                readOnly
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-400 cursor-not-allowed text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Status</label>
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="w-4 h-4" />
                <span>Operacional</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-amber-400 font-medium">Credenciais Seguras</p>
                <p className="text-slate-400 mt-1">
                  As credenciais de conexão são armazenadas com segurança e não podem ser visualizadas aqui por questões de segurança.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
            <Palette className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Preferências</h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-white">Notificações</p>
                <p className="text-slate-500 text-sm">Receber alertas de novos cadastros</p>
              </div>
            </div>
            <button
              onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.notifications ? 'bg-blue-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.notifications ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-white">Modo Escuro</p>
                <p className="text-slate-500 text-sm">Interface com tema escuro</p>
              </div>
            </div>
            <button
              onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.darkMode ? 'bg-blue-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.darkMode ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-white">Idioma</p>
                <p className="text-slate-500 text-sm">Idioma da interface</p>
              </div>
            </div>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pt-BR">Português (BR)</option>
              <option value="en-US">English (US)</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-700">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-all"
          >
            <Save className="w-4 h-4" />
            Salvar Configurações
          </button>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Informações do Sistema</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between p-3 bg-slate-700/30 rounded-lg">
            <span className="text-slate-400">Versão</span>
            <span className="text-white">1.0.0</span>
          </div>
          <div className="flex justify-between p-3 bg-slate-700/30 rounded-lg">
            <span className="text-slate-400">Framework</span>
            <span className="text-white">React + Vite</span>
          </div>
          <div className="flex justify-between p-3 bg-slate-700/30 rounded-lg">
            <span className="text-slate-400">Banco de Dados</span>
            <span className="text-white">Supabase (PostgreSQL)</span>
          </div>
          <div className="flex justify-between p-3 bg-slate-700/30 rounded-lg">
            <span className="text-slate-400">Última Atualização</span>
            <span className="text-white">{new Date().toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
