import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Category } from '../models/Category';

const SITE_URL = process.env.CLIENT_URL || 'https://iresstore.vercel.app';

/** Dynamic XML sitemap — auto-updates with products and categories */
export const getSitemap = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [products, categories] = await Promise.all([
      Product.find({ isActive: { $ne: false } }).select('slug updatedAt').lean(),
      Category.find().select('slug updatedAt').lean(),
    ]);

    const staticPages = [
      { loc: '/', priority: '1.0', changefreq: 'weekly' },
      { loc: '/shop', priority: '0.9', changefreq: 'daily' },
    ];

    const now = new Date().toISOString().split('T')[0];

    const urls = [
      ...staticPages.map((p) => ({
        loc: `${SITE_URL}${p.loc}`,
        lastmod: now,
        changefreq: p.changefreq,
        priority: p.priority,
      })),
      ...categories.map((c) => ({
        loc: `${SITE_URL}/shop?category=${c.slug}`,
        lastmod: (c.updatedAt ?? new Date()).toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.7',
      })),
      ...products.map((p) => ({
        loc: `${SITE_URL}/products/${p.slug}`,
        lastmod: (p.updatedAt ?? new Date()).toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.8',
      })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch {
    res.status(500).send('<?xml version="1.0"?><error>Sitemap generation failed</error>');
  }
};

export const getRobotsTxt = (_req: Request, res: Response): void => {
  const txt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /account
Disallow: /checkout
Disallow: /cart
Disallow: /login
Disallow: /register
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`;
  res.set('Content-Type', 'text/plain');
  res.set('Cache-Control', 'public, max-age=86400');
  res.send(txt);
};
