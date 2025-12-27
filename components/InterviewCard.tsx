import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";

import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";

import { cn, getInterviewCoverForRole } from "@/lib/utils";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

const InterviewCard = async ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
}: InterviewCardProps) => {
  const feedback =
    userId && interviewId
      ? await getFeedbackByInterviewId({
          interviewId,
          userId,
        })
      : null;

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  const badgeColor =
    {
      Behavioral: "bg-light-400",
      Mixed: "bg-light-600",
      Technical: "bg-light-800",
    }[normalizedType] || "bg-light-600";

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  return (
    <div className="card-border w-[420px] max-sm:w-full min-h-[480px] p-6">
      <div className="h-full flex flex-col justify-between">
        <div>
          {/* Type Badge */}
          <div
            className={cn(
              "absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg",
              badgeColor
            )}
          >
            <p className="badge-text ">{normalizedType}</p>
          </div>

          {/* Cover Image */}
          <div className="w-[140px] h-[140px] rounded-2xl bg-black/40 border-2 border-white/10 flex items-center justify-center overflow-hidden">
            <Image
              src={getInterviewCoverForRole(role)}
              alt={`${role} cover`}
              width={160}
              height={160}
              className="w-full h-full object-cover"
              priority
            />
          </div>

          {/* Interview Role */}
          <h3 className="mt-6 text-2xl font-semibold capitalize">{role} Interview</h3>

          {/* Date & Score */}
          <div className="flex flex-row gap-6 mt-4 text-base">
            <div className="flex flex-row gap-2 items-center">
              <Image
                src="/calendar.svg"
                width={24}
                height={24}
                alt="calendar"
                className="opacity-80"
              />
              <span className="text-light-200">{formattedDate}</span>
            </div>

            <div className="flex flex-row gap-2 items-center">
              <Image 
                src="/star.svg" 
                width={24} 
                height={24} 
                alt="star" 
                className="opacity-80"
              />
              <span className="text-yellow-400 font-medium">{feedback?.totalScore || "---"}/100</span>
            </div>
          </div>

          {/* Feedback or Placeholder Text */}
          <p className="line-clamp-3 mt-6 text-light-300 leading-relaxed">
            {feedback?.finalAssessment ||
              "You haven't taken this interview yet. Take it now to improve your skills."}
          </p>
        </div>

        <div className="flex flex-col gap-6 mt-8">
          <div className="flex flex-wrap gap-3">
            <DisplayTechIcons techStack={techstack} />
          </div>

          <div className="flex justify-end">
            <Button className="btn-primary px-6 py-3 text-base">
              <Link
                href={
                  feedback
                    ? `/interview/${interviewId}/feedback`
                    : `/interview/${interviewId}`
                }
                className="flex items-center gap-2"
              >
                {feedback ? "View Feedback" : "Start Interview"}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
