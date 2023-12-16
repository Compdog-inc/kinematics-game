import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";
import styles from '../styles/gamewidget.module.css';
import React, { useEffect } from "react";
import { useColorScheme } from "@mui/joy/styles";

export interface GameWidgetNode {
    id: number;
    x: number;
    y: number;
}

export interface GameWidgetFixedNode extends GameWidgetNode {
}

export interface GameWidgetRotatingNode extends GameWidgetNode {
    angle: number;
}

export interface GameWidgetTranslatingNode extends GameWidgetNode {
    angle: number;
    delta: number;
}

export interface GameWidgetClampedNode extends GameWidgetNode {
    angle: number;
    minAngle: number;
    maxAngle: number;
}

export interface GameWidgetClampedTranslatingNode extends GameWidgetNode {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    delta: number;
}

export interface GameWidgetArcTranslatingNode extends GameWidgetNode {
    cx: number;
    cy: number;
    r: number;
    minAngle: number;
    maxAngle: number;
    delta: number;
}

export interface GameWidgetPolygonalTranslatingNode extends GameWidgetNode {
    px: number[];
    py: number[];
    delta: number;
}

export interface HTMLGameWidget {
    drag: boolean;
    startMx: number;
    startMy: number;
    startDragX: number;
    startDragY: number;
    mx: number;
    my: number;
    useMp: boolean;
    ctx: CanvasRenderingContext2D | null;
    theme: 'light' | 'dark' | undefined;
    resizeObserver: ResizeObserver | undefined;
    bounds: {
        left: number,
        top: number,
        right: number,
        bottom: number
    };
    addOnClickId: number;
    dropId: number;
    render?: () => void;
    nodes: GameWidgetNode[];
}

export const mapDefaultNode = (node: GameWidgetNode): GameWidgetNode => {
    switch (node.id) {
        case 1: // rotating node
            (node as GameWidgetRotatingNode).angle = 0;
            break;
        case 2: // translating node
            (node as GameWidgetTranslatingNode).angle = 0;
            (node as GameWidgetTranslatingNode).delta = 0;
            break;
        case 3: // clamped node
            (node as GameWidgetClampedNode).minAngle = 0;
            (node as GameWidgetClampedNode).maxAngle = 90;
            (node as GameWidgetClampedNode).angle = 0;
            break;
        case 4: // clamped translating node
            (node as GameWidgetClampedTranslatingNode).x1 = node.x - 1;
            (node as GameWidgetClampedTranslatingNode).y1 = node.y;
            (node as GameWidgetClampedTranslatingNode).x2 = node.x + 1;
            (node as GameWidgetClampedTranslatingNode).y2 = node.y;
            (node as GameWidgetClampedTranslatingNode).delta = 0.5;
            break;
        case 5: // arc translating node
            (node as GameWidgetArcTranslatingNode).r = 1;
            (node as GameWidgetArcTranslatingNode).cx = node.x;
            (node as GameWidgetArcTranslatingNode).cy = node.y - 1;
            (node as GameWidgetArcTranslatingNode).minAngle = 0;
            (node as GameWidgetArcTranslatingNode).maxAngle = 90;
            (node as GameWidgetArcTranslatingNode).delta = 0;
            break;
        case 6: // polygonal translating node
            (node as GameWidgetPolygonalTranslatingNode).px = [node.x - 1, node.x - .5, node.x, node.x + .5, node.x + 1];
            (node as GameWidgetPolygonalTranslatingNode).py = [node.y, node.y - .6, node.y, node.y - .6, node.y];
            (node as GameWidgetPolygonalTranslatingNode).delta = .5;
            break;
    }
    return node;
};

export default function GameWidget({ drag, onDragOver, onDrop, stref }: {
    drag?: boolean,
    onDragOver?: React.DragEventHandler<HTMLCanvasElement>
    onDrop?: React.DragEventHandler<HTMLCanvasElement>,
    stref?: (o: HTMLGameWidget | null) => any | undefined
}) {
    const canvasElem = React.useRef(null as HTMLCanvasElement | null);
    const { mode, systemMode } = useColorScheme();
    const state = React.useRef<HTMLGameWidget>({
        drag: false,
        startMx: 0,
        startMy: 0,
        startDragX: 0,
        startDragY: 0,
        mx: 0,
        my: 0,
        useMp: false,
        ctx: null as CanvasRenderingContext2D | null,
        theme: undefined as 'light' | 'dark' | undefined,
        resizeObserver: undefined as ResizeObserver | undefined,
        bounds: {
            left: -5,
            top: 5,
            right: 5,
            bottom: -5
        },
        addOnClickId: -1,
        dropId: -1,
        nodes: []
    });

    const render = React.useCallback(() => {
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
                ctx.lineWidth = 4 * scale;
                ctx.strokeStyle = color;
                ctx.stroke();
            };

            // draw grid @x2
            drawGrid(0.5, state.current.theme === 'dark' ? '#212126' : '#ebebfa');

            // draw grid @x1
            drawGrid(1, state.current.theme === 'dark' ? '#28272e' : '#d5d5eb');

            // draw axis
            ctx.beginPath();
            const ax0 = worldToPx(0, 0);
            ctx.moveTo(ax0.x, 0);
            ctx.lineTo(ax0.x, ctx.canvas.height);
            ctx.moveTo(0, ax0.y);
            ctx.lineTo(ctx.canvas.width, ax0.y);
            ctx.strokeStyle = state.current.theme === 'dark' ? '#42434d' : '#86869e';
            ctx.lineWidth = 4;
            ctx.stroke();

            if (state.current.useMp) {
                if (state.current.dropId !== -1) {
                    ctx.fillStyle = ["red", "blue", "green", "magenta", "yellow", "orange", "teal"][state.current.dropId];
                    ctx.fillRect(state.current.mx - 30, state.current.my - 30, 60, 60);
                } else if (state.current.addOnClickId !== -1) {
                    ctx.fillStyle = ["red", "blue", "green", "magenta", "yellow", "orange", "teal"][state.current.addOnClickId];
                    ctx.fillRect(state.current.mx - 10, state.current.my - 10, 20, 20);
                }
            }
        }
    }, [state]);

    useEffect(() => {
        state.current.render = render;
    }, [render]);

    useEffect(() => {
        state.current.theme = mode === 'system' ? systemMode : mode;
        requestAnimationFrame(render);
    }, [mode, systemMode, render]);

    React.useEffect(() => {
        state.current.ctx = canvasElem.current?.getContext('2d') || null;
        if (state.current.resizeObserver) {
            state.current.resizeObserver.disconnect();
        }
        state.current.resizeObserver = new ResizeObserver(() => {
            if (state.current.ctx) {
                state.current.ctx.canvas.width =
                    state.current.ctx.canvas.offsetWidth * 2;
                state.current.ctx.canvas.height =
                    state.current.ctx.canvas.offsetHeight * 2;
                render();
            }
        });
        if (canvasElem.current) {
            state.current.resizeObserver.observe(canvasElem.current);
        }
        render();
    }, [canvasElem, state, render]);

    const pointerDown = React.useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const bounds = e.currentTarget.getBoundingClientRect();
        state.current.drag = true;
        state.current.startMx = (e.clientX - bounds.left) * 2;
        state.current.startMy = (e.clientY - bounds.top) * 2;
        state.current.startDragX = state.current.bounds.left;
        state.current.startDragY = state.current.bounds.bottom;
    }, [state]);

    const pointerUp = React.useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        state.current.drag = false;

        if (state.current.dropId === -1 && state.current.addOnClickId !== -1) {
            state.current.nodes.push(mapDefaultNode({
                id: state.current.addOnClickId,
                x: 1,
                y: 1
            }));
            requestAnimationFrame(render);
        }
    }, [state, render]);

    const pointerMove = React.useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        const bounds = e.currentTarget.getBoundingClientRect();
        state.current.mx = (e.clientX - bounds.left) * 2;
        state.current.my = (e.clientY - bounds.top) * 2;
        state.current.useMp = true;

        if (state.current.drag) {
            e.preventDefault();
            const dx = state.current.mx - state.current.startMx;
            const dy = state.current.my - state.current.startMy;

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

                const wdx = dx / (ctx.canvas.width / (scrnRight - scrnLeft)) / Math.max(1, aspectScreen);
                const wdy = dy / (ctx.canvas.height / -(scrnTop - scrnBottom)) * Math.min(1, aspectScreen);

                if (drag) {
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
        } else if (state.current.addOnClickId !== -1) {
            requestAnimationFrame(render);
        }
    }, [state, drag, render]);

    const pointerLeave = React.useCallback((_: React.PointerEvent<HTMLCanvasElement>) => {
        state.current.useMp = false;
        requestAnimationFrame(render);
    }, [state, render]);

    const dragLeave = React.useCallback((_: React.DragEvent<HTMLCanvasElement>) => {
        state.current.useMp = false;
        requestAnimationFrame(render);
    }, [state, render]);

    useEffect(() => {
        if (stref) {
            stref(state.current);
        }

        return () => {
            if (stref) {
                stref(null);
            }
        }
    }, [stref]);

    return (
        <Box className={styles.container}>
            <canvas onDragOver={onDragOver} onDrop={onDrop} onDragLeave={dragLeave} ref={canvasElem} onPointerDown={pointerDown} onPointerUp={pointerUp} onPointerMove={pointerMove} onPointerLeave={pointerLeave}>
                <Typography level="body-lg">
                    Error loading canvas
                </Typography>
            </canvas>
        </Box>
    )
}