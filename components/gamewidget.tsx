import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";
import styles from '../styles/gamewidget.module.css';
import React, { useEffect } from "react";
import { useColorScheme } from "@mui/joy/styles";

export interface GameWidgetNode {
    id: number;
    x: number;
    y: number;
    hover?: boolean;
    selected?: boolean;
    dragging?: boolean;
    xdrag?: number;
    ydrag?: number;
    handles?: GameWidgetHandle[];
}

export interface GameWidgetHandle {
    id: number;
    x: number;
    y: number;
    hover?: boolean;
    dragging?: boolean;
    xdrag?: number;
    ydrag?: number;
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
    pxToWorld?: (x: number, y: number) => { x: number, y: number } | null;
    worldToPx?: (x: number, y: number) => { x: number, y: number } | null;
    nodes: GameWidgetNode[];
    forceLight?: boolean;
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
            (node as GameWidgetPolygonalTranslatingNode).px = [-1, -.5, 0, .5, 1];
            (node as GameWidgetPolygonalTranslatingNode).py = [0, -.6, 0, -.6, 0];
            (node as GameWidgetPolygonalTranslatingNode).delta = .5;
            break;
    }
    return node;
};

export const getHandles = (state: HTMLGameWidget, node: GameWidgetNode): GameWidgetHandle[] => {
    if (state.worldToPx) {
        const px = state.worldToPx(node.x, node.y);
        if (px) {
            switch (node.id) {
                case 2: // translating node
                    const angle = (node as GameWidgetTranslatingNode).angle * Math.PI / 180;
                    return [Object.assign(node.handles ? node.handles[0] : {}, {
                        id: 0,
                        x: px.x + 120 * Math.cos(angle),
                        y: px.y + 120 * Math.sin(angle)
                    })];
                case 3: // clamped node
                    const minAngle = (node as GameWidgetClampedNode).minAngle * Math.PI / 180 + Math.PI / 2;
                    const maxAngle = (node as GameWidgetClampedNode).maxAngle * Math.PI / 180 + Math.PI / 2;
                    return [Object.assign(node.handles ? node.handles[0] : {}, {
                        id: 0,
                        x: px.x + 120 * Math.cos(minAngle),
                        y: px.y - 120 * Math.sin(minAngle)
                    }), Object.assign(node.handles ? node.handles[1] : {}, {
                        id: 1,
                        x: px.x + 120 * Math.cos(maxAngle),
                        y: px.y - 120 * Math.sin(maxAngle)
                    })];
                case 4: // clamped translating node
                    const px1 = state.worldToPx((node as GameWidgetClampedTranslatingNode).x1, (node as GameWidgetClampedTranslatingNode).y1);
                    const px2 = state.worldToPx((node as GameWidgetClampedTranslatingNode).x2, (node as GameWidgetClampedTranslatingNode).y2);
                    if (px1 && px2) {
                        return [
                            Object.assign(node.handles ? node.handles[0] : {}, {
                                id: 0,
                                x: px1.x,
                                y: px1.y
                            }),
                            Object.assign(node.handles ? node.handles[1] : {}, {
                                id: 1,
                                x: px2.x,
                                y: px2.y
                            })
                        ];
                    }
                    break;
                case 5: // arc translating node
                    const cp = state.worldToPx((node as GameWidgetArcTranslatingNode).cx, (node as GameWidgetArcTranslatingNode).cy);
                    const rd = state.worldToPx((node as GameWidgetArcTranslatingNode).cx + (node as GameWidgetArcTranslatingNode).r, (node as GameWidgetArcTranslatingNode).cy - (node as GameWidgetArcTranslatingNode).r);
                    if (cp && rd) {
                        const rx = rd.x - cp.x;
                        const gizrad = 120 + rx;
                        const minAngle = (node as GameWidgetArcTranslatingNode).minAngle * Math.PI / 180 + Math.PI / 2;
                        const maxAngle = (node as GameWidgetArcTranslatingNode).maxAngle * Math.PI / 180 + Math.PI / 2;
                        return [
                            Object.assign(node.handles ? node.handles[0] : {}, {
                                id: 0,
                                x: cp.x,
                                y: cp.y
                            }), Object.assign(node.handles ? node.handles[1] : {}, {
                                id: 1,
                                x: cp.x + gizrad * Math.cos(minAngle),
                                y: cp.y - gizrad * Math.sin(minAngle)
                            }), Object.assign(node.handles ? node.handles[2] : {}, {
                                id: 2,
                                x: cp.x + gizrad * Math.cos(maxAngle),
                                y: cp.y - gizrad * Math.sin(maxAngle)
                            })];
                    }
                    break;
                case 6: // polygonal translating node
                    const tmp = (node as GameWidgetPolygonalTranslatingNode);
                    let pointHandles: GameWidgetHandle[] = [];

                    if (tmp.px.length > 0) {
                        const wpx0 = state.worldToPx(tmp.px[0] + node.x, tmp.py[0] + node.y);
                        if (wpx0) {
                            const firstAngle = tmp.px.length > 1 ? Math.atan2(tmp.py[0] - tmp.py[1], tmp.px[0] - tmp.px[1]) : 0;
                            pointHandles.push(
                                Object.assign(node.handles && node.handles.length > 0 && node.handles[0].id === 0 ? node.handles[0] : {},
                                    { id: 0, x: wpx0.x + 110 * Math.cos(firstAngle), y: wpx0.y - 110 * Math.sin(firstAngle) }
                                )
                            );
                        }

                        if (tmp.px.length > 1) {
                            const wpx1 = state.worldToPx(tmp.px[tmp.px.length - 1] + node.x, tmp.py[tmp.py.length - 1] + node.y);
                            if (wpx1) {
                                const lastAngle = Math.atan2(tmp.py[tmp.py.length - 1] - tmp.py[tmp.py.length - 2], tmp.px[tmp.px.length - 1] - tmp.px[tmp.px.length - 2]);
                                pointHandles.push(
                                    Object.assign(node.handles && node.handles.length > 1 && node.handles[1].id === 1 ? node.handles[1] : {},
                                        { id: 1, x: wpx1.x + 110 * Math.cos(lastAngle), y: wpx1.y - 110 * Math.sin(lastAngle) }
                                    )
                                );
                            }
                        }
                    }

                    let startInd = node.handles ? node.handles.findIndex((v => v.id === 2)) : -1;

                    for (let i = 0; i < tmp.px.length; i++) {
                        const wpx = state.worldToPx(tmp.px[i] + node.x, tmp.py[i] + node.y);
                        if (wpx) {
                            pointHandles.push(Object.assign(startInd === -1 || !node.handles ? {} : node.handles[startInd + i], { id: 2 + i, x: wpx.x, y: wpx.y }));
                        }
                    }
                    return pointHandles;
            }
        }
    }
    return [];
};

const updateHandle = (state: HTMLGameWidget, node: GameWidgetNode, handle: GameWidgetHandle) => {
    if (state.worldToPx && state.pxToWorld) {
        const px = state.worldToPx(node.x, node.y);
        if (px) {
            switch (node.id) {
                case 2: // translating node
                    {
                        const x = (handle.x - px.x) / 120;
                        const y = (handle.y - px.y) / 120;
                        (node as GameWidgetTranslatingNode).angle = Math.atan2(y, x) * 180 / Math.PI;
                    }
                    break;
                case 3: // clamped node
                    {
                        const x = (handle.x - px.x) / 120;
                        const y = -(handle.y - px.y) / 120;
                        let t = Math.atan2(y, x);
                        if (t > -Math.PI && t < 0) {
                            t = Math.PI * 2 + t;
                        }
                        const angle = (t - Math.PI / 2) * 180 / Math.PI;
                        if (handle.id === 0) {
                            (node as GameWidgetClampedNode).minAngle = angle;
                        } else if (handle.id === 1) {
                            (node as GameWidgetClampedNode).maxAngle = angle;
                        }
                        let realMin = 0;
                        let realMax = (node as GameWidgetClampedNode).maxAngle - (node as GameWidgetClampedNode).minAngle;
                        if (realMax < 0) {
                            realMax += 360;
                        }
                        let normAngle = (node as GameWidgetClampedNode).angle + 90;
                        if (normAngle > -90 && normAngle < 0) {
                            normAngle = 180 + normAngle;
                        }
                        normAngle = normAngle - 90;
                        let realAngle = normAngle - (node as GameWidgetClampedNode).minAngle;
                        if (realAngle < 0) {
                            realAngle += 360;
                        } else if (realAngle > 360) {
                            realAngle %= 360;
                        }
                        (node as GameWidgetClampedNode).angle = Math.max(realMin, Math.min(realMax, realAngle)) + (node as GameWidgetClampedNode).minAngle;
                    }
                    break;
                case 4: // clamped translating node
                    {
                        const pos = state.pxToWorld(handle.x, handle.y);
                        if (pos) {
                            if (handle.id === 0) {
                                (node as GameWidgetClampedTranslatingNode).x1 = pos.x;
                                (node as GameWidgetClampedTranslatingNode).y1 = pos.y;
                            } else if (handle.id === 1) {
                                (node as GameWidgetClampedTranslatingNode).x2 = pos.x;
                                (node as GameWidgetClampedTranslatingNode).y2 = pos.y;
                            }
                        }
                    }
                    break;
                case 5: // arc translating node
                    {
                        if (handle.id === 0) {
                            const cp = state.pxToWorld(handle.x, handle.y);
                            if (cp) {
                                (node as GameWidgetArcTranslatingNode).cx = cp.x;
                                (node as GameWidgetArcTranslatingNode).cy = cp.y;
                            }
                        } else {
                            const cp = state.worldToPx((node as GameWidgetArcTranslatingNode).cx, (node as GameWidgetArcTranslatingNode).cy);
                            if (cp) {
                                const normX = handle.x - cp.x;
                                const normY = -handle.y + cp.y;
                                const gizrad = Math.sqrt(normX * normX + normY * normY);
                                const x = normX / gizrad;
                                const y = normY / gizrad;
                                const angle = (Math.atan2(y, x) - Math.PI / 2) * 180 / Math.PI;
                                if (handle.id === 1) {
                                    (node as GameWidgetArcTranslatingNode).minAngle = angle;
                                } else if (handle.id === 2) {
                                    (node as GameWidgetArcTranslatingNode).maxAngle = angle;
                                }
                                const rad = gizrad - 120;
                                const rd = state.pxToWorld(rad + cp.x, rad - cp.y);
                                if (rd) {
                                    const r = rd.x - (node as GameWidgetArcTranslatingNode).cx;
                                    (node as GameWidgetArcTranslatingNode).r = Math.max(0.00001, r);
                                }
                            }
                        }
                    }
                    break;
                case 6: // polygonal translating node
                    {
                        const tmp = (node as GameWidgetPolygonalTranslatingNode);
                        const wd = state.pxToWorld(handle.x, handle.y);
                        if (wd) {
                            const x = wd.x - tmp.x;
                            const y = wd.y - tmp.y;
                            if (handle.id === 0) {
                                tmp.px.unshift(x);
                                tmp.py.unshift(y);
                                tmp.handles = [];
                                tmp.handles = getHandles(state, tmp);
                                const ind = tmp.handles.findIndex(v => v.id === 2);
                                tmp.handles[ind].hover = true;
                                tmp.handles[ind].dragging = true;
                                tmp.handles[ind].xdrag = handle.xdrag;
                                tmp.handles[ind].ydrag = handle.ydrag;
                            } else if (handle.id === 1) {
                                tmp.px.push(x);
                                tmp.py.push(y);
                                tmp.handles = [];
                                tmp.handles = getHandles(state, tmp);
                                const ind = tmp.handles.findIndex(v => v.id === 2 + tmp.px.length - 1);
                                tmp.handles[ind].hover = true;
                                tmp.handles[ind].dragging = true;
                                tmp.handles[ind].xdrag = handle.xdrag;
                                tmp.handles[ind].ydrag = handle.ydrag;
                            } else {
                                const ind = handle.id - 2;
                                tmp.px[ind] = x;
                                tmp.py[ind] = y;
                            }
                        }
                    }
                    break;
            }
        }
    }
};

export default React.forwardRef(function GameWidget({ drag, stref }: {
    drag?: boolean,
    stref?: (o: HTMLGameWidget | null) => any | undefined
}, ref: React.ForwardedRef<HTMLCanvasElement>) {
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

            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            const drawGrid = (scale: number, color: string) => {
                if (state.current.worldToPx) {
                    ctx.beginPath();
                    for (let x = Math.floor(scrnLeft); x <= Math.ceil(scrnRight); x += scale) {
                        const px = state.current.worldToPx(x, 0)?.x;
                        if (px) {
                            ctx.moveTo(px, 0);
                            ctx.lineTo(px, ctx.canvas.height);
                        }
                    }
                    for (let y = Math.floor(scrnBottom); y <= Math.ceil(scrnTop); y += scale) {
                        const py = state.current.worldToPx(0, y)?.y;
                        if (py) {
                            ctx.moveTo(0, py);
                            ctx.lineTo(ctx.canvas.width, py);
                        }
                    }
                    ctx.lineWidth = 4 * scale;
                    ctx.strokeStyle = color;
                    ctx.stroke();
                }
            };

            // draw grid @x2
            drawGrid(0.5, (state.current.theme === 'dark' && !state.current.forceLight) ? '#212126' : '#ebebfa');

            // draw grid @x1
            drawGrid(1, (state.current.theme === 'dark' && !state.current.forceLight) ? '#28272e' : '#d5d5eb');

            // draw axis
            if (state.current.worldToPx) {
                ctx.beginPath();
                const ax0 = state.current.worldToPx(0, 0);
                if (ax0) {
                    ctx.moveTo(ax0.x, 0);
                    ctx.lineTo(ax0.x, ctx.canvas.height);
                    ctx.moveTo(0, ax0.y);
                    ctx.lineTo(ctx.canvas.width, ax0.y);
                }
                ctx.strokeStyle = (state.current.theme === 'dark' && !state.current.forceLight) ? '#42434d' : '#86869e';
                ctx.lineWidth = 4;
                ctx.stroke();
            }

            // draw model nodes
            if (state.current.worldToPx) {
                for (const node of state.current.nodes) {
                    const mainColor = (state.current.theme === 'dark' && !state.current.forceLight) ? (node.hover ? '#cacfed' : '#fff') : (node.hover ? '#404252' : '#000');
                    switch (node.id) {
                        case 0: // fixed node
                            {
                                const px = state.current.worldToPx(node.x, node.y);
                                if (px) {
                                    ctx.beginPath();
                                    ctx.ellipse(px.x, px.y, 10, 10, 0, 0, Math.PI * 2);
                                    ctx.fillStyle = mainColor;
                                    ctx.fill();
                                }
                            }
                            break;
                        case 1: // rotating node
                            {
                                const tmp = node as GameWidgetRotatingNode;
                                const px = state.current.worldToPx(node.x, node.y);
                                if (px) {
                                    ctx.beginPath();
                                    ctx.ellipse(px.x, px.y, 20, 20, 0, 0, Math.PI * 2);
                                    ctx.strokeStyle = mainColor;
                                    ctx.lineWidth = 8;
                                    ctx.stroke();

                                    if (node.selected) {
                                        const angle = tmp.angle * Math.PI / 180 + Math.PI / 2;
                                        ctx.beginPath();
                                        ctx.moveTo(px.x + 20 * Math.cos(angle), px.y - 20 * Math.sin(angle));
                                        ctx.lineTo(px.x + 80 * Math.cos(angle), px.y - 80 * Math.sin(angle));
                                        ctx.strokeStyle = 'yellow';
                                        ctx.lineWidth = 4;
                                        ctx.stroke();
                                    }
                                }
                            }
                            break;
                        case 2: // translating node
                            {
                                const tmp = node as GameWidgetTranslatingNode;
                                const px = state.current.worldToPx(node.x, node.y);
                                if (px) {
                                    const angle = tmp.angle * Math.PI / 180;
                                    const x1 = px.x - 100 * Math.cos(angle);
                                    const y1 = px.y - 100 * Math.sin(angle);
                                    const x2 = px.x + 100 * Math.cos(angle);
                                    const y2 = px.y + 100 * Math.sin(angle);
                                    const x3 = px.x - 120 * Math.cos(angle);
                                    const y3 = px.y - 120 * Math.sin(angle);
                                    const x4 = px.x + 120 * Math.cos(angle);
                                    const y4 = px.y + 120 * Math.sin(angle);
                                    const x5 = px.x - 150 * Math.cos(angle);
                                    const y5 = px.y - 150 * Math.sin(angle);
                                    const x6 = px.x + 150 * Math.cos(angle);
                                    const y6 = px.y + 150 * Math.sin(angle);
                                    const x7 = px.x - 170 * Math.cos(angle);
                                    const y7 = px.y - 170 * Math.sin(angle);
                                    const x8 = px.x + 170 * Math.cos(angle);
                                    const y8 = px.y + 170 * Math.sin(angle);
                                    const x9 = px.x - 180 * Math.cos(angle);
                                    const y9 = px.y - 180 * Math.sin(angle);
                                    const x10 = px.x + 180 * Math.cos(angle);
                                    const y10 = px.y + 180 * Math.sin(angle);

                                    ctx.beginPath();
                                    ctx.moveTo(x1, y1);
                                    ctx.lineTo(x2, y2);
                                    ctx.moveTo(x3, y3);
                                    ctx.lineTo(x5, y5);
                                    ctx.moveTo(x4, y4);
                                    ctx.lineTo(x6, y6);
                                    ctx.moveTo(x7, y7);
                                    ctx.lineTo(x9, y9);
                                    ctx.moveTo(x8, y8);
                                    ctx.lineTo(x10, y10);
                                    ctx.lineCap = "round";
                                    ctx.strokeStyle = (state.current.theme === 'dark' && !state.current.forceLight) ? '#858699' : '#595966';
                                    ctx.lineWidth = 8;
                                    ctx.stroke();
                                    ctx.lineCap = "butt";

                                    ctx.beginPath();
                                    const rad = 20;
                                    for (let i = 0; i < 3; i++) {
                                        const a = 2 * Math.PI / 3 * i + angle - Math.PI / 2;
                                        const x = px.x + rad * Math.cos(a);
                                        const y = px.y + rad * Math.sin(a);
                                        if (i === 0)
                                            ctx.moveTo(x, y);
                                        else
                                            ctx.lineTo(x, y);
                                    }
                                    ctx.closePath();
                                    ctx.strokeStyle = mainColor;
                                    ctx.lineWidth = 8;
                                    ctx.stroke();

                                    if (node.selected) {
                                        ctx.beginPath();
                                        ctx.moveTo(px.x, px.y);
                                        ctx.lineTo(px.x + 120 * Math.cos(angle), px.y + 120 * Math.sin(angle));
                                        ctx.strokeStyle = "yellow";
                                        ctx.lineWidth = 4;
                                        ctx.stroke();

                                        ctx.beginPath();
                                        ctx.ellipse(px.x + 120 * Math.cos(angle), px.y + 120 * Math.sin(angle), 30, 30, 0, 0, Math.PI * 2);
                                        ctx.fillStyle = "yellow";
                                        ctx.fill();
                                    }
                                }
                            }
                            break;
                        case 3: // clamped node
                            {
                                const tmp = node as GameWidgetClampedNode;
                                const px = state.current.worldToPx(node.x, node.y);
                                if (px) {
                                    ctx.beginPath();
                                    ctx.ellipse(px.x, px.y, 10, 10, 0, 0, Math.PI * 2);
                                    ctx.fillStyle = mainColor;
                                    ctx.fill();

                                    ctx.beginPath();
                                    ctx.ellipse(px.x, px.y, 20, 20, 0, 0, Math.PI * 2);
                                    ctx.strokeStyle = mainColor;
                                    ctx.lineWidth = 8;
                                    ctx.stroke();

                                    if (node.selected) {
                                        const angle = tmp.angle * Math.PI / 180 + Math.PI / 2;
                                        ctx.beginPath();
                                        ctx.moveTo(px.x + 20 * Math.cos(angle), px.y - 20 * Math.sin(angle));
                                        ctx.lineTo(px.x + 80 * Math.cos(angle), px.y - 80 * Math.sin(angle));
                                        ctx.strokeStyle = 'yellow';
                                        ctx.lineWidth = 4;
                                        ctx.stroke();

                                        const minAngle = tmp.minAngle * Math.PI / 180 + Math.PI / 2;
                                        ctx.beginPath();
                                        ctx.moveTo(px.x, px.y);
                                        ctx.lineTo(px.x + 120 * Math.cos(minAngle), px.y - 120 * Math.sin(minAngle));
                                        ctx.strokeStyle = "yellow";
                                        ctx.lineWidth = 4;
                                        ctx.stroke();

                                        ctx.beginPath();
                                        ctx.ellipse(px.x + 120 * Math.cos(minAngle), px.y - 120 * Math.sin(minAngle), 30, 30, 0, 0, Math.PI * 2);
                                        ctx.fillStyle = "yellow";
                                        ctx.fill();

                                        const maxAngle = tmp.maxAngle * Math.PI / 180 + Math.PI / 2;
                                        ctx.beginPath();
                                        ctx.moveTo(px.x, px.y);
                                        ctx.lineTo(px.x + 120 * Math.cos(maxAngle), px.y - 120 * Math.sin(maxAngle));
                                        ctx.strokeStyle = "yellow";
                                        ctx.lineWidth = 4;
                                        ctx.stroke();

                                        ctx.beginPath();
                                        ctx.ellipse(px.x + 120 * Math.cos(maxAngle), px.y - 120 * Math.sin(maxAngle), 30, 30, 0, 0, Math.PI * 2);
                                        ctx.fillStyle = "yellow";
                                        ctx.fill();

                                        ctx.beginPath();
                                        ctx.ellipse(px.x, px.y, 120, 120, 0, -maxAngle, -minAngle, false);
                                        ctx.lineCap = "round";
                                        ctx.strokeStyle = "yellow";
                                        ctx.lineWidth = 4;
                                        ctx.stroke();
                                        ctx.lineCap = "butt";
                                    }
                                }
                            }
                            break;
                        case 4: // clamped translating node
                            {
                                const tmp = node as GameWidgetClampedTranslatingNode;
                                const px = state.current.worldToPx(node.x, node.y);
                                const px1 = state.current.worldToPx(tmp.x1, tmp.y1);
                                const px2 = state.current.worldToPx(tmp.x2, tmp.y2);

                                const angle = Math.atan2(tmp.y2 - tmp.y1, tmp.x2 - tmp.x1);
                                if (px && px1 && px2) {
                                    ctx.beginPath();
                                    ctx.moveTo(px1.x, px1.y);
                                    ctx.lineTo(px2.x, px2.y);
                                    ctx.lineCap = "round";
                                    ctx.strokeStyle = (state.current.theme === 'dark' && !state.current.forceLight) ? '#858699' : '#595966';
                                    ctx.lineWidth = 8;
                                    ctx.stroke();
                                    ctx.lineCap = "butt";

                                    ctx.beginPath();
                                    const rad = 20;
                                    for (let i = 0; i < 3; i++) {
                                        const a = 2 * Math.PI / 3 * i + angle - Math.PI / 2;
                                        const x = px.x + rad * Math.cos(a);
                                        const y = px.y + rad * Math.sin(a);
                                        if (i === 0)
                                            ctx.moveTo(x, y);
                                        else
                                            ctx.lineTo(x, y);
                                    }
                                    ctx.closePath();
                                    ctx.strokeStyle = mainColor;
                                    ctx.lineWidth = 8;
                                    ctx.stroke();

                                    if (node.selected) {
                                        ctx.beginPath();
                                        ctx.ellipse(px1.x, px1.y, 30, 30, 0, 0, Math.PI * 2);
                                        ctx.fillStyle = "yellow";
                                        ctx.fill();

                                        ctx.beginPath();
                                        ctx.ellipse(px2.x, px2.y, 30, 30, 0, 0, Math.PI * 2);
                                        ctx.fillStyle = "yellow";
                                        ctx.fill();
                                    }
                                }
                            }
                            break;
                        case 5: // arc translating node
                            {
                                const tmp = node as GameWidgetArcTranslatingNode;
                                const min = tmp.minAngle * Math.PI / 180 + Math.PI / 2;
                                const max = tmp.maxAngle * Math.PI / 180 + Math.PI / 2;
                                const px = state.current.worldToPx(node.x, node.y);
                                const cp = state.current.worldToPx(tmp.cx, tmp.cy);
                                const rd = state.current.worldToPx(tmp.cx + tmp.r, tmp.cy - tmp.r);
                                if (px && cp && rd) {
                                    const rx = rd.x - cp.x;
                                    const ry = rd.y - cp.y;

                                    const angle = tmp.delta * (max - min) + min - Math.PI / 2;

                                    ctx.beginPath();
                                    ctx.ellipse(cp.x, cp.y, rx, ry, 0, -max, -min, false);
                                    ctx.lineCap = "round";
                                    ctx.strokeStyle = (state.current.theme === 'dark' && !state.current.forceLight) ? '#858699' : '#595966';
                                    ctx.lineWidth = 8;
                                    ctx.stroke();
                                    ctx.lineCap = "butt";

                                    ctx.beginPath();
                                    const rad = 20;
                                    for (let i = 0; i < 3; i++) {
                                        const a = 2 * Math.PI / 3 * i + angle - Math.PI / 2;
                                        const x = px.x + rad * Math.cos(a);
                                        const y = px.y + rad * Math.sin(a);
                                        if (i === 0)
                                            ctx.moveTo(x, y);
                                        else
                                            ctx.lineTo(x, y);
                                    }
                                    ctx.closePath();
                                    ctx.strokeStyle = mainColor;
                                    ctx.lineWidth = 8;
                                    ctx.stroke();

                                    if (node.selected) {
                                        ctx.beginPath();
                                        ctx.ellipse(cp.x, cp.y, 30, 30, 0, 0, Math.PI * 2);
                                        ctx.fillStyle = "yellow";
                                        ctx.fill();

                                        const gizrad = 120 + rx;
                                        const minAngle = tmp.minAngle * Math.PI / 180 + Math.PI / 2;
                                        ctx.beginPath();
                                        ctx.moveTo(cp.x, cp.y);
                                        ctx.lineTo(cp.x + gizrad * Math.cos(minAngle), cp.y - gizrad * Math.sin(minAngle));
                                        ctx.strokeStyle = "yellow";
                                        ctx.lineWidth = 4;
                                        ctx.stroke();

                                        ctx.beginPath();
                                        ctx.ellipse(cp.x + gizrad * Math.cos(minAngle), cp.y - gizrad * Math.sin(minAngle), 30, 30, 0, 0, Math.PI * 2);
                                        ctx.fillStyle = "yellow";
                                        ctx.fill();

                                        const maxAngle = tmp.maxAngle * Math.PI / 180 + Math.PI / 2;
                                        ctx.beginPath();
                                        ctx.moveTo(cp.x, cp.y);
                                        ctx.lineTo(cp.x + gizrad * Math.cos(maxAngle), cp.y - gizrad * Math.sin(maxAngle));
                                        ctx.strokeStyle = "yellow";
                                        ctx.lineWidth = 4;
                                        ctx.stroke();

                                        ctx.beginPath();
                                        ctx.ellipse(cp.x + gizrad * Math.cos(maxAngle), cp.y - gizrad * Math.sin(maxAngle), 30, 30, 0, 0, Math.PI * 2);
                                        ctx.fillStyle = "yellow";
                                        ctx.fill();
                                    }
                                }
                            }
                            break;
                        case 6: // poylgonal translating node
                            {
                                const tmp = node as GameWidgetPolygonalTranslatingNode;
                                const px = state.current.worldToPx(node.x, node.y);
                                if (px) {
                                    ctx.beginPath();
                                    for (let i = 0; i < tmp.px.length; i++) {
                                        const wpx = state.current.worldToPx(tmp.px[i] + node.x, tmp.py[i] + node.y);
                                        if (wpx) {
                                            if (i === 0)
                                                ctx.moveTo(wpx.x, wpx.y);
                                            else
                                                ctx.lineTo(wpx.x, wpx.y);
                                        }
                                    }
                                    ctx.lineCap = "round";
                                    const join = ctx.lineJoin;
                                    ctx.lineJoin = "round";
                                    ctx.strokeStyle = (state.current.theme === 'dark' && !state.current.forceLight) ? '#858699' : '#595966';
                                    ctx.lineWidth = 8;
                                    ctx.stroke();
                                    ctx.lineCap = "butt";
                                    ctx.lineJoin = join;

                                    ctx.beginPath();
                                    const rad = 20;
                                    for (let i = 0; i < 3; i++) {
                                        const a = 2 * Math.PI / 3 * i - Math.PI / 2;
                                        const x = px.x + rad * Math.cos(a);
                                        const y = px.y + rad * Math.sin(a);
                                        if (i === 0)
                                            ctx.moveTo(x, y);
                                        else
                                            ctx.lineTo(x, y);
                                    }
                                    ctx.closePath();
                                    ctx.strokeStyle = mainColor;
                                    ctx.lineWidth = 8;
                                    ctx.stroke();

                                    if (node.selected) {
                                        for (let i = 0; i < tmp.px.length; i++) {
                                            const wpx = state.current.worldToPx(tmp.px[i] + node.x, tmp.py[i] + node.y);
                                            if (wpx) {
                                                ctx.beginPath();
                                                ctx.ellipse(wpx.x, wpx.y, 30, 30, 0, 0, Math.PI * 2);
                                                ctx.fillStyle = "yellow";
                                                ctx.fill();
                                            }
                                        }

                                        if (tmp.px.length > 0) {
                                            // render extend handles
                                            const wpx0 = state.current.worldToPx(tmp.px[0] + node.x, tmp.py[0] + node.y);
                                            if (wpx0) {
                                                const firstAngle = tmp.px.length > 1 ? Math.atan2(tmp.py[0] - tmp.py[1], tmp.px[0] - tmp.px[1]) : 0;
                                                ctx.beginPath();
                                                ctx.moveTo(wpx0.x, wpx0.y);
                                                ctx.lineTo(wpx0.x + 110 * Math.cos(firstAngle), wpx0.y - 110 * Math.sin(firstAngle));
                                                ctx.strokeStyle = "yellow";
                                                ctx.lineWidth = 4;
                                                ctx.stroke();

                                                ctx.beginPath();
                                                ctx.ellipse(wpx0.x + 110 * Math.cos(firstAngle), wpx0.y - 110 * Math.sin(firstAngle), 30, 30, 0, 0, Math.PI * 2);
                                                ctx.fillStyle = "yellow";
                                                ctx.fill();

                                                ctx.beginPath();
                                                ctx.moveTo(wpx0.x + 110 * Math.cos(firstAngle), wpx0.y - 110 * Math.sin(firstAngle) - 20);
                                                ctx.lineTo(wpx0.x + 110 * Math.cos(firstAngle), wpx0.y - 110 * Math.sin(firstAngle) + 20);
                                                ctx.moveTo(wpx0.x + 110 * Math.cos(firstAngle) - 20, wpx0.y - 110 * Math.sin(firstAngle));
                                                ctx.lineTo(wpx0.x + 110 * Math.cos(firstAngle) + 20, wpx0.y - 110 * Math.sin(firstAngle));
                                                ctx.strokeStyle = "#000";
                                                ctx.lineWidth = 5;
                                                ctx.stroke();
                                            }

                                            if (tmp.px.length > 1) {
                                                const wpx1 = state.current.worldToPx(tmp.px[tmp.px.length - 1] + node.x, tmp.py[tmp.py.length - 1] + node.y);
                                                if (wpx1) {
                                                    const lastAngle = Math.atan2(tmp.py[tmp.py.length - 1] - tmp.py[tmp.py.length - 2], tmp.px[tmp.px.length - 1] - tmp.px[tmp.px.length - 2]);
                                                    ctx.beginPath();
                                                    ctx.moveTo(wpx1.x, wpx1.y);
                                                    ctx.lineTo(wpx1.x + 110 * Math.cos(lastAngle), wpx1.y - 110 * Math.sin(lastAngle));
                                                    ctx.strokeStyle = "yellow";
                                                    ctx.lineWidth = 4;
                                                    ctx.stroke();

                                                    ctx.beginPath();
                                                    ctx.ellipse(wpx1.x + 110 * Math.cos(lastAngle), wpx1.y - 110 * Math.sin(lastAngle), 30, 30, 0, 0, Math.PI * 2);
                                                    ctx.fillStyle = "yellow";
                                                    ctx.fill();

                                                    ctx.beginPath();
                                                    ctx.moveTo(wpx1.x + 110 * Math.cos(lastAngle), wpx1.y - 110 * Math.sin(lastAngle) - 20);
                                                    ctx.lineTo(wpx1.x + 110 * Math.cos(lastAngle), wpx1.y - 110 * Math.sin(lastAngle) + 20);
                                                    ctx.moveTo(wpx1.x + 110 * Math.cos(lastAngle) - 20, wpx1.y - 110 * Math.sin(lastAngle));
                                                    ctx.lineTo(wpx1.x + 110 * Math.cos(lastAngle) + 20, wpx1.y - 110 * Math.sin(lastAngle));
                                                    ctx.strokeStyle = "#000";
                                                    ctx.lineWidth = 5;
                                                    ctx.stroke();
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            break;
                    }
                }
            }

            const drawNodeTemplate = (id: number, x: number, y: number) => {
                ctx.globalAlpha = .5;
                if (state.current.worldToPx) {
                    switch (id) {
                        case 0: // fixed node
                            {
                                const px = state.current.worldToPx(x, y);
                                if (px) {
                                    ctx.beginPath();
                                    ctx.ellipse(px.x, px.y, 10, 10, 0, 0, Math.PI * 2);
                                    ctx.fillStyle = (state.current.theme === 'dark' && !state.current.forceLight) ? '#fff' : '#000';
                                    ctx.fill();
                                }
                            }
                            break;
                        case 1: // rotating node
                            {
                                const px = state.current.worldToPx(x, y);
                                if (px) {
                                    ctx.beginPath();
                                    ctx.ellipse(px.x, px.y, 20, 20, 0, 0, Math.PI * 2);
                                    ctx.strokeStyle = (state.current.theme === 'dark' && !state.current.forceLight) ? '#fff' : '#000';
                                    ctx.lineWidth = 8;
                                    ctx.stroke();
                                }
                            }
                            break;
                        case 2: // translating node
                            {
                                const px = state.current.worldToPx(x, y);
                                if (px) {
                                    const angle = 0 * Math.PI / 180;
                                    const x1 = px.x - 100 * Math.cos(angle);
                                    const y1 = px.y - 100 * Math.sin(angle);
                                    const x2 = px.x + 100 * Math.cos(angle);
                                    const y2 = px.y + 100 * Math.sin(angle);
                                    const x3 = px.x - 120 * Math.cos(angle);
                                    const y3 = px.y - 120 * Math.sin(angle);
                                    const x4 = px.x + 120 * Math.cos(angle);
                                    const y4 = px.y + 120 * Math.sin(angle);
                                    const x5 = px.x - 150 * Math.cos(angle);
                                    const y5 = px.y - 150 * Math.sin(angle);
                                    const x6 = px.x + 150 * Math.cos(angle);
                                    const y6 = px.y + 150 * Math.sin(angle);
                                    const x7 = px.x - 170 * Math.cos(angle);
                                    const y7 = px.y - 170 * Math.sin(angle);
                                    const x8 = px.x + 170 * Math.cos(angle);
                                    const y8 = px.y + 170 * Math.sin(angle);
                                    const x9 = px.x - 180 * Math.cos(angle);
                                    const y9 = px.y - 180 * Math.sin(angle);
                                    const x10 = px.x + 180 * Math.cos(angle);
                                    const y10 = px.y + 180 * Math.sin(angle);

                                    ctx.beginPath();
                                    ctx.moveTo(x1, y1);
                                    ctx.lineTo(x2, y2);
                                    ctx.moveTo(x3, y3);
                                    ctx.lineTo(x5, y5);
                                    ctx.moveTo(x4, y4);
                                    ctx.lineTo(x6, y6);
                                    ctx.moveTo(x7, y7);
                                    ctx.lineTo(x9, y9);
                                    ctx.moveTo(x8, y8);
                                    ctx.lineTo(x10, y10);
                                    ctx.lineCap = "round";
                                    ctx.strokeStyle = (state.current.theme === 'dark' && !state.current.forceLight) ? '#858699' : '#595966';
                                    ctx.lineWidth = 8;
                                    ctx.stroke();
                                    ctx.lineCap = "butt";

                                    ctx.beginPath();
                                    const rad = 20;
                                    for (let i = 0; i < 3; i++) {
                                        const a = 2 * Math.PI / 3 * i + angle - Math.PI / 2;
                                        const x = px.x + rad * Math.cos(a);
                                        const y = px.y + rad * Math.sin(a);
                                        if (i === 0)
                                            ctx.moveTo(x, y);
                                        else
                                            ctx.lineTo(x, y);
                                    }
                                    ctx.closePath();
                                    ctx.strokeStyle = (state.current.theme === 'dark' && !state.current.forceLight) ? '#fff' : '#000';
                                    ctx.lineWidth = 8;
                                    ctx.stroke();
                                }
                            }
                            break;
                        case 3: // clamped node
                            {
                                const px = state.current.worldToPx(x, y);
                                if (px) {
                                    ctx.beginPath();
                                    ctx.ellipse(px.x, px.y, 10, 10, 0, 0, Math.PI * 2);
                                    ctx.fillStyle = (state.current.theme === 'dark' && !state.current.forceLight) ? '#fff' : '#000';
                                    ctx.fill();

                                    ctx.beginPath();
                                    ctx.ellipse(px.x, px.y, 20, 20, 0, 0, Math.PI * 2);
                                    ctx.strokeStyle = (state.current.theme === 'dark' && !state.current.forceLight) ? '#fff' : '#000';
                                    ctx.lineWidth = 8;
                                    ctx.stroke();
                                }
                            }
                            break;
                        case 4: // clamped translating node
                            {
                                const px = state.current.worldToPx(x, y);
                                const px1 = state.current.worldToPx(x - 1, y);
                                const px2 = state.current.worldToPx(x + 1, y);
                                if (px && px1 && px2) {
                                    const angle = 0;

                                    ctx.beginPath();
                                    ctx.moveTo(px1.x, px1.y);
                                    ctx.lineTo(px2.x, px2.y);
                                    ctx.lineCap = "round";
                                    ctx.strokeStyle = (state.current.theme === 'dark' && !state.current.forceLight) ? '#858699' : '#595966';
                                    ctx.lineWidth = 8;
                                    ctx.stroke();
                                    ctx.lineCap = "butt";

                                    ctx.beginPath();
                                    const rad = 20;
                                    for (let i = 0; i < 3; i++) {
                                        const a = 2 * Math.PI / 3 * i + angle - Math.PI / 2;
                                        const x = px.x + rad * Math.cos(a);
                                        const y = px.y + rad * Math.sin(a);
                                        if (i === 0)
                                            ctx.moveTo(x, y);
                                        else
                                            ctx.lineTo(x, y);
                                    }
                                    ctx.closePath();
                                    ctx.strokeStyle = (state.current.theme === 'dark' && !state.current.forceLight) ? '#fff' : '#000';
                                    ctx.lineWidth = 8;
                                    ctx.stroke();
                                }
                            }
                            break;
                        case 5: // arc translating node
                            {
                                const min = Math.PI / 2;
                                const max = Math.PI;
                                const px = state.current.worldToPx(x, y);
                                const cp = state.current.worldToPx(x, y - 1);
                                const rd = state.current.worldToPx(x + 1, y - 2);
                                if (px && cp && rd) {
                                    const rx = rd.x - cp.x;
                                    const ry = rd.y - cp.y;

                                    const angle = min - Math.PI / 2;

                                    ctx.beginPath();
                                    ctx.ellipse(cp.x, cp.y, rx, ry, 0, -min, max, true);
                                    ctx.lineCap = "round";
                                    ctx.strokeStyle = (state.current.theme === 'dark' && !state.current.forceLight) ? '#858699' : '#595966';
                                    ctx.lineWidth = 8;
                                    ctx.stroke();
                                    ctx.lineCap = "butt";

                                    ctx.beginPath();
                                    const rad = 20;
                                    for (let i = 0; i < 3; i++) {
                                        const a = 2 * Math.PI / 3 * i + angle - Math.PI / 2;
                                        const x = px.x + rad * Math.cos(a);
                                        const y = px.y + rad * Math.sin(a);
                                        if (i === 0)
                                            ctx.moveTo(x, y);
                                        else
                                            ctx.lineTo(x, y);
                                    }
                                    ctx.closePath();
                                    ctx.strokeStyle = (state.current.theme === 'dark' && !state.current.forceLight) ? '#fff' : '#000';
                                    ctx.lineWidth = 8;
                                    ctx.stroke();
                                }
                            }
                            break;
                        case 6: // poylgonal translating node
                            {
                                const px = state.current.worldToPx(x, y);
                                if (px) {
                                    ctx.beginPath();

                                    const nx = [x - 1, x - .5, x, x + .5, x + 1];
                                    const ny = [y, y - .6, y, y - .6, y];
                                    for (let i = 0; i < nx.length; i++) {
                                        const wpx = state.current.worldToPx(nx[i], ny[i]);
                                        if (wpx) {
                                            if (i === 0)
                                                ctx.moveTo(wpx.x, wpx.y);
                                            else
                                                ctx.lineTo(wpx.x, wpx.y);
                                        }
                                    }
                                    ctx.lineCap = "round";
                                    const join = ctx.lineJoin;
                                    ctx.lineJoin = "round";
                                    ctx.strokeStyle = (state.current.theme === 'dark' && !state.current.forceLight) ? '#858699' : '#595966';
                                    ctx.lineWidth = 8;
                                    ctx.stroke();
                                    ctx.lineCap = "butt";
                                    ctx.lineJoin = join;

                                    ctx.beginPath();
                                    const rad = 20;
                                    for (let i = 0; i < 3; i++) {
                                        const a = 2 * Math.PI / 3 * i - Math.PI / 2;
                                        const x = px.x + rad * Math.cos(a);
                                        const y = px.y + rad * Math.sin(a);
                                        if (i === 0)
                                            ctx.moveTo(x, y);
                                        else
                                            ctx.lineTo(x, y);
                                    }
                                    ctx.closePath();
                                    ctx.strokeStyle = (state.current.theme === 'dark' && !state.current.forceLight) ? '#fff' : '#000';
                                    ctx.lineWidth = 8;
                                    ctx.stroke();
                                }
                            }
                            break;
                    }
                }
                ctx.globalAlpha = 1;
            };

            if (state.current.useMp && state.current.pxToWorld) {
                const worldMouse = state.current.pxToWorld(state.current.mx, state.current.my);
                if (worldMouse) {
                    if (state.current.dropId !== -1) {
                        drawNodeTemplate(state.current.dropId, worldMouse.x, worldMouse.y);
                    } else if (state.current.addOnClickId !== -1) {
                        drawNodeTemplate(state.current.addOnClickId, worldMouse.x, worldMouse.y);
                    }
                }
            }
        }
    }, [state]);

    useEffect(() => {
        state.current.render = render;
        state.current.pxToWorld = (x, y) => {
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

                return {
                    x: x / ctx.canvas.width * (scrnRight - scrnLeft) + scrnLeft,
                    y: (1 - y / ctx.canvas.height) * (scrnTop - scrnBottom) + scrnBottom
                };
            }
            return null;
        };
        state.current.worldToPx = (x, y) => {
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

                return {
                    x: (x - scrnLeft) / (scrnRight - scrnLeft) * ctx.canvas.width,
                    y: (1 - (y - scrnBottom) / (scrnTop - scrnBottom)) * ctx.canvas.height
                };
            }

            return null;
        };
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
        state.current.mx = (e.clientX - bounds.left) * 2;
        state.current.my = (e.clientY - bounds.top) * 2;
        state.current.useMp = true;
        state.current.drag = true;
        state.current.startMx = (e.clientX - bounds.left) * 2;
        state.current.startMy = (e.clientY - bounds.top) * 2;
        state.current.startDragX = state.current.bounds.left;
        state.current.startDragY = state.current.bounds.bottom;

        for (const node of state.current.nodes) {
            node.hover = false;
            let handleHover = false;
            if (state.current.worldToPx) {
                if (node.handles && node.selected) {
                    // check handles
                    for (const handle of node.handles) {
                        handle.hover = false;
                        const dx = handle.x - state.current.mx;
                        const dy = handle.y - state.current.my;
                        if (dx * dx + dy * dy <= 900) {
                            handle.hover = true;
                            handleHover = true;
                        }
                    }
                }
                if (!handleHover) {
                    const px = state.current.worldToPx(node.x, node.y);
                    if (px) {
                        const dx = px.x - state.current.mx;
                        const dy = px.y - state.current.my;
                        if (dx * dx + dy * dy <= 400) {
                            node.hover = true;
                        }
                    }
                }
            }

            if (!handleHover) {
                node.selected = false;
                if (node.hover) {
                    node.selected = true;
                    node.dragging = true;
                    node.xdrag = node.x;
                    node.ydrag = node.y;
                }
            } else if (node.handles) {
                for (const handle of node.handles) {
                    if (handle.hover) {
                        handle.dragging = true;
                        handle.xdrag = handle.x;
                        handle.ydrag = handle.y;
                    }
                }
                if (node.handles) {
                    for (let i = 0; i < node.handles.length; ++i) {
                        if (node.handles[i].dragging) {
                            updateHandle(state.current, node, node.handles[i]);
                            node.handles = getHandles(state.current, node);
                        }
                    }
                }
            }
        }

        requestAnimationFrame(render);
    }, [state, render]);

    const pointerUp = React.useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        state.current.drag = false;

        const dx = Math.abs(state.current.mx - state.current.startMx);
        const dy = Math.abs(state.current.my - state.current.startMy);
        if (dx <= 5 && dy <= 5) {
            if (state.current.dropId === -1 && state.current.addOnClickId !== -1 && state.current.useMp) {
                let anyOver = false;
                for (const node of state.current.nodes) {
                    if (node.hover && node.selected) {
                        anyOver = true;
                        break;
                    }
                }
                if (!anyOver) {
                    const world = state.current.pxToWorld ? state.current.pxToWorld(state.current.mx, state.current.my) : null;
                    if (world) {
                        state.current.nodes.push(mapDefaultNode({
                            id: state.current.addOnClickId,
                            x: world.x,
                            y: world.y
                        }));
                        requestAnimationFrame(render);
                    }
                }
            }
        }

        for (const node of state.current.nodes) {
            if (node.dragging) {
                node.dragging = false;
            }
            if (node.handles) {
                for (const handle of node.handles) {
                    if (handle.dragging) {
                        handle.dragging = false;
                    }
                }
            }
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

                let fallthrough = true;
                for (const node of state.current.nodes) {
                    if (node.dragging && typeof (node.xdrag) === 'number' && typeof (node.ydrag) === 'number') {
                        fallthrough = false;
                        node.x = node.xdrag + wdx * Math.max(1, aspectScreen);
                        node.y = node.ydrag + wdy / Math.min(1, aspectScreen);
                        node.handles = getHandles(state.current, node);
                    } else if (node.handles) {
                        for (let i = 0; i < node.handles.length; ++i) {
                            if (node.handles[i].dragging && typeof (node.handles[i].xdrag) === 'number' && typeof (node.handles[i].ydrag) === 'number') {
                                fallthrough = false;
                                node.handles[i].x = (node.handles[i].xdrag || 0) + dx;
                                node.handles[i].y = (node.handles[i].ydrag || 0) + dy;
                                updateHandle(state.current, node, node.handles[i]);
                                node.handles = getHandles(state.current, node);
                            }
                        }
                    }
                }

                if (drag && fallthrough) {
                    // move viewport with dragging
                    const w = state.current.bounds.right - state.current.bounds.left;
                    const h = state.current.bounds.top - state.current.bounds.bottom;
                    state.current.bounds.left = state.current.startDragX - wdx;
                    state.current.bounds.bottom = state.current.startDragY - wdy;
                    state.current.bounds.right = state.current.bounds.left + w;
                    state.current.bounds.top = state.current.bounds.bottom + h;

                    for (const node of state.current.nodes) {
                        node.handles = getHandles(state.current, node);
                    }
                }
            }

            requestAnimationFrame(render);
        } else if (state.current.addOnClickId !== -1) {
            requestAnimationFrame(render);
        } else if (state.current.worldToPx) {
            // check for hover
            let changed = false;
            for (const node of state.current.nodes) {
                const old = node.hover;
                node.hover = false;
                const px = state.current.worldToPx(node.x, node.y);
                if (px) {
                    const dx = px.x - state.current.mx;
                    const dy = px.y - state.current.my;
                    if (dx * dx + dy * dy <= 400) {
                        node.hover = true;
                    }
                }
                if (old != node.hover)
                    changed = true;
            }
            if (changed)
                requestAnimationFrame(render);
        }
    }, [state, drag, render]);

    const pointerLeave = React.useCallback((_: React.PointerEvent<HTMLCanvasElement>) => {
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
            <canvas ref={r => {
                if (typeof ref === "function") ref(r); else if (ref !== null) ref.current = r;
                canvasElem.current = r;
            }} onPointerDown={pointerDown} onPointerUp={pointerUp} onPointerMove={pointerMove} onPointerLeave={pointerLeave}>
                <Typography level="body-lg">
                    Error loading canvas
                </Typography>
            </canvas>
        </Box>
    )
});