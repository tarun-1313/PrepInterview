import { interviewCovers, mappings } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const normalizeTechName = (tech: string) => {
  const key = tech.toLowerCase().replace(/\.js$/, "");
  return mappings[key as keyof typeof mappings] || key;
};

export const getTechLogos = async (techArray: string[]) => {
  const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";
  
  // Common tech name mappings for Devicon CDN
  const deviconMappings: Record<string, string> = {
    "nextjs": "nextjs/nextjs-original",
    "expressjs": "express/express-original",
    "postgresql": "postgresql/postgresql-original",
    "kubernetes": "kubernetes/kubernetes-original",
    "docker": "docker/docker-original",
    "gcp": "googlecloud/googlecloud-original",
    "jira": "jira/jira-original",
    "azure": "azure/azure-original",
    "typescript": "typescript/typescript-original",
    "react": "react/react-original",
    "nodejs": "nodejs/nodejs-original",
    "mongodb": "mongodb/mongodb-original",
    "mysql": "mysql/mysql-original",
    "aws": "amazonwebservices/amazonwebservices-original",
    "git": "git/git-original",
    "github": "github/github-original",
    "figma": "figma/figma-original",
    "javascript": "javascript/javascript-original",
    "css3": "css3/css3-original",
    "html5": "html5/html5-original",
    "angular": "angularjs/angularjs-original",
    "vuejs": "vuejs/vuejs-original",
    "adobe": "adobe/adobe-original"
  };
  
  return techArray.map((tech) => {
    const normalized = normalizeTechName(tech);

    if (!normalized) {
      return {
        tech,
        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Crect width='20' height='20' fill='%23374151' rx='4'/%3E%3Ctext x='10' y='14' font-family='Arial, sans-serif' font-size='10' fill='%23d1d5db' text-anchor='middle' font-weight='bold'%3E" + tech.charAt(0).toUpperCase() + "%3C/text%3E%3C/svg%3E"
      };
    }

    const baseName = normalized.replace(/\.(png|webp|svg|jpg|avif)$/, '');
    const deviconKey = baseName.toLowerCase();
    const cdnPath = deviconMappings[deviconKey] || `${baseName}/${baseName}-original`;
    const cdnUrl = `${techIconBaseURL}/${cdnPath}.svg`;
    
    const localExtensions = ['.png', '.webp', '.svg', '.jpg', '.avif'];
    let localUrl = '';
    
    const foundExtension = localExtensions.find(ext => {
      const potentialPath = `/covers/${baseName}${ext}`;
      // This is a client-side check, so we can't actually check file existence here.
      // We'll rely on the browser to handle 404s for the incorrect extensions.
      // For now, we'll prioritize extensions based on the order in localExtensions.
      // If the normalized name already has an extension, use that directly.
      if (normalized.includes('.') && normalized.endsWith(ext)) {
        return true;
      }
      return false;
    });

    if (normalized.includes('.')) {
      localUrl = `/covers/${normalized}`;
    } else if (foundExtension) {
      localUrl = `/covers/${baseName}${foundExtension}`;
    } else {
      // Default to .png if no specific extension is found or provided
      localUrl = `/covers/${baseName}.png`;
    }
    
    return {
      tech,
      url: localUrl,
      fallbackUrl: cdnUrl,
    };
  });
};

export const getRandomInterviewCover = () => {
  const randomIndex = Math.floor(Math.random() * interviewCovers.length);
  return `/covers${interviewCovers[randomIndex]}`;
};

const coverByRole: Record<string, string> = {
  "frontend developer": "/covers/frontend developer.jpg",
  "full stack developer": "/covers/Full stack.avif",
  "backend engineer": "/covers/BD.png",
  "data engineer": "/covers/data engineer.png",
  "devops engineer": "/covers/Devops.png",
  "mobile developer": "/covers/Mobile app.png",
  "machine learning engineer": "/covers/Ml.png",
  "product manager": "/covers/Product Manager.png",
  "ui/ux designer": "/covers/UIUX.png",
  "cloud architect": "/covers/cloud architect.png",
  "security engineer": "/covers/Security.png",
  "data analyst": "/covers/data analyst.png",
};

export const getInterviewCoverForRole = (role: string) => {
  const key = role.toLowerCase().trim();
  const matched = coverByRole[key];
  if (matched) return matched;
  return getRandomInterviewCover();
};
