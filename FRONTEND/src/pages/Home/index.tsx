import { useRef, useState } from "react";
import { Box, Container, Paper, Fade, Slide, Typography } from "@mui/material";
import UploadCard from "./components/UploadCard";
import JobCard from "./components/JobCard";
import ResultCard from "./components/ResultCard";
import ChatBar from "./components/ChatBar";
import type { ScenarioType } from "./components/ChatBar";
import ThemeToggleButton from "../../components/ThemeToggleButton";
import {
    analyzeResume,
    getInterviewQuestions,
    getImprovementRecommendations,
} from "../../services/analyzerService";
import type { AnalyzeResumeResponse } from "../../models/analyzer";
import { useLoading } from "../../contexts/LoadingContext";

function HomePage() {
    const [resumePdf, setResumePdf] = useState<File | null>(null);
    const [jobImage, setJobImage] = useState<File | null>(null);
    const [resultado, setResultado] = useState<AnalyzeResumeResponse | null>(null);
    const [erro, setErro] = useState("");
    const [mostrarCards, setMostrarCards] = useState(true);
    const [mostrarResultado, setMostrarResultado] = useState(false);

    const [respostaExtraTitulo, setRespostaExtraTitulo] = useState("");
    const [respostaExtraItems, setRespostaExtraItems] = useState<string[]>([]);
    const respostaExtraRef = useRef<HTMLDivElement | null>(null);

    const { openLoading, closeLoading, isLoading } = useLoading();

    const handleAnalisar = async () => {
        if (!resumePdf || !jobImage) {
            setErro("Por favor, envie o currículo em PDF e a imagem da vaga.");
            return;
        }

        setErro("");
        setResultado(null);
        setMostrarResultado(false);
        setMostrarCards(true);
        setRespostaExtraTitulo("");
        setRespostaExtraItems([]);

        openLoading("Analisando vaga...");

        try {
            console.log("ANTES DO SERVICE");

            const response = await analyzeResume({
                job_image: jobImage,
                resume_pdf: resumePdf,
            });

            console.log("RESPOSTA DO SERVICE:", response);
            console.log("DEPOIS DO SERVICE");

            setMostrarCards(false);

            setTimeout(() => {
                console.log("SETANDO RESULTADO:", response);
                setResultado(response);
                setMostrarResultado(true);
            }, 450);
        } catch (error: any) {
            console.error("ERRO COMPLETO NO HANDLE_ANALISAR:", error);
            console.error("error.response?.data:", error?.response?.data);
            console.error("error.message:", error?.message);

            setErro(
                error?.response?.data?.detail ||
                error?.response?.data?.mensagem ||
                error?.message ||
                "Erro ao conectar com o servidor."
            );
        } finally {
            closeLoading();
        }
    };

    const handleSelectScenario = async (scenario: ScenarioType) => {
        if (!resultado) return;

        setErro("");
        setRespostaExtraTitulo("");
        setRespostaExtraItems([]);

        try {
            if (scenario === "interview") {
                openLoading("Gerando perguntas da entrevista...");

                const response = await getInterviewQuestions(resultado);

                setRespostaExtraTitulo("Perguntas simuladas da entrevista");
                setRespostaExtraItems(
                    response?.perguntas ||
                    response?.questions ||
                    []
                );
            }

            if (scenario === "improve") {
                openLoading("Gerando recomendações de melhoria...");

                const response = await getImprovementRecommendations(resultado);

                setRespostaExtraTitulo("Como melhorar seu currículo para esta vaga");
                setRespostaExtraItems(
                    response?.recomendacoes ||
                    response?.recommendations ||
                    []
                );
            }

            setTimeout(() => {
                respostaExtraRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }, 100);
        } catch (error: any) {
            setErro(
                error?.response?.data?.detail ||
                error?.response?.data?.mensagem ||
                "Erro ao buscar conteúdo complementar."
            );
        } finally {
            closeLoading();
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
                        mb: 4,
                        minHeight: { xs: 520, md: 360 },
                    }}
                >
                    {mostrarCards && (
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    md: "1fr 1fr",
                                },
                                gap: 4,
                                alignItems: "stretch",
                            }}
                        >
                            <Slide
                                direction="left"
                                in={mostrarCards}
                                timeout={450}
                                mountOnEnter
                                unmountOnExit
                            >
                                <Box>
                                    <UploadCard
                                        arquivo={resumePdf}
                                        onFileChange={setResumePdf}
                                    />
                                </Box>
                            </Slide>

                            <Slide
                                direction="right"
                                in={mostrarCards}
                                timeout={450}
                                mountOnEnter
                                unmountOnExit
                            >
                                <Box>
                                    <JobCard
                                        arquivo={jobImage}
                                        onFileChange={setJobImage}
                                        onAnalisar={handleAnalisar}
                                        loading={isLoading}
                                    />
                                </Box>
                            </Slide>
                        </Box>
                    )}

            <Fade
    in={mostrarResultado}
    timeout={550}
    mountOnEnter
    unmountOnExit
>
    <Box
        sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
        }}
    >
        {resultado && <ResultCard resultado={resultado} />}

        <Box ref={respostaExtraRef}>
            {respostaExtraItems.length > 0 && (
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 4,
                        border: "1px solid",
                        borderColor: "divider",
                        backgroundColor: "background.paper",
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                        {respostaExtraTitulo}
                    </Typography>

                    <Box component="ul" sx={{ pl: 3, m: 0 }}>
                        {respostaExtraItems.map((item, index) => (
                            <Box component="li" key={`${item}-${index}`} sx={{ mb: 1 }}>
                                <Typography variant="body1">{item}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Paper>
            )}
        </Box>

        <ChatBar
            visible={!!resultado}
            disabled={isLoading}
            onSelectScenario={handleSelectScenario}
        />
    </Box>
</Fade>
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
            </Container>
        </Box>
    );
}

export default HomePage;