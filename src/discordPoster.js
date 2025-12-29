/**
 * Discordに記事を投稿する
 * @param {string} webhookUrl - Discord WebhookのURL
 * @param {object} article - 投稿する記事情報
 * @param {string} categoryName - カテゴリ名
 */
export async function postToDiscord(webhookUrl, article, categoryName) {
  const embed = {
    title: article.title,
    url: article.link,
    color: 0x0099ff,
    fields: [
      {
        name: 'カテゴリ',
        value: categoryName,
        inline: true,
      },
      {
        name: '公開日時',
        value: new Date(article.pubDate).toLocaleString('ja-JP'),
        inline: true,
      },
    ],
    timestamp: new Date(article.pubDate).toISOString(),
  };

  // 記事の概要があれば追加
  if (article.contentSnippet) {
    const snippet = article.contentSnippet.substring(0, 200);
    embed.description = snippet + (article.contentSnippet.length > 200 ? '...' : '');
  }

  const payload = {
    embeds: [embed],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Discord投稿に失敗しました: ${response.status} ${response.statusText}`);
    }

    console.log(`Discordに投稿しました: ${article.title}`);
  } catch (error) {
    console.error('Discord投稿エラー:', error);
    throw error;
  }
}

/**
 * 複数の記事を順次投稿する（Rate Limit対策で間隔を空ける）
 * @param {string} webhookUrl - Discord WebhookのURL
 * @param {Array} articles - 投稿する記事の配列
 * @param {string} categoryName - カテゴリ名
 */
export async function postMultipleArticles(webhookUrl, articles, categoryName) {
  for (const article of articles) {
    await postToDiscord(webhookUrl, article, categoryName);
    // Discord Rate Limit対策: 投稿間隔を1秒空ける
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
