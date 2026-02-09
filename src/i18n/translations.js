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
    instructionSearch: "Search by name, nickname, or ID to find a specific koala",
    instructionFilter: "Use filters to view koalas by age, sex, or generation",

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

    // Filter
    filterTitle: "Filters",
    clearFilters: "Clear All",
    filterBySex: "Sex",
    filterByAge: "Age Range",
    filterByGeneration: "Generation",
    all: "All",
    ageInfant: "Infant",
    ageYoung: "Young",
    ageAdult: "Adult",
    ageSenior: "Senior",
    generation: "Generation",
    gen: "Gen",

    // Relationship Calculator
    relationshipTitle: "Relationship",
    koala1: "First Koala",
    koala2: "Second Koala",
    jumpTo: "Jump to:",
    relationshipInstructions: "How to use:",
    relationshipInstruction1: "Select two koalas using the search boxes",
    relationshipInstruction2: "The relationship will be calculated automatically",
    relationshipInstruction3: "Click on names to jump to them in the graph",

    // Relationship Types
    relSelf: "Same koala",
    relUnknown: "Unknown",
    relParentChild: "Mother and daughter/son",
    relParentChildDetail1: "{{koala2}} is {{koala1}}'s mother",
    relParentChildDetail2: "{{koala1}} is {{koala2}}'s mother",
    relSiblings: "Siblings (same mother)",
    relSiblingsDetail: "Both are children of {{mother}}",
    relGrandparent: "Grandmother and grandchild",
    relGrandparentDetail1: "{{koala1}} is {{koala2}}'s grandmother",
    relGrandparentDetail2: "{{koala2}} is {{koala1}}'s grandmother",
    relAncestor: "Ancestor and descendant",
    relAncestorDetail1: "{{koala1}} is {{koala2}}'s ancestor ({{gens}} generations)",
    relAncestorDetail2: "{{koala2}} is {{koala1}}'s ancestor ({{gens}} generations)",
    relAuntNiece: "Aunt and niece/nephew",
    relAuntNieceDetail1: "{{koala1}} is {{koala2}}'s aunt",
    relAuntNieceDetail2: "{{koala2}} is {{koala1}}'s aunt",
    relCousins: "Cousins",
    relCousinsDetail: "Share grandmother {{ancestor}}",
    relRelated: "Related through common ancestor",
    relRelatedDetail: "{{gens}} generations apart, through {{ancestor}}",
    relUnrelated: "No direct family relationship found",
    relUnrelatedDetail: "These koalas do not share a common maternal ancestor",

    // Graph Controls
    resetView: "Reset view",

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
    instructionSearch: "按名字、昵称或ID查找特定考拉",  // REPLACE WITH CHINESE
    instructionFilter: "使用筛选器按年龄、性别或世代查看考拉",  // REPLACE WITH CHINESE

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

    // Filter
    filterTitle: "筛选",
    clearFilters: "清除全部",
    filterBySex: "性别",
    filterByAge: "年龄范围",
    filterByGeneration: "世代",
    all: "全部",
    ageInfant: "幼年",
    ageYoung: "少年",
    ageAdult: "成年",
    ageSenior: "老年",
    generation: "第",
    gen: "代",

    // Relationship Calculator
    relationshipTitle: "关系计算",
    koala1: "第一只考拉",
    koala2: "第二只考拉",
    jumpTo: "跳转至：",
    relationshipInstructions: "使用方法：",
    relationshipInstruction1: "使用搜索框选择两只考拉",
    relationshipInstruction2: "关系将自动计算",
    relationshipInstruction3: "点击名字跳转到图表中的位置",

    // Relationship Types
    relSelf: "同一只考拉",
    relUnknown: "未知",
    relParentChild: "母子/母女关系",
    relParentChildDetail1: "{{koala2}} 是 {{koala1}} 的妈妈",
    relParentChildDetail2: "{{koala1}} 是 {{koala2}} 的妈妈",
    relSiblings: "姐妹/兄弟（同母）",
    relSiblingsDetail: "都是 {{mother}} 的孩子",
    relGrandparent: "祖孙关系",
    relGrandparentDetail1: "{{koala1}} 是 {{koala2}} 的奶奶",
    relGrandparentDetail2: "{{koala2}} 是 {{koala1}} 的奶奶",
    relAncestor: "祖先和后代",
    relAncestorDetail1: "{{koala1}} 是 {{koala2}} 的祖先（相隔 {{gens}} 代）",
    relAncestorDetail2: "{{koala2}} 是 {{koala1}} 的祖先（相隔 {{gens}} 代）",
    relAuntNiece: "姨妈/阿姨和侄女/侄子",
    relAuntNieceDetail1: "{{koala1}} 是 {{koala2}} 的姨妈",
    relAuntNieceDetail2: "{{koala2}} 是 {{koala1}} 的姨妈",
    relCousins: "表姐妹/表兄弟",
    relCousinsDetail: "共享奶奶 {{ancestor}}",
    relRelated: "通过共同祖先相关",
    relRelatedDetail: "相隔 {{gens}} 代，通过 {{ancestor}}",
    relUnrelated: "没有直接家族关系",
    relUnrelatedDetail: "这两只考拉没有共同的母系祖先",

    // Graph Controls
    resetView: "重置视图",

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
