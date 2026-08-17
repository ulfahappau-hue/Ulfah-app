import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mawadda",
    short_name: "Mawadda",
    description: "Muslim marriage matching in Australia",
    start_url: "/",
    display: "standalone",
    background_color: "#F4EFE4",
    theme_color: "#1B3D32",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
