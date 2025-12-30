import fs from 'fs/promises';
import path from 'path';

const HISTORY_FILE = 'post-history.json';

/**
 * 投稿履歴を読み込む
 * @returns {Promise<Set>} 投稿済みの記事IDのセット
 */
export async function loadHistory() {
  try {
    const data = await fs.readFile(HISTORY_FILE, 'utf-8');
    const history = JSON.parse(data);
    return new Set(history.postedIds || []);
  } catch (error) {
    // ファイルが存在しない場合は空のセットを返す
    return new Set();
  }
}

/**
 * 投稿履歴を保存する（90日以内の記事のみ保持）
 * @param {Set} postedIds - 投稿済みの記事IDのセット
 * @param {Set} validIds - 有効な記事IDのセット（90日以内の記事）
 */
export async function saveHistory(postedIds, validIds) {
  try {
    // validIds に存在する ID のみを保持（90日以内の記事のみ）
    const filteredIds = Array.from(postedIds).filter(id => validIds.has(id));

    const history = {
      postedIds: filteredIds,
      lastUpdated: new Date().toISOString(),
    };

    await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
    console.log(`投稿履歴を保存しました（${filteredIds.length}件）`);
  } catch (error) {
    console.error('投稿履歴の保存に失敗しました:', error);
    throw error;
  }
}

/**
 * 未投稿の記事をフィルタリングする
 * @param {Array} articles - 記事の配列
 * @param {Set} postedIds - 投稿済みの記事IDのセット
 * @returns {Array} 未投稿の記事の配列
 */
export function filterNewArticles(articles, postedIds) {
  return articles.filter(article => !postedIds.has(article.id));
}

/**
 * 記事IDを投稿履歴に追加する
 * @param {Set} postedIds - 投稿済みの記事IDのセット
 * @param {Array} articles - 投稿した記事の配列
 */
export function addToHistory(postedIds, articles) {
  articles.forEach(article => postedIds.add(article.id));
}
