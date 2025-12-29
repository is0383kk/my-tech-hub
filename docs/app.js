// 状態管理
let currentCategory = null;
let categoriesData = [];
let articlesData = {};

// 初期化
async function init() {
  try {
    // インデックスファイルを読み込む
    const indexResponse = await fetch('../data/index.json');
    if (!indexResponse.ok) {
      throw new Error('インデックスファイルの読み込みに失敗しました');
    }

    const indexData = await indexResponse.json();
    categoriesData = indexData.categories;

    // 最終更新日時を表示
    const lastUpdatedEl = document.getElementById('lastUpdated');
    if (lastUpdatedEl) {
      const date = new Date(indexData.generatedAt);
      lastUpdatedEl.textContent = date.toLocaleString('ja-JP');
    }

    // カテゴリタブを生成
    renderCategoryTabs();

    // 最初のカテゴリを選択
    if (categoriesData.length > 0) {
      selectCategory(categoriesData[0].id);
    }
  } catch (error) {
    console.error('初期化エラー:', error);
    showError('データの読み込みに失敗しました');
  }
}

// カテゴリタブを生成
function renderCategoryTabs() {
  const tabsContainer = document.getElementById('categoryTabs');
  tabsContainer.innerHTML = '';

  categoriesData.forEach(category => {
    const tab = document.createElement('button');
    tab.className = 'category-tab';
    tab.textContent = `${category.name} (${category.articleCount})`;
    tab.onclick = () => selectCategory(category.id);
    tab.dataset.categoryId = category.id;
    tabsContainer.appendChild(tab);
  });
}

// カテゴリを選択
async function selectCategory(categoryId) {
  currentCategory = categoryId;

  // タブのアクティブ状態を更新
  document.querySelectorAll('.category-tab').forEach(tab => {
    if (tab.dataset.categoryId === categoryId) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // カテゴリ情報を取得
  const category = categoriesData.find(cat => cat.id === categoryId);
  if (!category) return;

  // タイトルを更新
  const titleEl = document.getElementById('categoryTitle');
  if (titleEl) {
    titleEl.textContent = `${category.name}の記事`;
  }

  // 記事を読み込んで表示
  await loadAndRenderArticles(categoryId, category.dataFile);
}

// 記事を読み込んで表示
async function loadAndRenderArticles(categoryId, dataFile) {
  const articlesListEl = document.getElementById('articlesList');
  articlesListEl.innerHTML = '<p class="loading">記事を読み込んでいます...</p>';

  try {
    // キャッシュをチェック
    if (!articlesData[categoryId]) {
      const response = await fetch(`../data/${dataFile}`);
      if (!response.ok) {
        throw new Error('記事データの読み込みに失敗しました');
      }

      const data = await response.json();
      articlesData[categoryId] = data.articles || [];
    }

    const articles = articlesData[categoryId];

    // 記事数を更新
    const countEl = document.getElementById('articlesCount');
    if (countEl) {
      countEl.textContent = `${articles.length}件の記事`;
    }

    // 記事を表示
    renderArticles(articles);
  } catch (error) {
    console.error('記事の読み込みエラー:', error);
    showError('記事の読み込みに失敗しました');
  }
}

// 記事を表示
function renderArticles(articles) {
  const articlesListEl = document.getElementById('articlesList');

  if (articles.length === 0) {
    articlesListEl.innerHTML = '<p class="no-articles">記事がありません</p>';
    return;
  }

  articlesListEl.innerHTML = '';

  articles.forEach(article => {
    const card = createArticleCard(article);
    articlesListEl.appendChild(card);
  });
}

// 記事カードを作成
function createArticleCard(article) {
  const card = document.createElement('article');
  card.className = 'article-card';

  const title = document.createElement('h3');
  title.className = 'article-title';

  const link = document.createElement('a');
  link.href = article.link;
  link.textContent = article.title;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';

  title.appendChild(link);
  card.appendChild(title);

  // メタ情報
  const meta = document.createElement('div');
  meta.className = 'article-meta';

  const date = new Date(article.pubDate);
  const dateStr = date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  meta.innerHTML = `<span>公開日: ${dateStr}</span>`;
  card.appendChild(meta);

  // 概要
  if (article.contentSnippet) {
    const snippet = document.createElement('p');
    snippet.className = 'article-snippet';
    snippet.textContent = article.contentSnippet.substring(0, 150) + '...';
    card.appendChild(snippet);
  }

  return card;
}

// エラー表示
function showError(message) {
  const articlesListEl = document.getElementById('articlesList');
  articlesListEl.innerHTML = `<p class="error">${message}</p>`;
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', init);
