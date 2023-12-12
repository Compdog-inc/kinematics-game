import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";
import styles from '../styles/gamewidget.module.css';
import React from "react";

export default function GameWidget() {
    const canvasElem = React.useRef(null as HTMLCanvasElement | null);
    const state = React.useRef({
        drag: false,
        startMx: 0,
        startMy: 0,
        ctx: null as CanvasRenderingContext2D | null
    });

    const render = React.useCallback((time: number) => {
        alert(time);
    }, [state]);

    React.useEffect(() => {
        state.current.ctx = canvasElem.current?.getContext('2d') || null;
        requestAnimationFrame(render);
    }, [canvasElem, state]);

    const pointerDown = React.useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        state.current.drag = true;
        state.current.startMx = e.clientX;
        state.current.startMy = e.clientY;
    }, [state]);

    const pointerUp = React.useCallback(() => {
        state.current.drag = false;
    }, [state]);

    const pointerMove = React.useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        if (state.current.drag) {
            const dx = e.clientX - state.current.startMx;
            const dy = e.clientY - state.current.startMy;
            requestAnimationFrame(render);
        }
    }, [state]);

    return (
        <Box className={styles.container}>
            <canvas ref={canvasElem} onPointerDown={pointerDown} onPointerUp={pointerUp} onPointerMove={pointerMove}>
                <Typography level="body-lg">
                    Error loading canvas
                </Typography>
            </canvas>
        </Box>
    )
}