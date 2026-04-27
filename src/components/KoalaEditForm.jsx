import { useState, useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { t } from '../i18n/translations';
import { compressFromCrop } from '../utils/imageCompression';
import ImageCropper from './ImageCropper';
import * as api from '../api/koalaApi';
import { getPhotoUrl } from '../utils/imageUtils';

function SearchableSelect({ value, onChange, koalas, placeholder, language }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return koalas;
    const term = search.toLowerCase();
    return koalas.filter(k =>
      k.name.toLowerCase().includes(term) ||
      k.id.toLowerCase().includes(term) ||
      (k.nicknames || []).some(n => n.toLowerCase().includes(term))
    );
  }, [koalas, search]);

  const selected = koalas.find(k => k.id === value);

  return (
    <div className="relative">
      <div className="flex gap-1">
        <input
          type="text"
          value={open ? search : (selected ? selected.name : '')}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {value && (
          <button
            type="button"
            onClick={() => { onChange(null); setSearch(''); }}
            className="px-2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-30 max-h-40 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-xs text-gray-400">{t('noResults', language)}</p>
          ) : (
            filtered.slice(0, 20).map(k => (
              <button
                key={k.id}
                type="button"
                onClick={() => { onChange(k.id); setSearch(''); setOpen(false); }}
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50 truncate"
              >
                {k.name} <span className="text-gray-400 text-xs">({k.id})</span>
              </button>
            ))
          )}
        </div>
      )}
      {open && <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />}
    </div>
  );
}

export default function KoalaEditForm({ koala, board, allKoalas, onSave, onCancel }) {
  const { language } = useLanguage();
  const isNew = !koala;

  const [form, setForm] = useState(() => ({
    id: koala?.id || '',
    name: koala?.name || '',
    nicknames: (koala?.nicknames || []).join(', '),
    birthDate: koala?.birthDate || '',
    sex: koala?.sex || 'male',
    mother: koala?.mother || null,
    father: koala?.father || null,
    deceased: koala?.deceased || false,
    dateOfDeath: koala?.dateOfDeath || '',
  }));

  const [croppedBlob, setCroppedBlob] = useState(null);
  const [cropFile, setCropFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(
    koala?.photo ? getPhotoUrl(koala.photo, 'medium') : null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const parentCandidates = useMemo(
    () => allKoalas.filter(k => k.id !== form.id),
    [allKoalas, form.id],
  );

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropFile(file);
    setCroppedBlob(null);
  };

  const handleCropDone = (blob) => {
    setCroppedBlob(blob);
    setCropFile(null);
    setPhotoPreview(URL.createObjectURL(blob));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      let photo = koala?.photo || null;

      if (croppedBlob) {
        const { thumb, medium } = await compressFromCrop(croppedBlob);
        const baseName = form.id || form.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const result = await api.uploadImage(thumb, medium, `${baseName}-${Date.now()}`);
        photo = result.photo;
      }

      const nicknames = form.nicknames
        .split(',')
        .map(n => n.trim())
        .filter(Boolean);

      const payload = {
        ...(!isNew ? {} : { board }),
        name: form.name,
        nicknames,
        birthDate: form.birthDate || null,
        sex: form.sex,
        photo,
        mother: form.mother || null,
        father: form.father || null,
        deceased: form.deceased,
        dateOfDeath: form.deceased ? (form.dateOfDeath || null) : null,
      };

      let result;
      if (isNew) {
        result = await api.createKoala(payload);
      } else {
        result = await api.updateKoala(koala.id, payload);
      }

      onSave(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ID (only for new) */}
        {isNew && (
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">{t('id', language)}</label>
            <div className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md bg-gray-50 text-gray-500">
              {t('editIdAutoAssigned', language)}
            </div>
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">{t('name', language)} *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Nicknames */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">{t('editNicknames', language)}</label>
          <input
            type="text"
            value={form.nicknames}
            onChange={(e) => handleChange('nicknames', e.target.value)}
            placeholder={t('editNicknamesPlaceholder', language)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Sex */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">{t('sex', language)} *</label>
          <select
            value={form.sex}
            onChange={(e) => handleChange('sex', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="male">{t('male', language)}</option>
            <option value="female">{t('female', language)}</option>
          </select>
        </div>

        {/* Birth Date */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">{t('birthDate', language)}</label>
          <input
            type="text"
            value={form.birthDate}
            onChange={(e) => handleChange('birthDate', e.target.value)}
            placeholder="YYYY-MM-DD"
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-0.5">{t('editDateHint', language)}</p>
        </div>

        {/* Mother */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">{t('mother', language)}</label>
          <SearchableSelect
            value={form.mother}
            onChange={(id) => handleChange('mother', id)}
            koalas={parentCandidates}
            placeholder={t('editSelectParent', language)}
            language={language}
          />
        </div>

        {/* Father */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">{t('father', language)}</label>
          <SearchableSelect
            value={form.father}
            onChange={(id) => handleChange('father', id)}
            koalas={parentCandidates}
            placeholder={t('editSelectParent', language)}
            language={language}
          />
        </div>

        {/* Deceased */}
        <div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.deceased}
              onChange={(e) => handleChange('deceased', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="font-semibold text-gray-600 text-xs">{t('deceased', language)}</span>
          </label>
          {form.deceased && (
            <div className="mt-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">{t('dateOfDeath', language)}</label>
              <input
                type="text"
                value={form.dateOfDeath}
                onChange={(e) => handleChange('dateOfDeath', e.target.value)}
                placeholder="YYYY-MM-DD"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>
      </div>

      {/* Photo */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">{t('editPhoto', language)}</label>
        {cropFile ? (
          <ImageCropper
            file={cropFile}
            onCrop={handleCropDone}
            onCancel={() => setCropFile(null)}
          />
        ) : (
          <div className="flex items-center gap-4">
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Preview"
                className="w-16 h-16 rounded-lg object-cover border border-gray-200"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border file:border-gray-300 file:text-xs file:bg-white file:text-gray-700 hover:file:bg-gray-50"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          disabled={saving}
        >
          {t('cancel', language)}
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          disabled={saving}
        >
          {saving ? '...' : (isNew ? t('editCreate', language) : t('editSave', language))}
        </button>
      </div>
    </form>
  );
}
