import { useState } from "react";
import { Box, Container, Paper } from "@mui/material";
import UploadCard from "./components/UploadCard";
import JobCard from "./components/JobCard";
import ResultCard from "./components/ResultCard";
import ChatBar from "./components/ChatBar";
import ThemeToggleButton from "../../components/ThemeToggleButton";
import { analyzeResume } from "../../services/analyzerService";
import type { AnalyzeResumeResponse } from "../../models/analyzer";

function HomePage() {
    const [resumePdf, setResumePdf] = useState<File | null>(null);
    const [jobImage, setJobImage] = useState<File | null>(null);
    const [resultado, setResultado] = useState<AnalyzeResumeResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState("");
    const [mensagemChat, setMensagemChat] = useState("");

    const handleAnalisar = async () => {
        if (!resumePdf || !jobImage) {
            setErro("Por favor, envie o currículo em PDF e a imagem da vaga.");
            return;
        }

        setErro("");
        setResultado(null);
        setLoading(true);

        try {
            const response = await analyzeResume({
                job_image: jobImage,
                resume_pdf: resumePdf,
            });

            setResultado(response);
        } catch (error: any) {
            setErro(
                error?.response?.data?.detail ||
                error?.response?.data?.mensagem ||
                "Erro ao conectar com o servidor."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", py: 6 }}>
            <Container
                maxWidth={false}
                sx={{
                    width: "100%",
                    maxWidth: "1180px",
                    mx: "auto",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        mb: 2,
                    }}
                >
                    <ThemeToggleButton />
                </Box>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            md: "1fr 1fr",
                        },
                        gap: 4,
                        mb: 4,
                        alignItems: "stretch",
                    }}
                >
                    <UploadCard arquivo={resumePdf} onFileChange={setResumePdf} />

                    <JobCard
                        arquivo={jobImage}
                        onFileChange={setJobImage}
                        onAnalisar={handleAnalisar}
                        loading={loading}
                    />
                </Box>

                {erro && (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            mb: 3,
                            borderRadius: 3,
                            backgroundColor: "#fff4f4",
                            color: "#b42318",
                            border: "1px solid #fecaca",
                        }}
                    >
                        {erro}
                    </Paper>
                )}

                {resultado && <ResultCard resultado={resultado} />}

                <ChatBar
                    mensagem={mensagemChat}
                    onMensagemChange={setMensagemChat}
                />
            </Container>
        </Box>
    );
}

export default HomePage;