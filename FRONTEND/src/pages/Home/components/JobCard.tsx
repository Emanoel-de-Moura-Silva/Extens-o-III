import {
    Box,
    Button,
    CircularProgress,
    Paper,
    Typography,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";

type Props = {
    arquivo: File | null;
    onFileChange: (file: File | null) => void;
    onAnalisar: () => void;
    loading: boolean;
};

export default function JobCard({
    arquivo,
    onFileChange,
    onAnalisar,
    loading,
}: Props) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 5,
                borderRadius: "32px",
                border: "1px solid #edf2f7",
                textAlign: "center",
                minHeight: 430,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                backgroundColor: "background.paper",
                borderColor: "divider",
                color: "text.primary",
            }}
        >
            <Typography
                variant="h6"
                sx={{
                    fontWeight: 600,
                    mb: 3,
                    fontSize: "2rem",
                }}
            >
                Vaga
            </Typography>

            <Box sx={{ color: "#758ca3", mb: 3 }}>
                <DescriptionIcon sx={{ fontSize: 72 }} />
            </Box>

            <Box sx={{ textAlign: "left", mt: 1 }}>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 500,
                        mb: 1.5,
                        fontSize: "1rem",
                    }}
                >
                    Foto ou print da vaga
                </Typography>

                <Button
                    variant="contained"
                    component="label"
                    fullWidth
                    sx={{
                        mb: 4,
                        backgroundColor: "#ffffff",
                        color: "#163a63",
                        fontWeight: 600,
                        py: 2,
                        borderRadius: "20px",
                        boxShadow: "none",
                        border: "1px solid #dbe3ef",
                        textTransform: "none",
                        "&:hover": {
                            backgroundColor: "#f8fafc",
                            boxShadow: "none",
                        },
                    }}
                >
                    {arquivo ? arquivo.name : "Selecionar imagem da vaga"}
                    <input
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                    />
                </Button>

                <Button
                    variant="contained"
                    fullWidth
                    onClick={onAnalisar}
                    disabled={loading}
                    sx={{
                        backgroundColor: "#9cbde8",
                        color: "#163a63",
                        fontWeight: 700,
                        py: 2,
                        borderRadius: "20px",
                        boxShadow: "none",
                        fontSize: "1rem",
                        textTransform: "uppercase",
                        "&:hover": {
                            backgroundColor: "#86aee0",
                            boxShadow: "none",
                        },
                    }}
                >
                    {loading ? (
                        <>
                            <CircularProgress size={20} sx={{ mr: 1, color: "#163a63" }} />
                            Analisando...
                        </>
                    ) : (
                        "Analisar Vaga"
                    )}
                </Button>
            </Box>
        </Paper>
    );
}