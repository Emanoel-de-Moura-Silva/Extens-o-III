import {api} from "./api/api";
import type { AnalyzeResumeResponse } from "../models/analyzer";

export async function analyzeResume(formData: {
    job_image: File;
    resume_pdf: File;
}) {
    const data = new FormData();
    data.append("job_image", formData.job_image);
    data.append("resume_pdf", formData.resume_pdf);

    const response = await api.post("/analyze", data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
}

export async function getInterviewQuestions(payload: AnalyzeResumeResponse) {
    const response = await api.post("/interview-questions", payload);
    return response.data;
}

export async function getImprovementRecommendations(payload: AnalyzeResumeResponse) {
    const response = await api.post("/improvement-recommendations", payload);
    return response.data;
}