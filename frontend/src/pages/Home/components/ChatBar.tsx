import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import SendIcon from "@mui/icons-material/Send";

type Props = {
  mensagem: string;
  onMensagemChange: (value: string) => void;
};

export default function ChatBar({ mensagem, onMensagemChange }: Props) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1,
        mt: 3,
        borderRadius: "999px",
        border: "1px solid #e6eee8",
        display: "flex",
        alignItems: "center",
        gap: 2,
        width: "100%",
        maxWidth: "1180px",
        mx: "auto",
        backgroundColor: "background.paper",
        borderColor: "divider",
        color: "text.primary",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2.5,
          borderRight: "1px solid #f0f0f0",
          gap: 1.5,
          minWidth: "fit-content",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            color: "text.secondary",
            display: { xs: "none", sm: "block" },
            fontSize: "1rem",
          }}
        >
          Fale com o Agente
        </Typography>

        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            backgroundColor: "#edf5f1",
            color: "#86bba7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SmartToyIcon />
        </Box>
      </Box>

      <TextField
        variant="standard"
        placeholder="Digite sua mensagem..."
        value={mensagem}
        onChange={(e) => onMensagemChange(e.target.value)}
        fullWidth
        sx={{
          "& .MuiInputBase-root:before": {
            borderBottom: "none",
          },
          "& .MuiInputBase-root:after": {
            borderBottom: "none",
          },
          "& .MuiInputBase-root:hover:not(.Mui-disabled):before": {
            borderBottom: "none",
          },
        }}
      />

      <Button
        sx={{
          minWidth: 48,
          width: 48,
          height: 48,
          borderRadius: "50%",
          backgroundColor: "#a7e5cb",
          color: "#fff",
          "&:hover": { backgroundColor: "#92dabf" },
        }}
      >
        <SendIcon />
      </Button>
    </Paper>
  );
}