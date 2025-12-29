import Parser from 'rss-parser';

/**
 * RSSフィードから記事を収集する
 * @param {string} feedUrl - RSSフィードのURL
 * @returns {Promise<Array>} 記事の配列
 */
export async function collectFeed(feedUrl) {
  const parser = new Parser();

  try {
    const feed = await parser.parseURL(feedUrl);

    return feed.items.map(item => ({
      id: item.guid || item.link,
      title: item.title,
      link: item.link,
      pubDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      contentSnippet: item.contentSnippet || item.content || '',
    }));
  } catch (error) {
    console.error(`RSSフィードの取得に失敗しました: ${feedUrl}`, error);
    throw error;
  }
}
