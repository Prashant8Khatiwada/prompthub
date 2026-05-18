import { MetadataRoute } from 'next'
import { PRODUCTION_DOMAIN } from '@/lib/constants'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: `https://${PRODUCTION_DOMAIN}/sitemap.xml`,
  }
}
