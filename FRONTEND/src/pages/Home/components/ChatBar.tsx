import { Box, Chip, Paper } from "@mui/material";

type ScenarioType = "interview" | "improve";

type ChatBarProps = {
    onSelectScenario: (scenario: ScenarioType) => void;
    disabled?: boolean;
    visible?: boolean;
    nivelCompatibilidade?: number;
};

function ChatBar({
    onSelectScenario,
    disabled = false,
    visible = true,
    nivelCompatibilidade,
}: ChatBarProps) {
    if (!visible) return null;

    const compatibilidadeMinimaParaEntrevista = 50;

    const podeSimularEntrevista =
        nivelCompatibilidade === undefined ||
        nivelCompatibilidade >= compatibilidadeMinimaParaEntrevista;

    const podeMelhorar =
        nivelCompatibilidade === undefined ||
        nivelCompatibilidade < 100;

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                mt: 3,
                borderRadius: 4,
                backgroundColor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    gap: 1.5,
                    flexWrap: "wrap",
                }}
            >
                {podeSimularEntrevista && (
                    <Chip
                        label="Simular perguntas"
                        clickable
                        disabled={disabled}
                        onClick={() => onSelectScenario("interview")}
                    />
                )}

                {podeMelhorar && (
                    <Chip
                        label="Como melhorar"
                        clickable
                        disabled={disabled}
                        onClick={() => onSelectScenario("improve")}
                    />
                )}
            </Box>
        </Paper>
    );
}

export default ChatBar;
export type { ScenarioType };