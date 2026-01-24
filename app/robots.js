export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/cart',
          '/checkout/',
          '/_next/',
          '/admin/',
        ],
      },
    ],
    sitemap: 'https://intro-car-us.vercel.app/sitemap.xml',
  };
}
