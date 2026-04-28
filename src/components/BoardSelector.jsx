import { useLanguage } from '../i18n/LanguageContext';
import { t } from '../i18n/translations';

const BoardSelector = ({ currentBoard, onBoardChange, boards }) => {
  const { language } = useLanguage();

  const boardNames = {
    'board1': {
      'en': 'Hongshan',
      'zh': '红山'
    },
    'board2': {
      'en': 'Chimelong',
      'zh': '长隆'
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <label className="text-slate-100 text-xs font-medium whitespace-nowrap">
        {t('familyLabel', language)}
      </label>
      <select
        value={currentBoard}
        onChange={(e) => onBoardChange(e.target.value)}
        className="px-2 py-0.5 h-7 rounded bg-white/14 text-white text-xs border border-white/20 hover:bg-white/24 focus:outline-none focus:ring-2 focus:ring-emerald-200 cursor-pointer shadow-sm"
      >
        {boards.map((board) => (
          <option key={board} value={board}>
            {boardNames[board][language]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BoardSelector;
