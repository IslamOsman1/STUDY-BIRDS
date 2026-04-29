import fs from "fs";
import path from "path";

const clientRoot = process.cwd();
const publicDir = path.join(clientRoot, "public");
const envPath = path.join(clientRoot, ".env");

const parseEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .reduce((accumulator, line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        return accumulator;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) {
        return accumulator;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();
      accumulator[key] = value;
      return accumulator;
    }, {});
};

const envValues = {
  ...parseEnvFile(envPath),
  ...process.env,
};

const siteUrl = (envValues.VITE_SITE_URL || "https://studybirds.com").replace(
  /\/+$/,
  ""
);

const publicRoutes = [
  "/",
  "/programs",
  "/universities",
  "/destinations",
  "/about",
  "/contact",
  "/partner",
];

const languages = ["en", "ar"];

const buildLocalizedUrl = (route, language) => {
  const url = new URL(siteUrl);
  url.pathname = route;
  url.searchParams.set("lang", language);
  return url.toString();
};

const sitemapEntries = publicRoutes.flatMap((route) =>
  languages.map((language) => buildLocalizedUrl(route, language))
);

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries
  .map(
    (url) => `  <url>
    <loc>${url}</loc>
  </url>`
  )
  .join("\n")}
</urlset>
`;

const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /student
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /api/

Sitemap: ${siteUrl}/sitemap.xml
`;

fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemapXml, "utf8");
fs.writeFileSync(path.join(publicDir, "robots.txt"), robotsTxt, "utf8");
