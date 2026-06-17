// 定义基础类型
export interface Term {
  title: string;
  summary: string;
}

export interface SortItem {
  "一级分类": string;
  "二级分类": string;
  "三级分类": string | null;
  title: string;
  summary: string;
}

export interface ScrapedItem {
  term: string;
  definition: string;
  game: string;
}

// 统计信息接口
export interface DataStats {
  totalTerms: number;
  totalGames: number;
  totalCategories: number;
  scrapedCount: number;
}

export type RawData = {
  allData: Term[];
  sortData: SortItem[];
  scrapedData: ScrapedItem[];
};

let rawDataPromise: Promise<RawData> | null = null;

export const loadRawData = async (): Promise<RawData> => {
  if (!rawDataPromise) {
    rawDataPromise = Promise.all([
      import('@/data/words_all_data.json'),
      import('@/data/words_sort_data.json'),
      import('@/data/words_scraped_data.json'),
    ]).then(([allData, sortData, scrapedData]) => ({
      allData: allData.default as Term[],
      sortData: sortData.default as SortItem[],
      scrapedData: scrapedData.default as ScrapedItem[],
    }));
  }

  return rawDataPromise;
};

export const getBasicStats = async (): Promise<DataStats> => {
  const data = await loadRawData();
  const uniqueTerms = new Set<string>();
  data.sortData.forEach(item => uniqueTerms.add(String(item.title)));
  data.allData.forEach(item => uniqueTerms.add(String(item.title)));
  data.scrapedData.forEach(item => uniqueTerms.add(String(item.term)));

  const totalTerms = uniqueTerms.size;
  const uniqueGames = new Set(data.scrapedData.map(item => item.game));
  const totalGames = uniqueGames.size;
  const uniqueCategories = new Set(data.sortData.map(item => item["一级分类"]));
  const totalCategories = uniqueCategories.size;
  const scrapedCount = data.scrapedData.length;

  return { totalTerms, totalGames, totalCategories, scrapedCount };
};
