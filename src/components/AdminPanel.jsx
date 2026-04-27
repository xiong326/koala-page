import { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { t } from '../i18n/translations';
import * as api from '../api/koalaApi';

function PasskeyRow({ passkey, onRevoke }) {
  const { language } = useLanguage();
  const [revoking, setRevoking] = useState(false);

  const handleRevoke = async () => {
    setRevoking(true);
    try {
      await onRevoke(passkey.id);
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{passkey.name}</p>
        <p className="text-xs text-gray-400">
          {passkey.role} · {new Date(passkey.created_at).toLocaleDateString()}
        </p>
      </div>
      {passkey.revoked ? (
        <span className="text-xs text-red-400 font-medium">{t('adminRevoked', language)}</span>
      ) : (
        <button
          onClick={handleRevoke}
          disabled={revoking}
          className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
        >
          {t('adminRevoke', language)}
        </button>
      )}
    </div>
  );
}

const AUDIT_FIELD_LABELS = {
  name: 'name',
  nicknames: 'nicknames',
  birth_date: 'birthDate',
  sex: 'sex',
  photo: 'editPhoto',
  mother: 'mother',
  father: 'father',
  deceased: 'deceased',
  date_of_death: 'dateOfDeath',
};

function parseAuditDetails(details) {
  if (!details) return null;
  try {
    return JSON.parse(details);
  } catch {
    return null;
  }
}

function formatAuditValue(value, field, language) {
  if (value === null || value === undefined || value === '') {
    return t('adminEmptyValue', language);
  }

  if (field === 'deceased') {
    return Number(value) ? t('adminYes', language) : t('adminNo', language);
  }

  if (field === 'sex') {
    return t(value, language);
  }

  if (field === 'nicknames') {
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      return Array.isArray(parsed) && parsed.length > 0
        ? parsed.join(', ')
        : t('adminEmptyValue', language);
    } catch {
      return String(value);
    }
  }

  if (field === 'photo') {
    return String(value).replace(/^r2:\/\//, '');
  }

  return String(value);
}

function AuditDetails({ entry }) {
  const { language } = useLanguage();
  const details = parseAuditDetails(entry.details);

  if (entry.action !== 'update' || !details || Object.keys(details).length === 0) {
    return null;
  }

  return (
    <div className="mt-2 space-y-1">
      <p className="text-xs font-medium text-gray-500">{t('adminChangedFields', language)}</p>
      {Object.entries(details).map(([field, change]) => (
        <div key={field} className="rounded-md bg-gray-50 border border-gray-100 px-2 py-1.5">
          <p className="text-xs font-semibold text-gray-700">
            {t(AUDIT_FIELD_LABELS[field] || field, language)}
          </p>
          <p className="text-xs text-gray-500 break-words">
            <span className="text-red-600">{t('adminFrom', language)}: {formatAuditValue(change.from, field, language)}</span>
            <span className="mx-1 text-gray-300">-&gt;</span>
            <span className="text-green-700">{t('adminTo', language)}: {formatAuditValue(change.to, field, language)}</span>
          </p>
        </div>
      ))}
    </div>
  );
}

export default function AdminPanel({ isOpen, onClose }) {
  const { language } = useLanguage();
  const [passkeys, setPasskeys] = useState([]);
  const [auditEntries, setAuditEntries] = useState([]);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('editor');
  const [createdCode, setCreatedCode] = useState(null);
  const [creating, setCreating] = useState(false);
  const [tab, setTab] = useState('passkeys');

  useEffect(() => {
    if (!isOpen) return;
    api.listPasskeys().then(d => setPasskeys(d.passkeys)).catch(() => {});
    api.fetchAuditLog(50).then(d => setAuditEntries(d.entries)).catch(() => {});
  }, [isOpen]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setCreatedCode(null);
    try {
      const data = await api.createPasskey(newName.trim(), newRole);
      setCreatedCode(data.code);
      setNewName('');
      const updated = await api.listPasskeys();
      setPasskeys(updated.passkeys);
    } catch {
      // error handled by UI
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id) => {
    await api.revokePasskey(id);
    const updated = await api.listPasskeys();
    setPasskeys(updated.passkeys);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-gray-50 w-[95vw] max-w-2xl max-h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-bold text-gray-800">{t('adminTitle', language)}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white px-4">
          <button
            onClick={() => setTab('passkeys')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === 'passkeys' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {t('adminPasskeys', language)}
          </button>
          <button
            onClick={() => setTab('audit')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === 'audit' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {t('adminAuditLog', language)}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'passkeys' && (
            <div className="space-y-4">
              {/* Create form */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-sm font-semibold text-gray-600 mb-3">{t('adminCreatePasskey', language)}</p>
                <form onSubmit={handleCreate} className="flex items-end gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder={t('adminPasskeyName', language)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                  >
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    type="submit"
                    disabled={creating || !newName.trim()}
                    className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                  >
                    {t('editCreate', language)}
                  </button>
                </form>
                {createdCode && (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded-md p-3">
                    <p className="text-xs text-green-700 mb-1">{t('adminCodeCreated', language)}</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white border border-green-300 rounded px-2 py-1 text-sm font-mono select-all">
                        {createdCode}
                      </code>
                      <button
                        onClick={() => navigator.clipboard.writeText(createdCode)}
                        className="px-2 py-1 text-xs bg-green-100 rounded hover:bg-green-200 text-green-700"
                      >
                        {t('adminCopy', language)}
                      </button>
                    </div>
                    <p className="text-xs text-green-600 mt-1">{t('adminCodeWarning', language)}</p>
                  </div>
                )}
              </div>

              {/* List */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-sm font-semibold text-gray-600 mb-3">{t('adminAllPasskeys', language)}</p>
                {passkeys.length === 0 ? (
                  <p className="text-sm text-gray-400">{t('adminNoPasskeys', language)}</p>
                ) : (
                  passkeys.map(pk => (
                    <PasskeyRow key={pk.id} passkey={pk} onRevoke={handleRevoke} />
                  ))
                )}
              </div>
            </div>
          )}

          {tab === 'audit' && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm font-semibold text-gray-600 mb-3">{t('adminRecentChanges', language)}</p>
              {auditEntries.length === 0 ? (
                <p className="text-sm text-gray-400">{t('adminNoChanges', language)}</p>
              ) : (
                <div className="space-y-2">
                  {auditEntries.map(entry => (
                    <div key={entry.id} className="flex items-start gap-2 py-2 border-b border-gray-100 last:border-0">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        entry.action === 'create' ? 'bg-green-100 text-green-700' :
                        entry.action === 'update' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {entry.action}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800">
                          <span className="font-medium">{entry.koala_name || entry.koala_id}</span>
                        </p>
                        <p className="text-xs text-gray-400">
                          {entry.passkey_name} · {new Date(entry.created_at).toLocaleString()}
                        </p>
                        <AuditDetails entry={entry} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
