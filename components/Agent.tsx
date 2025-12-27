"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { elevenLabsInterview } from "@/lib/elevenlabs.sdk";
import { cn } from "@/lib/utils";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

const Agent = ({
  userName,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  // Remove Vapi-specific state variables since we're using ElevenLabs in a new window

  useEffect(() => {
    // Since ElevenLabs opens in a new window, we don't need Vapi event listeners
    // The interview will be handled externally
  }, []);

  // Note: Since ElevenLabs opens in a new window, we can't capture real-time transcripts
  // The feedback functionality would need to be handled differently or disabled for now

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    try {
      // Open ElevenLabs interview in a new window
      elevenLabsInterview.startInterview();
      
      // Simulate connection success after a short delay
      setTimeout(() => {
        setCallStatus(CallStatus.ACTIVE);
      }, 2000);
    } catch (error) {
      console.error("Error starting interview:", error);
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    // Since ElevenLabs opens in a new window, redirect back to dashboard
    router.push("/");
  };

  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {/* Transcript display removed since ElevenLabs opens in a new window */}

      <div className="w-full flex flex-col items-center gap-4">
        <p className="text-sm text-gray-500 text-center">
          Click to start the interview. The ElevenLabs AI interviewer will open in a new window.
        </p>
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={() => handleCall()}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span className="relative">
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "Start Interview"
                : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
