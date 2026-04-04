import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `https://${process.env.NEXT_PUBLIC_SITE_URL || 'localhost:3000'}/sitemap.xml`,
  }
}
