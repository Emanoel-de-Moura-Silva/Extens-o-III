import { Box, Paper, Typography, Chip, Divider } from "@mui/material";
import type { ImproveResponse } from "../../../models/improve";

interface ImproveResultCardProps {
  data: ImproveResponse;
  title?: string;
}

export function ImproveResultCard({
  data,
  title = "Como melhorar seu currículo para esta vaga",
}: ImproveResultCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        mt: 3,
        p: 3,
        borderRadius: 4,
        backgroundColor: "#111827",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "#fff",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        {title}
      </Typography>

      <Box
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 3,
          backgroundColor: "rgba(255,255,255,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
            Pontuação geral
          </Typography>

          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {data.pontuacao_geral}/100
          </Typography>
        </Box>

        <Chip
          label={
            data.pontuacao_geral >= 80
              ? "Bom potencial"
              : data.pontuacao_geral >= 60
              ? "Precisa melhorar"
              : "Atenção necessária"
          }
          sx={{
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.24)",
            backgroundColor: "rgba(255,255,255,0.08)",
            fontWeight: 700,
          }}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          Resumo diagnóstico
        </Typography>

        <Typography variant="body2" sx={{ lineHeight: 1.7, opacity: 0.92 }}>
          {data.resumo_diagnostico}
        </Typography>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.12)", mb: 3 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          Melhorias por seção
        </Typography>

        {data.melhorias_por_secao.map((item, index) => (
          <Box
            key={`${item.secao}-${index}`}
            sx={{
              mb: 2,
              p: 2,
              borderRadius: 3,
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
              {item.secao}
            </Typography>

            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Problemas encontrados
            </Typography>

            <Box component="ul" sx={{ mt: 0, mb: 2, pl: 3 }}>
              {item.problemas.map((problema, idx) => (
                <li key={`problema-${index}-${idx}`}>
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    {problema}
                  </Typography>
                </li>
              ))}
            </Box>

            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Sugestões de melhoria
            </Typography>

            <Box component="ul" sx={{ mt: 0, pl: 3 }}>
              {item.sugestoes.map((sugestao, idx) => (
                <li key={`sugestao-${index}-${idx}`}>
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    {sugestao}
                  </Typography>
                </li>
              ))}
            </Box>
          </Box>
        ))}
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.12)", mb: 3 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          Habilidades recomendadas
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {data.habilidades_recomendadas.map((item, index) => (
            <Chip
              key={`habilidade-${index}`}
              label={item}
              sx={{
                color: "#fff",
                backgroundColor: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          Palavras-chave faltantes
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {data.palavras_chave_faltantes.map((item, index) => (
            <Chip
              key={`palavra-chave-${index}`}
              label={item}
              sx={{
                color: "#fff",
                backgroundColor: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            />
          ))}
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          Ações prioritárias
        </Typography>

        <Box component="ol" sx={{ mt: 0, pl: 3 }}>
          {data.acoes_prioritarias.map((item, index) => (
            <li key={`acao-${index}`}>
              <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                {item}
              </Typography>
            </li>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}