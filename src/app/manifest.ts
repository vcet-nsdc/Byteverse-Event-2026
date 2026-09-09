import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NSDC ByteClash 2026",
    short_name: "ByteClash",
    description: "Premier Collegiate Competitive Programming Platform & Arena by NSDC",
    start_url: "/",
    display: "standalone",
    background_color: "#F8F9FD",
    theme_color: "#7F45DB",
    icons: [
      {
        src: "/assets/byteclash-logo.png",
        sizes: "any",
        type: "image/png",
      },
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
