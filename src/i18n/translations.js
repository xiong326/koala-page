export const translations = {
  en: {
    // Header
    title: "Koala Family Tree",
    subtitle: "Explore koala relationships and family connections",
    birthdayForecast: "Birthday forecast",

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
    ageCustom: "Custom Range",
    minAge: "Min",
    maxAge: "Max",
    customAgeHint: "Leave blank for no limit. Results ordered by age (oldest first)",
    generation: "Generation",
    gen: "Gen",
    filterByDeceased: "Status",
    alive: "Alive",
    generationFormat: "Generation {{gen}}",
    generationShortFormat: "Gen {{gen}}",
    familyLabel: "Family:",
    ageYearsFormat: "({{age}})",

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
    relParentChild: "Parent and child",
    relParentChildDetail1: "{{koala2}} is {{koala1}}'s mother",
    relParentChildDetail2: "{{koala1}} is {{koala2}}'s mother",
    relParentChildDetailFather1: "{{koala2}} is {{koala1}}'s father",
    relParentChildDetailFather2: "{{koala1}} is {{koala2}}'s father",
    relSiblings: "Siblings (same mother)",
    relFullSiblings: "Full siblings (same parents)",
    relHalfSiblings: "Half siblings",
    relSiblingsDetail: "Both are children of {{parent}}",
    relGrandmother: "Grandmother and grandchild",
    relGrandmotherDetail1: "{{koala1}} is {{koala2}}'s grandmother",
    relGrandmotherDetail2: "{{koala2}} is {{koala1}}'s grandmother",
    relGrandfather: "Grandfather and grandchild",
    relGrandfatherDetail1: "{{koala1}} is {{koala2}}'s grandfather",
    relGrandfatherDetail2: "{{koala2}} is {{koala1}}'s grandfather",
    relAncestor: "Ancestor and descendant",
    relAncestorDetail1: "{{koala1}} is {{koala2}}'s ancestor ({{gens}} generations)",
    relAncestorDetail2: "{{koala2}} is {{koala1}}'s ancestor ({{gens}} generations)",
    relAuntNiece: "Aunt and niece/nephew",
    relAuntNieceDetail1: "{{koala1}} is {{koala2}}'s aunt",
    relAuntNieceDetail2: "{{koala2}} is {{koala1}}'s aunt",
    relUncleNiece: "Uncle and niece/nephew",
    relUncleNieceDetail1: "{{koala1}} is {{koala2}}'s uncle",
    relUncleNieceDetail2: "{{koala2}} is {{koala1}}'s uncle",
    relCousins: "Cousins",
    relCousinsDetail: "Share grandmother {{ancestor}}",
    relRelated: "Related through common ancestor",
    relRelatedDetail: "{{gens}} generations apart, through {{ancestor}}",
    relUnrelated: "No direct family relationship found",
    relUnrelatedDetail: "These koalas do not share a common maternal ancestor",

    // Graph Controls
    resetView: "Reset view",

    // Data Board
    dataBoard: "Data Board",
    dbPopulation: "Population",
    dbTotal: "Total",
    dbAlive: "Alive",
    dbDeceased: "Deceased",
    dbSexRatio: "Sex Ratio",
    dbAgeAnalytics: "Age Analytics",
    dbAverageAge: "Average Age",
    dbOldest: "Oldest",
    dbYoungest: "Youngest",
    dbAvgLifespan: "Avg. Lifespan (Deceased)",
    dbAgeDistribution: "Age Distribution",
    dbBirthMonth: "Birth Month Distribution",
    dbFamily: "Family & Lineage",
    dbTopParents: "Top Parents by Offspring",
    dbOffspring: "offspring",
    dbGenerationDist: "Generation Distribution",
    dbFounders: "Founders",
    dbDeepestGen: "Deepest Generation",
    dbBirthsPerYear: "Births Per Year",
    dbCount: "Count",
    dbAge: "Age",
    dbGeneration: "Gen",
    dbYear: "Year",
    dbBirthYear: "Birth Year",
    dbNoData: "No data available for the current filters",
    dbJan: "Jan", dbFeb: "Feb", dbMar: "Mar", dbApr: "Apr",
    dbMay: "May", dbJun: "Jun", dbJul: "Jul", dbAug: "Aug",
    dbSep: "Sep", dbOct: "Oct", dbNov: "Nov", dbDec: "Dec",

    // Detail Modal
    moreInfo: "More Info",
    detailBasicInfo: "Basic Info",
    detailFamily: "Family",
    detailFamilyStats: "Family Stats",
    detailTimeline: "Timeline",
    detailOffspring: "Offspring",
    detailSiblings: "Siblings",
    detailFullSiblings: "Full Siblings",
    detailHalfSiblings: "Half Siblings",
    detailMates: "Mate(s)",
    detailGrandparents: "Grandparents",
    detailMaternalGrandmother: "Maternal Grandmother",
    detailMaternalGrandfather: "Maternal Grandfather",
    detailPaternalGrandmother: "Paternal Grandmother",
    detailPaternalGrandfather: "Paternal Grandfather",
    detailTotalDescendants: "Total Descendants",
    detailTotalAncestors: "Total Ancestors",
    detailDeepestDescGen: "Deepest Descendant Gen.",
    detailPrev: "Previous",
    detailNext: "Next",
    detailNoOffspring: "No offspring",
    detailNoSiblings: "No siblings",
    detailNoMates: "None",
    detailNone: "None",
    detailBorn: "Born",
    detailDied: "Died",
    detailAgeAtDeath: "Age at death",
    detailStatus: "Status",
    detailGeneration: "Generation",

    // Contributions
    contributionsTitle: "Credits & Contributions",
    contributionKoalaPhoto: "Koala Photo",
    contributionFamilyTree: "Family Tree",
    contributionWebDesign: "Web Design & Development",

    // Language toggle
    language: "语言",
  },
  zh: {
    // Header - ADD CHINESE HERE
    title: "考拉家族树",  // REPLACE WITH CHINESE
    subtitle: "探索考拉关系和家族联系",  // REPLACE WITH CHINESE
    birthdayForecast: "生日预告",

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
    ageCustom: "自定义范围",
    minAge: "最小",
    maxAge: "最大",
    customAgeHint: "留空表示无限制。结果按年龄排序（最年长优先）",
    generation: "第",
    gen: "代",
    filterByDeceased: "状态",
    alive: "在世",
    generationFormat: "第{{gen}}代",
    generationShortFormat: "第{{gen}}代",
    familyLabel: "家族：",
    ageYearsFormat: "{{age}}岁",

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
    relParentChild: "父母子女关系",
    relParentChildDetail1: "{{koala2}} 是 {{koala1}} 的妈妈",
    relParentChildDetail2: "{{koala1}} 是 {{koala2}} 的妈妈",
    relParentChildDetailFather1: "{{koala2}} 是 {{koala1}} 的爸爸",
    relParentChildDetailFather2: "{{koala1}} 是 {{koala2}} 的爸爸",
    relSiblings: "姐妹/兄弟（同母）",
    relFullSiblings: "亲姐妹/亲兄弟（同父同母）",
    relHalfSiblings: "同父异母/同母异父",
    relSiblingsDetail: "都是 {{parent}} 的孩子",
    relGrandmother: "祖孙关系",
    relGrandmotherDetail1: "{{koala1}} 是 {{koala2}} 的奶奶",
    relGrandmotherDetail2: "{{koala2}} 是 {{koala1}} 的奶奶",
    relGrandfather: "祖孙关系",
    relGrandfatherDetail1: "{{koala1}} 是 {{koala2}} 的爷爷",
    relGrandfatherDetail2: "{{koala2}} 是 {{koala1}} 的爷爷",
    relAncestor: "祖先和后代",
    relAncestorDetail1: "{{koala1}} 是 {{koala2}} 的祖先（相隔 {{gens}} 代）",
    relAncestorDetail2: "{{koala2}} 是 {{koala1}} 的祖先（相隔 {{gens}} 代）",
    relAuntNiece: "姨妈/阿姨和侄女/侄子",
    relAuntNieceDetail1: "{{koala1}} 是 {{koala2}} 的姨妈",
    relAuntNieceDetail2: "{{koala2}} 是 {{koala1}} 的姨妈",
    relUncleNiece: "叔叔/伯伯和侄女/侄子",
    relUncleNieceDetail1: "{{koala1}} 是 {{koala2}} 的叔叔",
    relUncleNieceDetail2: "{{koala2}} 是 {{koala1}} 的叔叔",
    relCousins: "表姐妹/表兄弟",
    relCousinsDetail: "共享奶奶 {{ancestor}}",
    relRelated: "通过共同祖先相关",
    relRelatedDetail: "相隔 {{gens}} 代，通过 {{ancestor}}",
    relUnrelated: "没有直接家族关系",
    relUnrelatedDetail: "这两只考拉没有共同的母系祖先",

    // Graph Controls
    resetView: "重置视图",

    // Data Board
    dataBoard: "数据看板",
    dbPopulation: "种群概况",
    dbTotal: "总数",
    dbAlive: "在世",
    dbDeceased: "已回考拉星",
    dbSexRatio: "性别比例",
    dbAgeAnalytics: "年龄分析",
    dbAverageAge: "平均年龄",
    dbOldest: "最年长",
    dbYoungest: "最年幼",
    dbAvgLifespan: "平均寿命（已故）",
    dbAgeDistribution: "年龄分布",
    dbBirthMonth: "出生月份分布",
    dbFamily: "家族与世代",
    dbTopParents: "后代最多的父母",
    dbOffspring: "个后代",
    dbGenerationDist: "世代分布",
    dbFounders: "最早世代个体数",
    dbDeepestGen: "最年轻世代",
    dbBirthsPerYear: "每年出生数",
    dbCount: "数量",
    dbAge: "年龄",
    dbGeneration: "代",
    dbYear: "年份",
    dbBirthYear: "出生年份",
    dbNoData: "当前筛选条件下暂无数据",
    dbJan: "1月", dbFeb: "2月", dbMar: "3月", dbApr: "4月",
    dbMay: "5月", dbJun: "6月", dbJul: "7月", dbAug: "8月",
    dbSep: "9月", dbOct: "10月", dbNov: "11月", dbDec: "12月",

    // Detail Modal
    moreInfo: "详细资料",
    detailBasicInfo: "基本信息",
    detailFamily: "家庭关系",
    detailFamilyStats: "家族统计",
    detailTimeline: "生命历程",
    detailOffspring: "后代",
    detailSiblings: "兄弟姐妹",
    detailFullSiblings: "亲兄弟姐妹",
    detailHalfSiblings: "同父异母/同母异父",
    detailMates: "配偶",
    detailGrandparents: "祖父母/外祖父母",
    detailMaternalGrandmother: "外婆",
    detailMaternalGrandfather: "外公",
    detailPaternalGrandmother: "奶奶",
    detailPaternalGrandfather: "爷爷",
    detailTotalDescendants: "后代总数",
    detailTotalAncestors: "祖先总数",
    detailDeepestDescGen: "最年轻后代世代",
    detailPrev: "上一只",
    detailNext: "下一只",
    detailNoOffspring: "暂无后代",
    detailNoSiblings: "暂无兄弟姐妹",
    detailNoMates: "无",
    detailNone: "无",
    detailBorn: "出生",
    detailDied: "回考拉星",
    detailAgeAtDeath: "终年",
    detailStatus: "状态",
    detailGeneration: "世代",

    // Contributions
    contributionsTitle: "鸣谢与贡献",
    contributionKoalaPhoto: "考拉照片",
    contributionFamilyTree: "家族树",
    contributionWebDesign: "网页设计与开发",

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
