import { useState } from "react";
import { Box, Container, Paper } from "@mui/material";
import { api } from "../../services/api/api";
import UploadCard from "./components/UploadCard";
import JobCard from "./components/JobCard";
import ResultCard from "./components/ResultCard";
import ChatBar from "./components/ChatBar";
import ThemeToggleButton from "../../components/ThemeToggleButton";

function HomePage() {
    const [arquivo, setArquivo] = useState<File | null>(null);
    const [textoVaga, setTextoVaga] = useState("");
    const [resultado, setResultado] = useState("");
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState("");
    const [mensagemChat, setMensagemChat] = useState("");

    const handleAnalisar = async () => {
        if (!arquivo || !textoVaga.trim()) {
            setErro("Por favor, envie um currículo e cole a descrição da vaga.");
            return;
        }

        setErro("");
        setResultado("");
        setLoading(true);

        const formData = new FormData();
        formData.append("arquivo_curriculo", arquivo);
        formData.append("texto_vaga", textoVaga);

        try {
            const response = await api.post("/analisar-vaga", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.status === "sucesso") {
                setResultado(response.data.curriculo_adaptado);
            } else {
                setErro(response.data.mensagem || "Erro desconhecido no servidor.");
            }
        } catch (error: any) {
            setErro(
                error?.response?.data?.mensagem ||
                "Erro ao conectar com o servidor. Verifique se o Flask e o Ollama estão rodando."
            );
        } finally {
            setLoading(false);
        }
    };

    const baixarTxt = () => {
        const blob = new Blob([resultado], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Curriculo_Adaptado_IA.txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const baixarPdf = () => {
        const janelaPDF = window.open("", "", "width=800,height=600");
        if (!janelaPDF) return;

        janelaPDF.document.write(`
      <html>
        <head>
          <title>Currículo Adaptado</title>
          <style>
            body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 40px; }
            pre { white-space: pre-wrap; font-family: inherit; margin: 0; }
          </style>
        </head>
        <body>
          <pre>${resultado.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
          <script>
            window.onload = function() { window.print(); window.close(); }
          <\/script>
        </body>
      </html>
    `);
        janelaPDF.document.close();
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
                    <UploadCard arquivo={arquivo} onFileChange={setArquivo} />

                    <JobCard
                        textoVaga={textoVaga}
                        onTextoVagaChange={setTextoVaga}
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

                {!!resultado && (
                    <ResultCard
                        resultado={resultado}
                        onBaixarTxt={baixarTxt}
                        onBaixarPdf={baixarPdf}
                    />
                )}

                <ChatBar
                    mensagem={mensagemChat}
                    onMensagemChange={setMensagemChat}
                />
            </Container>
        </Box>
    );
}

export default HomePage;