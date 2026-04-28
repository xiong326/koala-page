import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { t } from '../i18n/translations';
import { useAuth } from '../contexts/AuthContext';

export default function LoginModal({ onClose }) {
  const { language } = useLanguage();
  const { login } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await login(code.trim());
      onClose();
    } catch (err) {
      setError(err.status === 401 ? t('loginInvalidCode', language) : t('loginError', language));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-[90vw] max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-800 mb-4">{t('loginTitle', language)}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t('loginPlaceholder', language)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm"
            autoFocus
            disabled={loading}
          />
          {error && (
            <p className="text-red-500 text-xs mt-2">{error}</p>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              disabled={loading}
            >
              {t('cancel', language)}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-slate-700 text-white rounded-md hover:bg-slate-800 disabled:opacity-50"
              disabled={loading || !code.trim()}
            >
              {loading ? '...' : t('loginSubmit', language)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
