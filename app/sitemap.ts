import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/posts'
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.vercel.app'
  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    ...posts.map(post => ({ url: `${baseUrl}/blog/${post.slug}`, lastModified: new Date(post.date), changeFrequency: 'weekly' as const, priority: 0.8 }))
  ]
}