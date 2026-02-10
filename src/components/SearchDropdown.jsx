import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { t } from '../i18n/translations';

export default function SearchDropdown({ koalas, onSelectKoala }) {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredKoalas, setFilteredKoalas] = useState([]);
  const dropdownRef = useRef(null);

  // Filter koalas based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredKoalas([]);
      setIsOpen(false);
      return;
    }

    const term = searchTerm.toLowerCase();
    const matches = koalas.filter(koala => {
      const nameMatch = koala.name?.toLowerCase().includes(term);
      const nicknameMatch = Array.isArray(koala.nicknames)
        ? koala.nicknames.some(nickname => nickname?.toLowerCase().includes(term))
        : false;
      const idMatch = koala.id?.toLowerCase().includes(term);

      return nameMatch || nicknameMatch || idMatch;
    });

    setFilteredKoalas(matches);
    setIsOpen(true);
  }, [searchTerm, koalas]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectKoala = (koala) => {
    onSelectKoala(koala);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchTerm('');
    setFilteredKoalas([]);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('searchPlaceholder', language)}
          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {isOpen && filteredKoalas.length > 0 && (
        <div className="absolute z-40 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {filteredKoalas.map(koala => (
            <button
              key={koala.id}
              onClick={() => handleSelectKoala(koala)}
              className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
            >
              <div className="font-semibold text-gray-800">{koala.name}</div>
              {koala.nicknames && koala.nicknames.length > 0 && (
                <div className="text-xs text-gray-500">
                  {koala.nicknames.join(', ')}
                </div>
              )}
              <div className="text-xs text-gray-400">{koala.id}</div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && searchTerm && filteredKoalas.length === 0 && (
        <div className="absolute z-40 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
          {t('noResults', language)}
        </div>
      )}
    </div>
  );
}
