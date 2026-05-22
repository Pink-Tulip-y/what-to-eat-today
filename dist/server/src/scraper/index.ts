// 爬虫预留接口
// 后续可以在此实现各外卖平台的数据爬取逻辑：
// - 美团外卖搜索爬虫
// - 饿了么搜索爬虫
// - 抖音外卖搜索爬虫
//
// 建议使用 Puppeteer 或 Playwright 进行动态页面爬取
// 注意遵守各平台的 robots.txt 和服务条款

export interface ScraperConfig {
  platform: string;
  keyword: string;
  location: string;
}

export async function scrapeRestaurants(config: ScraperConfig) {
  // TODO: 实现爬虫逻辑
  console.log('Scraper not implemented yet', config);
  return [];
}
