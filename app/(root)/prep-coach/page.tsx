import PrepCoachChat from "@/components/PrepCoachChat";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Page = async () => {
  const user = await getCurrentUser();

  const role =
    user?.preferredRole || user?.role || "software developer";
  const stack =
    user?.preferredTechStack?.join(", ") ||
    user?.techstack?.join(", ") ||
    "React, TypeScript, Node.js";
  const level = user?.experience || "Fresher";

  const greeting = `Hi, I am your PrepWise Preparation Coach. I see you are preparing for a ${role} interview with ${stack}. I will help you focus on the most important concepts for your level (${level}), how to explain them in interviews, and common mistakes to avoid. Ask what to prepare, how to explain a topic, or paste a question you are unsure about.`;

  return (
    <div className="root-layout">
      <PrepCoachChat initialGreeting={greeting} />
    </div>
  );
};

export default Page;
