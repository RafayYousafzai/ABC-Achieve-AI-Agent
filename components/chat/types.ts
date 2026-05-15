export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
  timestamp?: string;
  parts?: Array<{ type: string; text: string }>;
}
