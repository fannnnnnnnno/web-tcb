export function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: "TCB – Fighting Game Community Bojonegoro",
    url: "https://web-tcb.vercel.app",
    logo: "https://web-tcb.vercel.app/logo.png",
    description:
      "Komunitas game fighting berbasis di Bojonegoro. Tekken 8, Street Fighter 6, gathering mingguan, dan tournament lokal.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bojonegoro",
      addressRegion: "Jawa Timur",
      addressCountry: "ID",
    },
    sameAs: ["https://www.instagram.com/alfreurre/"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
