export default function JsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://byteclash.dev";

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "NSDC ByteClash",
    alternateName: ["ByteClash", "ByteClash 2026", "NSDC ByteClash Coding Platform"],
    url: baseUrl,
    description:
      "NSDC ByteClash is the premier collegiate competitive programming platform featuring algorithm challenges, weekly contests, practice problems, AI code review, and live tournament leaderboards.",
    inLanguage: "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/practice?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "NSDC - National Skill Development Committee",
    alternateName: "NSDC",
    url: baseUrl,
    logo: `${baseUrl}/assets/nsdc-logo.png`,
    description:
      "National Skill Development Committee organises ByteClash, India's premier collegiate competitive programming tournament and technical skill championship.",
  };

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ByteClash",
    alternateName: "NSDC ByteClash Platform",
    applicationCategory: "DeveloperApplication, EducationalApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "A modern browser-based online judge and competitive programming platform with integrated Monaco code editor, Judge0 compilation, real-time leaderboards, and AI socratic coaching.",
  };

  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "NSDC ByteClash 2026 Championship",
    description:
      "The flagship collegiate competitive coding championship featuring algorithmic problem solving, AI code optimization, debugging duels, and speed battles.",
    startDate: "2026-03-01T09:00:00+05:30",
    endDate: "2026-10-31T20:00:00+05:30",
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "VirtualLocation",
      url: baseUrl,
    },
    organizer: {
      "@type": "Organization",
      name: "NSDC Committee",
      url: baseUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
    </>
  );
}
