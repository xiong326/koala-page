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
      <label className="text-white text-xs font-medium whitespace-nowrap">
        {t('familyLabel', language)}
      </label>
      <select
        value={currentBoard}
        onChange={(e) => onBoardChange(e.target.value)}
        className="px-2 py-0.5 h-7 rounded bg-blue-500 text-white text-xs border border-blue-400 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
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
