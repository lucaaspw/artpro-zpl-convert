export interface User {
  id: string;
  google_id: string;
  email: string;
  name: string;
  avatar_url: string;
  created_at: string;
}

export interface Conversion {
  id: string;
  user_id: string;
  original_filename: string;
  label_count: number;
  format: string;
  pdf_url: string | null;
  status: "processing" | "ready" | "error";
  processing_time_ms: number | null;
  created_at: string;
}

export interface ConvertResponse {
  id: string;
  pdf_url: string;
  label_count: number;
  processing_time_ms: number;
}

export interface ConversionsListResponse {
  data: Conversion[];
  total: number;
  page: number;
}

export interface UploadFile {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
}
