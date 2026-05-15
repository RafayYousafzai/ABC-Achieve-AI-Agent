export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
  timestamp?: string;
  parts?: Array<
    | { type: "text"; text: string }
    | {
        type: "file";
        mediaType: string;
        filename?: string;
        url: string;
      }
  >;
}
