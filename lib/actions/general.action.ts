"use server";

import { generateObject, generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { feedbackSchema, dummyInterviews } from "@/constants";

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001"),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date(),
    };

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  if (interview.exists) {
    return { id: interview.id, ...interview.data() } as Interview;
  }

  const fallbackInterview = dummyInterviews.find(
    (interviewItem) => interviewItem.id === id
  );

  return fallbackInterview || null;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<(Interview & { recommendationScore?: number })[] | null> {
  try {
    const { userId, limit = 20 } = params;

    // Get the user's profile to calculate recommendation scores
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.exists ? (userDoc.data() as User) : null;

    const interviews = await db
      .collection("interviews")
      .where("finalized", "==", true)
      .limit(limit + 50) // Get more to allow for better recommendation filtering
      .get();

    if (interviews.empty) {
      return dummyInterviews;
    }

    const docs = interviews.docs
      .map((doc) => {
        const data = doc.data() as Interview;
        let recommendationScore = 0;

        // Calculate Recommendation Score based on User Profile
        if (userData) {
          // 1. Role Match (Highest weight)
          if ((userData as any).preferredRole &&
              (userData as any).preferredRole &&
              data.role.toLowerCase().includes((userData as any).preferredRole.toLowerCase())) {
            recommendationScore += 50;
          }

          // 2. Tech Stack Match
          if ((userData as any).preferredTechStack && data.techstack) {
            const commonTech = (userData as any).preferredTechStack.filter((tech: string) =>
              data.techstack.some(t => t.toLowerCase().includes(tech.toLowerCase()))
            );
            recommendationScore += commonTech.length * 15;
          }

          // 3. Experience Level Match
          if ((userData as any).experience && data.level &&
              data.level.toLowerCase().includes((userData as any).experience.toLowerCase())) {
            recommendationScore += 20;
          }

          // 4. Interview Type Match
          if ((userData as any).preferredInterviewType && data.type &&
              (userData as any).preferredInterviewType?.includes(data.type as any)) {
            recommendationScore += 15;
          }
        }

        return {
          ...data,
          recommendationScore,
        };
      })
      .filter((doc: any) => doc.userId !== userId)
      .sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0)) // Sort by score
      .slice(0, limit) as (Interview & { recommendationScore?: number })[];
    
    return docs;
  } catch (error) {
    console.error("Error getting latest interviews:", error);
    return [];
  }
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  try {
    const interviews = await db
      .collection("interviews")
      .where("userId", "==", userId)
      .get();

    if (interviews.empty) {
      return [];
    }

    // Sort manually by createdAt for now
    const docs = interviews.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      };
    }) as Interview[];
    
    // Filter out documents without createdAt and sort
    const validDocs = docs.filter(doc => doc.createdAt);
    
    return validDocs.sort((a, b) => {
      try {
        // Handle Firestore Timestamp or string date
        let dateA: Date;
        let dateB: Date;
        
        if (typeof a.createdAt === 'string') {
          dateA = new Date(a.createdAt);
        } else if (a.createdAt && typeof (a.createdAt as any).toDate === 'function') {
          dateA = (a.createdAt as any).toDate();
        } else {
          dateA = new Date(a.createdAt);
        }
        
        if (typeof b.createdAt === 'string') {
          dateB = new Date(b.createdAt);
        } else if (b.createdAt && typeof (b.createdAt as any).toDate === 'function') {
          dateB = (b.createdAt as any).toDate();
        } else {
          dateB = new Date(b.createdAt);
        }
        
        return dateB.getTime() - dateA.getTime(); // descending order
      } catch (error) {
        console.error("Error sorting interviews:", error);
        return 0;
      }
    });
  } catch (error) {
    console.error("Error getting interviews by user ID:", error);
    return [];
  }
}

export async function generateInterviewQuestions(params: {
  role: string;
  level: string;
  type: string;
  techstack: string[];
  amount: number;
}): Promise<string[]> {
  const { role, level, type, techstack, amount } = params;

  try {
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack.join(", ")}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]`,
    });

    const parsed = JSON.parse(text);

    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item));
    }

    return [];
  } catch (error) {
    console.error("Error generating interview questions:", error);
    return [];
  }
}
