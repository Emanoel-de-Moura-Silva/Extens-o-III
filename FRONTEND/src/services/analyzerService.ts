import { api } from "./api/api";
import type {
  AnalyzeResumeRequest,
  AnalyzeResumeResponse,
} from "../models/analyzer";

export async function analyzeResume(
  payload: AnalyzeResumeRequest
): Promise<AnalyzeResumeResponse> {
  const formData = new FormData();
  formData.append("job_image", payload.job_image);
  formData.append("resume_pdf", payload.resume_pdf);

  const { data } = await api.post<AnalyzeResumeResponse>(
    "/analyze",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
}