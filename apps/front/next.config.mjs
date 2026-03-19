export default {
  eslint: {
    // Le lint est vérifié par le hook pre-push (pnpm check), pas pendant le build
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/sitemap.xml",
        destination: "/api/sitemap",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/reservation', // L'URL de votre ancien WordPress
        destination: '/reserver',           // Votre nouvelle page NextJS
        permanent: true,                  // true = Redirection 301 (Permanent)
      },
      {
        source: '/en/book', // L'URL de votre ancien WordPress
        destination: '/reserver',           // Votre nouvelle page NextJS
        permanent: true,                  // true = Redirection 301 (Permanent)
      },
      {
        source: '/es/reservar', // L'URL de votre ancien WordPress
        destination: '/reserver',           // Votre nouvelle page NextJS
        permanent: true,                  // true = Redirection 301 (Permanent)
      },
      {
        source: '/mention-legale', // L'URL de votre ancien WordPress
        destination: '/legal',           // Votre nouvelle page NextJS
        permanent: true,                  // true = Redirection 301 (Permanent)
      },
      {
        source: '/en/accueil-english', // L'URL de votre ancien WordPress
        destination: '/',           // Votre nouvelle page NextJS
        permanent: true,                  // true = Redirection 301 (Permanent)
      },
      {
        source: '/2022/06/27/bonjour-tout-le-monde', // L'URL de votre ancien WordPress
        destination: '/blog',           // Votre nouvelle page NextJS
        permanent: true,                  // true = Redirection 301 (Permanent)
      },
      {
        source: '/comments/feed', // L'URL de votre ancien WordPress
        destination: '/blog',           // Votre nouvelle page NextJS
        permanent: true,                  // true = Redirection 301 (Permanent)
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
        pathname: "/images/**",
      },
    ],
  },
};
