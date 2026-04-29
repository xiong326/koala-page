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
      <div
        className="flex h-7 overflow-visible rounded border border-white/20 bg-white/12 p-0.5 shadow-sm"
        role="group"
        aria-label={t('familyLabel', language)}
      >
        {boards.map((board) => (
          <button
            key={board}
            type="button"
            onClick={() => onBoardChange(board)}
            className={`px-2 text-xs font-medium transition-colors ${
              currentBoard === board
                ? 'rounded-sm bg-white text-slate-800 shadow-sm'
                : 'text-slate-100 hover:bg-white/16'
            }`}
            aria-pressed={currentBoard === board}
          >
            {boardNames[board][language]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BoardSelector;
