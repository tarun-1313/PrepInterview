"use client";

import { useState, useEffect } from "react";
import { getTechLogos } from "@/lib/utils";
import TechIcon from "./TechIcon";

interface TechIconData {
  tech: string;
  url: string;
  fallbackUrl?: string;
}

interface DisplayTechIconsProps {
  techStack: string[];
}

const DisplayTechIcons = ({ techStack }: DisplayTechIconsProps) => {
  const [techIcons, setTechIcons] = useState<TechIconData[]>([]);

  useEffect(() => {
    getTechLogos(techStack).then(setTechIcons);
  }, [techStack]);

  return (
    <div className="flex flex-row gap-16">
      {techIcons.slice(0, 3).map(({ tech, url, fallbackUrl }, index) => (
        <TechIcon
          key={tech}
          tech={tech}
          url={url}
          fallbackUrl={fallbackUrl}
          index={index}
        />
      ))}
    </div>
  );
};

export default DisplayTechIcons;
