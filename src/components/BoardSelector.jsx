import { useLanguage } from '../i18n/LanguageContext';

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
    <div className="flex items-center gap-2">
      <label className="text-white text-sm font-medium whitespace-nowrap">
        {language === 'en' ? 'Family:' : '家族：'}
      </label>
      <select
        value={currentBoard}
        onChange={(e) => onBoardChange(e.target.value)}
        className="px-3 py-1 rounded-md bg-blue-500 text-white border border-blue-400 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
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
