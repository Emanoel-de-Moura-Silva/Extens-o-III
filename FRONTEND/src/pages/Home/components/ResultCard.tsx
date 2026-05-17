import type { ReactNode } from "react";
import {
    Box,
    Chip,
    Divider,
    LinearProgress,
    Paper,
    Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import type { AnalyzeResumeResponse } from "../../../models/analyzer";

type Props = {
    resultado: AnalyzeResumeResponse;
};

function getCompatibilityLabel(value: number) {
    if (value >= 80) return "Boa compatibilidade";
    if (value >= 60) return "Compatibilidade moderada";
    return "Baixa compatibilidade";
}

function getRecommendationColor(recomendacao: string) {
    const value = recomendacao.toLowerCase();

    if (value.includes("recomendado") || value.includes("aprovado")) {
        return {
            color: "#bbf7d0",
            backgroundColor: "rgba(34, 197, 94, 0.14)",
            border: "1px solid rgba(34, 197, 94, 0.35)",
        };
    }

    if (value.includes("desenvolvimento") || value.includes("atenção")) {
        return {
            color: "#fde68a",
            backgroundColor: "rgba(245, 158, 11, 0.14)",
            border: "1px solid rgba(245, 158, 11, 0.35)",
        };
    }

    return {
        color: "#bfdbfe",
        backgroundColor: "rgba(59, 130, 246, 0.14)",
        border: "1px solid rgba(59, 130, 246, 0.35)",
    };
}

function CircleIcon({
    children,
    color,
    backgroundColor,
}: {
    children: ReactNode;
    color: string;
    backgroundColor: string;
}) {
    return (
        <Box
            component="span"
            sx={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color,
                backgroundColor,
                fontWeight: 900,
                fontSize: "0.95rem",
                flexShrink: 0,
            }}
        >
            {children}
        </Box>
    );
}

function SectionList({
    title,
    items,
    icon,
}: {
    title: string;
    items: string[];
    icon: ReactNode;
}) {
    return (
        <Box
            sx={{
                p: 2.5,
                borderRadius: "22px",
                backgroundColor: "rgba(255, 255, 255, 0.045)",
                border: "1px solid rgba(255, 255, 255, 0.09)",
                height: "100%",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1.5,
                }}
            >
                {icon}

                <Typography
                    variant="subtitle2"
                    sx={{
                        fontWeight: 800,
                        color: "#f8fafc",
                    }}
                >
                    {title}
                </Typography>
            </Box>

            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                {items.map((item, index) => (
                    <Box component="li" key={`${title}-${index}`} sx={{ mb: 0.8 }}>
                        <Typography
                            variant="body2"
                            sx={{
                                lineHeight: 1.6,
                                color: "#cbd5e1",
                            }}
                        >
                            {item}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}

export default function ResultCard({ resultado }: Props) {
    const compatibility = resultado.nivel_compatibilidade;
    const recommendationStyle = getRecommendationColor(resultado.recomendacao);

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 3, md: 4 },
                mb: 4,
                borderRadius: "32px",
                border: "1px solid rgba(148, 163, 184, 0.25)",
                background:
                    "linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(15,23,42,0.92) 100%)",
                color: "#fff",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    mb: 3,
                    flexWrap: "wrap",
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 800,
                        color: "#d1fae5",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}
                >
                    <AutoAwesomeIcon />
                    Resultado da Análise
                </Typography>

                <Chip
                    label={resultado.recomendacao}
                    sx={{
                        ...recommendationStyle,
                        fontWeight: 800,
                    }}
                />
            </Box>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1.4fr 0.8fr" },
                    gap: 2.5,
                    mb: 3,
                }}
            >
                <Box
                    sx={{
                        p: 2.5,
                        borderRadius: "24px",
                        backgroundColor: "rgba(255, 255, 255, 0.045)",
                        border: "1px solid rgba(255, 255, 255, 0.09)",
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            color: "#94a3b8",
                            fontWeight: 800,
                            textTransform: "uppercase",
                            letterSpacing: 0.8,
                        }}
                    >
                        Título da vaga
                    </Typography>

                    <Typography
                        variant="h5"
                        sx={{
                            mt: 1,
                            fontWeight: 850,
                            color: "#f8fafc",
                            lineHeight: 1.25,
                        }}
                    >
                        {resultado.titulo_vaga}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        p: 2.5,
                        borderRadius: "24px",
                        backgroundColor: "rgba(59, 130, 246, 0.10)",
                        border: "1px solid rgba(59, 130, 246, 0.25)",
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            color: "#94a3b8",
                            fontWeight: 800,
                            textTransform: "uppercase",
                            letterSpacing: 0.8,
                        }}
                    >
                        Compatibilidade
                    </Typography>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: 1,
                            mt: 1,
                            flexWrap: "wrap",
                        }}
                    >
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 900,
                                color: "#bfdbfe",
                                lineHeight: 1,
                            }}
                        >
                            {compatibility}%
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                color: "#cbd5e1",
                                fontWeight: 700,
                            }}
                        >
                            {getCompatibilityLabel(compatibility)}
                        </Typography>
                    </Box>

                    <LinearProgress
                        variant="determinate"
                        value={compatibility}
                        sx={{
                            mt: 2,
                            height: 9,
                            borderRadius: 999,
                            backgroundColor: "rgba(255,255,255,0.08)",
                            "& .MuiLinearProgress-bar": {
                                borderRadius: 999,
                                backgroundColor: "#93c5fd",
                            },
                        }}
                    />
                </Box>
            </Box>

            <Box
                sx={{
                    p: 2.5,
                    borderRadius: "24px",
                    backgroundColor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    mb: 3,
                }}
            >
                <Typography
                    variant="subtitle2"
                    sx={{
                        fontWeight: 800,
                        mb: 1,
                        color: "#f8fafc",
                    }}
                >
                    Resumo
                </Typography>

                <Typography
                    variant="body1"
                    sx={{
                        lineHeight: 1.7,
                        color: "#cbd5e1",
                    }}
                >
                    {resultado.resumo}
                </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography
                    variant="subtitle2"
                    sx={{
                        fontWeight: 800,
                        mb: 1.5,
                        color: "#f8fafc",
                    }}
                >
                    Habilidades da vaga
                </Typography>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {resultado.habilidades_vaga.map((item) => (
                        <Chip
                            key={item}
                            label={item}
                            sx={{
                                color: "#e2e8f0",
                                backgroundColor: "rgba(148, 163, 184, 0.14)",
                                border: "1px solid rgba(148, 163, 184, 0.22)",
                                fontWeight: 700,
                            }}
                        />
                    ))}
                </Box>
            </Box>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.10)", mb: 3 }} />

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                    gap: 2,
                }}
            >
                <SectionList
                    title="Pontos fortes"
                    items={resultado.pontos_fortes}
                    icon={
                        <CircleIcon
                            color="#86efac"
                            backgroundColor="rgba(34, 197, 94, 0.14)"
                        >
                            ✓
                        </CircleIcon>
                    }
                />

                <SectionList
                    title="Pontos fracos"
                    items={resultado.pontos_fracos}
                    icon={
                        <CircleIcon
                            color="#facc15"
                            backgroundColor="rgba(250, 204, 21, 0.14)"
                        >
                            !
                        </CircleIcon>
                    }
                />

                <SectionList
                    title="Habilidades faltantes"
                    items={resultado.habilidades_faltantes}
                    icon={
                        <CircleIcon
                            color="#93c5fd"
                            backgroundColor="rgba(147, 197, 253, 0.14)"
                        >
                            +
                        </CircleIcon>
                    }
                />
            </Box>
        </Paper>
    );
}