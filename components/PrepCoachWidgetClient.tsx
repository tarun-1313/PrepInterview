"use client";

import PrepCoachWidget from "@/components/PrepCoachWidget";

type PrepCoachWidgetClientProps = {
  initialGreeting: string;
};

const PrepCoachWidgetClient = ({
  initialGreeting,
}: PrepCoachWidgetClientProps) => (
  <PrepCoachWidget initialGreeting={initialGreeting} />
);

export default PrepCoachWidgetClient;

