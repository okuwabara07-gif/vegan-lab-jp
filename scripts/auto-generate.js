const https = require('https');
const fs = require('fs');
const path = require('path');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const AMAZON_TRACKING_ID = process.env.AMAZON_TRACKING_ID || 'haircolorab22-22';
const RAKUTEN_AFFILIATE_ID = process.env.RAKUTEN_AFFILIATE_ID || '5253b9ed.08f9d938.5253b9ee.e71aefe8';

const TOPIC = 'ヴィーガン・植物性・クルエルティフリー';

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}


async function getUnsplashImage(keyword) {
  const queries = [
    encodeURIComponent(keyword),
    encodeURIComponent(keyword.replace(/おすすめ|ランキング|比較|TOP5/g, '').trim()),
    'beauty'
  ];
  for (const q of queries) {
    try {
      const url = `https://source.unsplash.com/800x450/?${q}`;
      return url;
    } catch(e) {}
  }
  return 'https://source.unsplash.com/800x450/?beauty,cosmetics';
}

async function generateArticle(keyword) {
  const year = new Date().getFullYear();
  const amazonUrl = `https://www.amazon.co.jp/s?k=${encodeURIComponent(keyword)}&tag=${AMAZON_TRACKING_ID}`;
  const rakutenUrl = `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(keyword)}/?f=1&af=${RAKUTEN_AFFILIATE_ID}`;


  const affiliateInstruction = `
記事内に以下のアフィリエイトリンクを自然な形で必ず3箇所以上挿入してください：
- 比較表の直後: [→ Amazonで今すぐ確認する](${amazonLink})
- 第1位レビューの末尾: [→ 楽天市場で最安値を見る](${rakutenLink})
- まとめセクション: [→ Amazonで詳細を見る](${amazonLink})
各リンクの前後に購買を促す一言（「在庫確認はこちら」「公式価格をチェック」等）を入れてください。
`;

  const prompt = `「${keyword}」について、購買意欲を高める高品質な比較記事を日本語で書いてください。

以下の形式でMDXファイルとして出力：

---
title: "【${year}年最新】${keyword}おすすめランキングTOP5｜徹底比較"
date: "${new Date().toISOString().split('T')[0]}"
excerpt: "${keyword}のおすすめ商品をランキング形式で比較。選び方のポイントも解説。"
genre: "${TOPIC}"
---


## アイキャッチ画像（記事冒頭）

![${keyword}のイメージ](https://source.unsplash.com/800x450/?${encodeURIComponent(keyword.replace(/[\u3000-\u9fff]/g, '').trim() || 'beauty')})

## 結論：おすすめ1位はこれ

（結論を先に200文字で）

[→ Amazonで確認する](${amazonUrl})
[→ 楽天で確認する](${rakutenUrl})

## 比較表

| 順位 | 商品 | 評価 | 価格帯 | 特徴 |
|------|------|------|--------|------|
| 1位 | 商品A | ★★★★★ | ¥○○○○ | ○○ |
| 2位 | 商品B | ★★★★☆ | ¥○○○○ | ○○ |
| 3位 | 商品C | ★★★★☆ | ¥○○○○ | ○○ |

## 選び方のポイント

（300文字以上）

## 各商品詳細レビュー

（各商品200文字以上）

## まとめ

（200文字以上）

> 本記事はアフィリエイト広告を含みます。`;

  const body = JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }]
  });

  const res = await request({
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Length': Buffer.byteLength(body)
    }
  }, body);

  const data = JSON.parse(res.body);
  if (!data.content || !data.content[0]) throw new Error('API error: ' + res.body.slice(0,200));
  return data.content[0].text;
}

async function main() {
  const blogDir = path.join(process.cwd(), 'content/blog');
  if (!fs.existsSync(blogDir)) fs.mkdirSync(blogDir, { recursive: true });

  const keywords = ["ヴィーガンコスメおすすめランキング", "植物性プロテイン比較", "ヴィーガンサプリおすすめ", "クルエルティフリーコスメランキング", "オーガニック食品比較"];

  for (const keyword of keywords.slice(0, 5)) {
    try {
      console.log('Generating:', keyword);
      const content = await generateArticle(keyword);
      const filename = `${Date.now()}-${keyword.replace(/[^a-zA-Z0-9\u3040-\u9fff]/g, '-')}.mdx`;
      fs.writeFileSync(path.join(blogDir, filename), content);
      console.log('Saved:', filename);
      await new Promise(r => setTimeout(r, 3000));
    } catch(e) {
      console.error('Error:', keyword, e.message);
    }
  }
  console.log('Done!');
}

main();
