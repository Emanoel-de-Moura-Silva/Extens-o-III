import { Box, Button, Paper, Typography } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

type Props = {
    resultado: string;
    onBaixarTxt: () => void;
    onBaixarPdf: () => void;
};

export default function ResultCard({
    resultado,
    onBaixarTxt,
    onBaixarPdf,
}: Props) {
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
                Currículo Adaptado
            </Typography>

            <Box
                sx={{
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: 3,
                    p: 3,
                    mb: 3,
                }}
            >
                <Typography
                    component="pre"
                    sx={{
                        whiteSpace: "pre-wrap",
                        fontFamily: "inherit",
                        fontSize: "0.95rem",
                        lineHeight: 1.7,
                        m: 0,
                    }}
                >
                    {resultado}
                </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                    variant="contained"
                    startIcon={<InsertDriveFileIcon />}
                    onClick={onBaixarTxt}
                    sx={{
                        backgroundColor: "#2d5c48",
                        "&:hover": { backgroundColor: "#1e3f31" },
                    }}
                >
                    Baixar como TXT
                </Button>

                <Button
                    variant="contained"
                    startIcon={<PictureAsPdfIcon />}
                    onClick={onBaixarPdf}
                    sx={{
                        backgroundColor: "#e74c3c",
                        "&:hover": { backgroundColor: "#c0392b" },
                    }}
                >
                    Salvar como PDF
                </Button>
            </Box>
        </Paper>
    );
}