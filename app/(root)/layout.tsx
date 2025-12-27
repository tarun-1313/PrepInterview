import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/actions/auth.action";
import PrepCoachWidgetClient from "@/components/PrepCoachWidgetClient";

const Layout = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const initial =
    user.name && user.name.length > 0
      ? user.name.charAt(0).toUpperCase()
      : user.email.charAt(0).toUpperCase();

  const role =
    user.preferredRole || user.role || "software developer";
  const stack =
    user.preferredTechStack?.join(", ") ||
    user.techstack?.join(", ") ||
    "React, TypeScript, Node.js";
  const level = user.experience || "Fresher";

  const greeting = `Hi, I am your PrepWise Preparation Coach. I see you are preparing for a ${role} interview with ${stack}. I will help you focus on the most important concepts for your level (${level}), how to explain them in interviews, and common mistakes to avoid. Ask what to prepare, how to explain a topic, or paste a question you are unsure about.`;

  return (
    <div className="root-layout">
      <nav className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="PrepWise Logo" width={38} height={32} />
          <h2 className="text-primary-100">PrepWise</h2>
        </Link>

        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-full px-3 py-1 bg-dark-200 hover:bg-dark-300 transition-colors"
        >
          <div className="w-9 h-9 rounded-full overflow-hidden bg-dark-300 flex items-center justify-center text-sm font-semibold">
            {user.profileURL ? (
              <Image
                src={user.profileURL}
                alt="User avatar"
                width={36}
                height={36}
                className="object-cover w-full h-full"
              />
            ) : (
              <span>{initial}</span>
            )}
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-xs text-gray-400">
              {user.role || "Student"}
            </span>
            <span className="text-sm font-medium">{user.name}</span>
          </div>
        </Link>
      </nav>

      {children}
      <PrepCoachWidgetClient initialGreeting={greeting} />
    </div>
  );
};

export default Layout;
