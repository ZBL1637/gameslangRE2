import allData from '@/data/words_all_data.json';
import sortData from '@/data/words_sort_data.json';
import scrapedData from '@/data/words_scraped_data.json';

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

export const rawData: RawData = {
  allData: allData as Term[],
  sortData: sortData as SortItem[],
  scrapedData: scrapedData as ScrapedItem[],
};

export const loadRawData = async (): Promise<RawData> => {
  return rawData;
};

export const getBasicStats = async (): Promise<DataStats> => {
  const uniqueTerms = new Set<string>();
  rawData.sortData.forEach(item => uniqueTerms.add(String(item.title)));
  rawData.allData.forEach(item => uniqueTerms.add(String(item.title)));
  rawData.scrapedData.forEach(item => uniqueTerms.add(String(item.term)));

  const totalTerms = uniqueTerms.size;
  const uniqueGames = new Set(rawData.scrapedData.map(item => item.game));
  const totalGames = uniqueGames.size;
  const uniqueCategories = new Set(rawData.sortData.map(item => item["一级分类"]));
  const totalCategories = uniqueCategories.size;
  const scrapedCount = rawData.scrapedData.length;

  return { totalTerms, totalGames, totalCategories, scrapedCount };
};
