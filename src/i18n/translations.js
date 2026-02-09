export const translations = {
  en: {
    // Header
    title: "Koala Family Tree",
    subtitle: "Explore koala relationships and family connections",

    // Search
    searchPlaceholder: "Search by name, nickname, or ID...",
    showingCount: "Showing {{filtered}} of {{total}} koalas",
    noResults: "No koalas found",

    // Instructions
    instructionsTitle: "Instructions:",
    instructionClick: "Click on a koala to view details and highlight their family",
    instructionZoom: "Use mouse wheel or pinch to zoom in/out",
    instructionPan: "Click and drag to pan around the graph",
    instructionSearch: "Search by name, nickname, or ID to filter koalas",

    // Koala Card
    id: "ID",
    nicknames: "Nicknames",
    sex: "Sex",
    birthDate: "Birth Date",
    age: "Age",
    mother: "Mother",
    father: "Father",
    unknown: "Unknown",
    deceased: "Deceased",
    dateOfDeath: "Date of Death",

    // Sex values
    male: "Male",
    female: "Female",

    // Age units
    months: "months",
    years: "years",

    // Language toggle
    language: "语言",
  },
  zh: {
    // Header - ADD CHINESE HERE
    title: "考拉家族树",  // REPLACE WITH CHINESE
    subtitle: "探索考拉关系和家族联系",  // REPLACE WITH CHINESE

    // Search - ADD CHINESE HERE
    searchPlaceholder: "按名字、昵称或ID搜索...",  // REPLACE WITH CHINESE
    showingCount: "显示 {{filtered}} / {{total}} 只考拉",  // REPLACE WITH CHINESE
    noResults: "未找到考拉",  // REPLACE WITH CHINESE

    // Instructions - ADD CHINESE HERE
    instructionsTitle: "使用说明：",  // REPLACE WITH CHINESE
    instructionClick: "点击考拉查看详情并高亮其家族",  // REPLACE WITH CHINESE
    instructionZoom: "使用鼠标滚轮或捏合手势进行缩放",  // REPLACE WITH CHINESE
    instructionPan: "点击并拖动以平移图表",  // REPLACE WITH CHINESE
    instructionSearch: "按名字、昵称或ID搜索过滤考拉",  // REPLACE WITH CHINESE

    // Koala Card - ADD CHINESE HERE
    id: "编号",  // REPLACE WITH CHINESE
    nicknames: "昵称",  // REPLACE WITH CHINESE
    sex: "性别",  // REPLACE WITH CHINESE
    birthDate: "出生日期",  // REPLACE WITH CHINESE
    age: "年龄",  // REPLACE WITH CHINESE
    mother: "妈妈",  // REPLACE WITH CHINESE
    father: "爸爸",  // REPLACE WITH CHINESE
    unknown: "未知",  // REPLACE WITH CHINESE
    deceased: "已回考拉星",  // REPLACE WITH CHINESE
    dateOfDeath: "回考拉星日期",  // REPLACE WITH CHINESE

    // Sex values - ADD CHINESE HERE
    male: "雄性",  // REPLACE WITH CHINESE
    female: "雌性",  // REPLACE WITH CHINESE

    // Age units - ADD CHINESE HERE
    months: "个月",  // REPLACE WITH CHINESE
    years: "岁",  // REPLACE WITH CHINESE

    // Language toggle
    language: "Language",
  }
};

// Simple template string replacement
export function t(key, lang, params = {}) {
  let text = translations[lang]?.[key] || translations.en[key] || key;

  // Replace {{variable}} with actual values
  Object.keys(params).forEach(param => {
    text = text.replace(`{{${param}}}`, params[param]);
  });

  return text;
}
