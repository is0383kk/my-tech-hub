import fs from 'fs/promises';
import path from 'path';

const HISTORY_DIR = 'data';
const HISTORY_FILE = path.join(HISTORY_DIR, 'post-history.json');

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
 * 投稿履歴を保存する
 * @param {Set} postedIds - 投稿済みの記事IDのセット
 */
export async function saveHistory(postedIds) {
  try {
    // ディレクトリが存在しない場合は作成
    await fs.mkdir(HISTORY_DIR, { recursive: true });

    const history = {
      postedIds: Array.from(postedIds),
      lastUpdated: new Date().toISOString(),
    };

    await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
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
