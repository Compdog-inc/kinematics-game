import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";
import styles from '../styles/gamewidget.module.css';
import { PointerEventHandler } from "react";

export default function GameWidget() {
    const pointerDown: PointerEventHandler<HTMLCanvasElement> = (e) => {
        
    };
    return (
        <Box className={styles.container}>
            <canvas onPointerDown={pointerDown}>
                <Typography level="body-lg">
                    Error loading canvas
                </Typography>
            </canvas>
        </Box>
    )
}