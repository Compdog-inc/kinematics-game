import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";
import styles from '../styles/gamewidget.module.css';
import React, { useEffect } from "react";
import { useColorScheme } from "@mui/joy/styles";

export default function GameWidget(props: { drag?: boolean }) {
    const canvasElem = React.useRef(null as HTMLCanvasElement | null);
    const { mode, systemMode } = useColorScheme();
    const state = React.useRef({
        drag: false,
        startMx: 0,
        startMy: 0,
        startDragX: 0,
        startDragY: 0,
        ctx: null as CanvasRenderingContext2D | null,
        theme: undefined as 'light' | 'dark' | undefined,
        resizeObserver: undefined as ResizeObserver | undefined,
        bounds: {
            left: -5,
            top: 5,
            right: 5,
            bottom: -5
        }
    });

    useEffect(() => {
        state.current.theme = mode === 'system' ? systemMode : mode;
        requestAnimationFrame(render);
    }, [mode, systemMode]);

    const render = React.useCallback((_: number) => {
        if (state.current.ctx) {
            const ctx = state.current.ctx;

            const aspectBounds = (state.current.bounds.right - state.current.bounds.left) /
                (state.current.bounds.top - state.current.bounds.bottom);
            const aspectScreen = ctx.canvas.width / ctx.canvas.height;

            let scrnLeft: number;
            let scrnRight: number;
            let scrnTop: number;
            let scrnBottom: number;

            if (aspectScreen < aspectBounds) {
                scrnLeft = state.current.bounds.left;
                scrnRight = state.current.bounds.right;
                scrnTop = state.current.bounds.top / aspectScreen;
                scrnBottom = state.current.bounds.bottom / aspectScreen;
            } else {
                scrnTop = state.current.bounds.top;
                scrnBottom = state.current.bounds.bottom;
                scrnLeft = state.current.bounds.left * aspectScreen;
                scrnRight = state.current.bounds.right * aspectScreen;
            }

            const worldToPx = (x: number, y: number) => {
                return {
                    x: (x - scrnLeft) / (scrnRight - scrnLeft) * ctx.canvas.width,
                    y: (1 - (y - scrnBottom) / (scrnTop - scrnBottom)) * ctx.canvas.height
                };
            };

            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            const drawGrid = (scale: number, color: string) => {
                ctx.beginPath();
                for (let x = Math.floor(scrnLeft); x <= Math.ceil(scrnRight); x += scale) {
                    const px = worldToPx(x, 0).x;
                    ctx.moveTo(px, 0);
                    ctx.lineTo(px, ctx.canvas.height);
                }
                for (let y = Math.floor(scrnBottom); y <= Math.ceil(scrnTop); y += scale) {
                    const py = worldToPx(0, y).y;
                    ctx.moveTo(0, py);
                    ctx.lineTo(ctx.canvas.width, py);
                }
                ctx.lineWidth = 2 * scale;
                ctx.strokeStyle = color;
                ctx.stroke();
            };

            // draw grid @x1
            drawGrid(1, '#28272e');

            // draw grid @x2
            drawGrid(0.5, '#212126');

            // draw axis
            ctx.beginPath();
            const ax0 = worldToPx(0, 0);
            ctx.moveTo(ax0.x, 0);
            ctx.lineTo(ax0.x, ctx.canvas.height);
            ctx.moveTo(0, ax0.y);
            ctx.lineTo(ctx.canvas.width, ax0.y);
            ctx.strokeStyle = '#42434d';
            ctx.lineWidth = 2;
            ctx.stroke();

            const wx = state.current.startMx / ctx.canvas.width * (scrnRight - scrnLeft) + scrnLeft;
            const wy = (1 - state.current.startMy / ctx.canvas.height) * (scrnTop - scrnBottom) + scrnBottom;
            const px = worldToPx(wx, wy);
            ctx.fillStyle = 'red';
            ctx.fillRect(px.x, px.y, 10, 10);
        }
    }, [state]);

    React.useEffect(() => {
        state.current.ctx = canvasElem.current?.getContext('2d') || null;
        if (state.current.resizeObserver) {
            state.current.resizeObserver.disconnect();
        }
        state.current.resizeObserver = new ResizeObserver(() => {
            if (state.current.ctx) {
                state.current.ctx.canvas.width =
                    state.current.ctx.canvas.offsetWidth;
                state.current.ctx.canvas.height =
                    state.current.ctx.canvas.offsetHeight;
                render(0);
            }
        });
        if (canvasElem.current) {
            state.current.resizeObserver.observe(canvasElem.current);
        }
        requestAnimationFrame(render);
    }, [canvasElem, state, render]);

    const pointerDown = React.useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        state.current.drag = true;
        state.current.startMx = e.clientX;
        state.current.startMy = e.clientY;
        state.current.startDragX = state.current.bounds.left;
        state.current.startDragY = state.current.bounds.bottom;
    }, [state]);

    const pointerUp = React.useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        state.current.drag = false;
    }, [state]);

    const pointerMove = React.useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        if (state.current.drag) {
            e.preventDefault();

            const dx = e.clientX - state.current.startMx;
            const dy = e.clientY - state.current.startMy;

            if (state.current.ctx) {
                const ctx = state.current.ctx;
                const aspectBounds = (state.current.bounds.right - state.current.bounds.left) /
                    (state.current.bounds.top - state.current.bounds.bottom);
                const aspectScreen = ctx.canvas.width / ctx.canvas.height;

                let scrnLeft: number;
                let scrnRight: number;
                let scrnTop: number;
                let scrnBottom: number;

                if (aspectScreen < aspectBounds) {
                    scrnLeft = state.current.bounds.left;
                    scrnRight = state.current.bounds.right;
                    scrnTop = state.current.bounds.top / aspectScreen;
                    scrnBottom = state.current.bounds.bottom / aspectScreen;
                } else {
                    scrnTop = state.current.bounds.top;
                    scrnBottom = state.current.bounds.bottom;
                    scrnLeft = state.current.bounds.left * aspectScreen;
                    scrnRight = state.current.bounds.right * aspectScreen;
                }

                const wdx = dx / (Math.max(ctx.canvas.height, ctx.canvas.width) / (scrnRight - scrnLeft));
                const wdy = dy / (Math.min(ctx.canvas.height, ctx.canvas.width) / -(scrnTop - scrnBottom));

                if (props.drag && false) {
                    // move viewport with dragging
                    const w = state.current.bounds.right - state.current.bounds.left;
                    const h = state.current.bounds.top - state.current.bounds.bottom;
                    state.current.bounds.left = state.current.startDragX - wdx;
                    state.current.bounds.bottom = state.current.startDragY - wdy;
                    state.current.bounds.right = state.current.bounds.left + w;
                    state.current.bounds.top = state.current.bounds.bottom + h;
                }
            }

            requestAnimationFrame(render);
        }
    }, [state, props.drag]);

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