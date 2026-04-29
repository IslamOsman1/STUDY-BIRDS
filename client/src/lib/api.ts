import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("studyBirdsToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getApiAssetUrl = (path?: string) => {
  if (!path) {
    return "";
  }

  const normalizedPath = path.trim().replace(/\\/g, "/");

  if (/^https?:\/\//i.test(normalizedPath)) {
    return normalizedPath;
  }

  const uploadsMatch = normalizedPath.match(/(?:^|\/)(uploads\/.+)$/i);
  const resolvedPath = uploadsMatch ? `/${uploadsMatch[1]}` : normalizedPath;

  return `${API_ORIGIN}${resolvedPath.startsWith("/") ? resolvedPath : `/${resolvedPath}`}`;
};

export const downloadApiAsset = async (path?: string, fileName?: string) => {
  const assetUrl = getApiAssetUrl(path);

  if (!assetUrl) {
    throw new Error("File URL is missing");
  }

  const response = await fetch(assetUrl);

  if (!response.ok) {
    throw new Error("Unable to download file");
  }

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = blobUrl;
  link.download = fileName || assetUrl.split("/").pop() || "download";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};
