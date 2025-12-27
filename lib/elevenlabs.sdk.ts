export class ElevenLabsInterview {
  private agentId: string;
  private branchId: string;
  private baseUrl: string;

  constructor() {
    this.agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!;
    this.branchId = process.env.NEXT_PUBLIC_ELEVENLABS_BRANCH_ID!;
    this.baseUrl = process.env.NEXT_PUBLIC_ELEVENLABS_BASE_URL!;
  }

  getInterviewUrl(): string {
    return `${this.baseUrl}?agent_id=${this.agentId}&branch_id=${this.branchId}`;
  }

  // Method to open the interview in a new window/tab
  startInterview(): void {
    window.open(this.getInterviewUrl(), '_blank');
  }

  // Method to get the interview URL for embedding or custom handling
  getUrl(): string {
    return this.getInterviewUrl();
  }
}

export const elevenLabsInterview = new ElevenLabsInterview();