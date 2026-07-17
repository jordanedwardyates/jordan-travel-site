import type { MetadataRoute } from "next";

/**
 * Web app manifest. Cream paper, ink text — matches the site surface so an
 * installed shortcut and the mobile address bar stay in the brand.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BON V: A Travel Company",
    short_name: "BON V",
    description:
      "Exceptional voyages on the world's finest cruise lines — expertly chosen, personally negotiated by Jordan Yates.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f1e8",
    theme_color: "#f6f1e8",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
    ],
  };
}
