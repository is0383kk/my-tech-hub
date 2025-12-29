import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// MIMEタイプの設定
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer(async (req, res) => {
  try {
    // URLのデコード
    let filePath = decodeURIComponent(req.url);

    // ルートパスの場合はindex.htmlを表示
    if (filePath === '/') {
      filePath = '/index.html';
    }

    // docs/ または data/ ディレクトリからファイルを配信
    let fullPath;
    if (filePath.startsWith('/data/')) {
      fullPath = path.join(__dirname, filePath);
    } else {
      fullPath = path.join(__dirname, 'docs', filePath);
    }

    // ファイルの存在確認
    await fs.access(fullPath);

    // ファイルの読み込み
    const content = await fs.readFile(fullPath);

    // MIMEタイプの取得
    const ext = path.extname(fullPath);
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

    // レスポンスの送信
    res.writeHead(200, {
      'Content-Type': mimeType,
      'Access-Control-Allow-Origin': '*',
    });
    res.end(content);

    console.log(`[${new Date().toLocaleTimeString()}] 200 ${req.url}`);
  } catch (error) {
    // ファイルが見つからない場合
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404 Not Found</h1><p>ファイルが見つかりません</p>');

    console.log(`[${new Date().toLocaleTimeString()}] 404 ${req.url}`);
  }
});

server.listen(PORT, () => {
  console.log(`\nローカルサーバーを起動しました！`);
  console.log(`\nブラウザで以下のURLを開いてください:`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`\n終了するには Ctrl+C を押してください\n`);
});
