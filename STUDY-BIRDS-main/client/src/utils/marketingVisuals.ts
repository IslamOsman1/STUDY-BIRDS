import { getApiAssetUrl } from "../lib/api";

const photoUrl = (id: string, width = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=82`;

export const studentHeroImage = photoUrl("photo-1522202176988-66273c2fd55f", 1200);
export const campusFallbackImage = photoUrl("photo-1523050854058-8df90110c9f1", 900);
export const advisorDeskImage = photoUrl("photo-1523240795612-9a054b0db644", 900);
export const documentPrepImage = photoUrl("photo-1450101499163-c8848c66ca85", 900);
export const cityLightsImage = photoUrl("photo-1494526585095-c41746248156", 900);

export const studentPortraits = [
  {
    name: "Lina Hassan",
    src: photoUrl("photo-1494790108377-be9c29b29330", 420),
  },
  {
    name: "Omar Nabil",
    src: photoUrl("photo-1500648767791-00dcc994a43e", 420),
  },
  {
    name: "Priya Menon",
    src: photoUrl("photo-1534751516642-a1af1ef26a56", 420),
  },
  {
    name: "Yousef Adel",
    src: photoUrl("photo-1506794778202-cad84cf45f1d", 420),
  },
  {
    name: "Maya Salem",
    src: photoUrl("photo-1544005313-94ddf0286df2", 420),
  },
];

export const journeyShowcaseImages = [
  {
    title: "Campus planning",
    src: advisorDeskImage,
  },
  {
    title: "Document preparation",
    src: documentPrepImage,
  },
  {
    title: "City life",
    src: cityLightsImage,
  },
];

const destinationImages: Record<string, string> = {
  Australia: photoUrl("photo-1523482580672-f109ba8cb9be", 900),
  Canada: photoUrl("photo-1517935706615-2717063c2225", 900),
  Germany: photoUrl("photo-1467269204594-9661b134dd2b", 900),
  Ireland: photoUrl("photo-1590089415225-401ed6f9db8e", 900),
  Turkey: photoUrl("photo-1541432901042-2d8bd64b4a9b", 900),
  "United Kingdom": photoUrl("photo-1513635269975-59663e0ac1ad", 900),
  "United States": photoUrl("photo-1501594907352-04cda38ebc29", 900),
};

export const getStudentPhoto = (studentName?: string) => {
  const matchedPhoto = studentPortraits.find((photo) => photo.name === studentName);
  if (matchedPhoto) {
    return matchedPhoto.src;
  }

  const nameScore = Array.from(studentName || "student").reduce((score, char) => score + char.charCodeAt(0), 0);
  return studentPortraits[nameScore % studentPortraits.length].src;
};

export const getDestinationImage = (countryName?: string, providedImage?: string) => {
  if (providedImage) {
    return getApiAssetUrl(providedImage);
  }

  return destinationImages[countryName || ""] || campusFallbackImage;
};
