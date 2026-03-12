import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "토끼굴",
    short_name: "토끼굴",
    description: "직장인이라면 다 아는 그 대화. 익명으로, 편하게.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b1512",
    theme_color: "#8df7a8",
    lang: "ko",
    icons: [
      {
        src: "/rabbit.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}
