import { Box, Chip, Paper, Typography } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import type { AnalyzeResumeResponse } from "../../../models/analyzer";

type Props = {
    resultado: AnalyzeResumeResponse;
};

export default function ResultCard({ resultado }: Props) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 4,
                mb: 4,
                borderRadius: 4,
                border: "1px solid #edf2f7",
            }}
        >
            <Typography
                variant="h6"
                sx={{
                    fontWeight: 600,
                    mb: 3,
                    color: "#2d5c48",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                }}
            >
                <AutoAwesomeIcon />
                Resultado da Análise
            </Typography>

            <Box sx={{ display: "grid", gap: 3 }}>
                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                        Título da vaga
                    </Typography>
                    <Typography>{resultado.titulo_vaga}</Typography>
                </Box>

                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                        Compatibilidade
                    </Typography>
                    <Typography>{resultado.nivel_compatibilidade}%</Typography>
                </Box>

                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                        Resumo
                    </Typography>
                    <Typography>{resultado.resumo}</Typography>
                </Box>

                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                        Habilidades da vaga
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {resultado.habilidades_vaga.map((item) => (
                            <Chip key={item} label={item} />
                        ))}
                    </Box>
                </Box>

                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                        Pontos fortes
                    </Typography>
                    {resultado.pontos_fortes.map((item, index) => (
                        <Typography key={index}>• {item}</Typography>
                    ))}
                </Box>

                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                        Pontos fracos
                    </Typography>
                    {resultado.pontos_fracos.map((item, index) => (
                        <Typography key={index}>• {item}</Typography>
                    ))}
                </Box>

                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                        Habilidades faltantes
                    </Typography>
                    {resultado.habilidades_faltantes.map((item, index) => (
                        <Typography key={index}>• {item}</Typography>
                    ))}
                </Box>

                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                        Recomendação
                    </Typography>
                    <Typography>{resultado.recomendacao}</Typography>
                </Box>
            </Box>
        </Paper>
    );
}