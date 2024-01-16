import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";
import styles from '../styles/gamewidget.module.css';
import React, { useEffect } from "react";
import { useColorScheme } from "@mui/joy/styles";
import { closestDeltaOnSegment, maximizeAngle, normalizeAngle, distanceToSegmentSquared } from "../utils/algebra";

export class GameWidgetNode {
    id: number;
    x: number;
    y: number;
    hover: boolean;
    selected: boolean;
    dragging: boolean;
    xdrag?: number;
    ydrag?: number;
    handles?: GameWidgetHandle[];
    children: GameWidgetLink[];
    parent: GameWidgetLink | null;

    constructor(id: number, x: number, y: number) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.hover = false;
        this.selected = false;
        this.dragging = false;
        this.xdrag = undefined;
        this.ydrag = undefined;
        this.handles = undefined;
        this.children = [];
        this.parent = null;
    }
}

export class GameWidgetLink {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    length: number;
    // arbitrary parent/child relationship for kinematics/inverse kinematics
    parent: GameWidgetNode | null;
    child: GameWidgetNode | null;
    // editor values
    hover: boolean;
    dragging: boolean;
    selected: boolean;
    xdrag?: number;
    ydrag?: number;
    edgeOffset?: number;
    dragTarget?: "child" | "parent";

    constructor(x1: number, y1: number, x2: number, y2: number, parent: GameWidgetNode | null, child: GameWidgetNode | null) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.length = 0;
        this.parent = parent;
        this.child = child;
        this.hover = false;
        this.dragging = false;
        this.selected = false;
    }
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

export class GameWidgetFixedNode extends GameWidgetNode {
    constructor(x: number, y: number) {
        super(0, x, y);
    }
}

export class GameWidgetRotatingNode extends GameWidgetNode {
    angle: number;

    constructor(x: number, y: number, angle: number) {
        super(1, x, y);
        this.angle = angle;
    }
}

export class GameWidgetTranslatingNode extends GameWidgetNode {
    angle: number;
    delta: number;

    constructor(x: number, y: number, angle: number, delta: number) {
        super(2, x, y);
        this.angle = angle;
        this.delta = delta;
    }
}

export class GameWidgetClampedNode extends GameWidgetNode {
    angle: number;
    minAngle: number;
    maxAngle: number;

    constructor(x: number, y: number, angle: number, minAngle: number, maxAngle: number) {
        super(3, x, y);
        this.angle = angle;
        this.minAngle = minAngle;
        this.maxAngle = maxAngle;
    }
}

export class GameWidgetClampedTranslatingNode extends GameWidgetNode {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    delta: number;

    constructor(x: number, y: number, x1: number, y1: number, x2: number, y2: number, delta: number) {
        super(4, x, y);
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.delta = delta;
    }
}

export class GameWidgetArcTranslatingNode extends GameWidgetNode {
    cx: number;
    cy: number;
    r: number;
    minAngle: number;
    maxAngle: number;
    delta: number;

    constructor(x: number, y: number, cx: number, cy: number, r: number, minAngle: number, maxAngle: number, delta: number) {
        super(5, x, y);
        this.cx = cx;
        this.cy = cy;
        this.r = r;
        this.minAngle = minAngle;
        this.maxAngle = maxAngle;
        this.delta = delta;
    }
}

export class GameWidgetPolygonalTranslatingNode extends GameWidgetNode {
    px: number[];
    py: number[];
    delta: number;

    constructor(x: number, y: number, px: number[], py: number[], delta: number) {
        super(6, x, y);
        this.px = px;
        this.py = py;
        this.delta = delta;
    }
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
    addOnClickId: number | string;
    addOnClickLink: GameWidgetLink | null;
    dropId: number;
    dropLink: boolean;
    render?: () => void;
    updateSelection?: () => void;
    pxToWorld?: (x: number, y: number) => { x: number, y: number } | null;
    worldToPx?: (x: number, y: number) => { x: number, y: number } | null;
    nodes: GameWidgetNode[];
    simLinks: GameWidgetLink[];
    forceLight?: boolean;
    deleteMode: boolean;
    testNode: (id: number, selected: boolean) => boolean;
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
            (node as GameWidgetPolygonalTranslatingNode).px = [node.x + -1, node.x + -.5, node.x + 0, node.x + .5, node.x + 1];
            (node as GameWidgetPolygonalTranslatingNode).py = [node.y + 0, node.y + -.6, node.y + 0, node.y + -.6, node.y + 0];
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
                        const wpx0 = state.worldToPx(tmp.px[0], tmp.py[0]);
                        if (wpx0) {
                            const firstAngle = tmp.px.length > 1 ? Math.atan2(tmp.py[0] - tmp.py[1], tmp.px[0] - tmp.px[1]) : 0;
                            pointHandles.push(
                                Object.assign(node.handles && node.handles.length > 0 && node.handles[0].id === 0 ? node.handles[0] : {},
                                    { id: 0, x: wpx0.x + 110 * Math.cos(firstAngle), y: wpx0.y - 110 * Math.sin(firstAngle) }
                                )
                            );
                        }

                        if (tmp.px.length > 1) {
                            const wpx1 = state.worldToPx(tmp.px[tmp.px.length - 1], tmp.py[tmp.py.length - 1]);
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
                        const wpx = state.worldToPx(tmp.px[i], tmp.py[i]);
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

const deleteHandle = (state: HTMLGameWidget, node: GameWidgetNode, handle: GameWidgetHandle) => {
    if (state && node.id === 6) {
        const ind = handle.id - 2;
        if (ind >= 0) {
            (node as GameWidgetPolygonalTranslatingNode).px.splice(ind, 1);
            (node as GameWidgetPolygonalTranslatingNode).py.splice(ind, 1);
        }
    }
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
                            updateNodePosition(state, node);
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
                        updateNodePosition(state, node);
                    }
                    break;
                case 6: // polygonal translating node
                    {
                        const tmp = (node as GameWidgetPolygonalTranslatingNode);
                        const wd = state.pxToWorld(handle.x, handle.y);
                        if (wd) {
                            const x = wd.x;
                            const y = wd.y;
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

const calculateClosestNode = (state: HTMLGameWidget, node: GameWidgetNode) => {
    if (state) {
        switch (node.id) {
            case 4: // clamped translating node
                {
                    const tmp = (node as GameWidgetClampedTranslatingNode);
                    (node as GameWidgetClampedTranslatingNode).delta = closestDeltaOnSegment(tmp.x, tmp.y, tmp.x1, tmp.y1, tmp.x2, tmp.y2);
                }
                break;
            case 5: // arc translating node
                {
                    const tmp = (node as GameWidgetArcTranslatingNode);
                    const min = normalizeAngle(tmp.minAngle * Math.PI / 180 + Math.PI / 2);
                    const max = maximizeAngle(tmp.maxAngle * Math.PI / 180 + Math.PI / 2, min);
                    const angle = maximizeAngle(Math.atan2(tmp.y - tmp.cy, tmp.x - tmp.cx), min);
                    (node as GameWidgetArcTranslatingNode).delta = Math.max(0, Math.min(1, (angle - min) / (max - min)));
                }
                break;
        }
    }
};

const updateNodePosition = (state: HTMLGameWidget, node: GameWidgetNode) => {
    if (state) {
        switch (node.id) {
            case 4: // clamped translating node
                {
                    const tmp = (node as GameWidgetClampedTranslatingNode);
                    node.x = tmp.x1 * (1 - tmp.delta) + tmp.x2 * tmp.delta;
                    node.y = tmp.y1 * (1 - tmp.delta) + tmp.y2 * tmp.delta;
                }
                break;
            case 5: // arc translating node
                {
                    const tmp = (node as GameWidgetArcTranslatingNode);
                    const min = normalizeAngle(tmp.minAngle * Math.PI / 180 + Math.PI / 2);
                    const max = maximizeAngle(tmp.maxAngle * Math.PI / 180 + Math.PI / 2, min);
                    const angle = tmp.delta * (max - min) + min;
                    node.x = tmp.cx + tmp.r * Math.cos(angle);
                    node.y = tmp.cy + tmp.r * Math.sin(angle);
                }
                break;
        }
    }
};

const updateLinkPosition = (node: GameWidgetNode) => {
    if (node.parent != null) {
        node.parent.x2 = node.x;
        node.parent.y2 = node.y;
    }

    for (const link of node.children) {
        link.x1 = node.x;
        link.y1 = node.y;
    }
};

export const updateLink = (link: GameWidgetLink) => {
    const dx = link.x2 - link.x1;
    const dy = link.y2 - link.y1;
    link.length = Math.sqrt(dx * dx + dy * dy);
}

const solveKinematics = (state: HTMLGameWidget, node: GameWidgetNode) => {
    switch (node.id) {
        case 1: // rotating node
            {
                for (const link of node.children) {
                    const dx = link.x2 - node.x;
                    const dy = link.y2 - node.y;
                    const angle = Math.atan2(dy, dx);

                    link.x2 = link.length * Math.cos(angle) + link.x1;
                    link.y2 = link.length * Math.sin(angle) + link.y1;

                    if (link.child != null) {
                        link.child.x = link.x2;
                        link.child.y = link.y2;
                    }
                }
            }
            break;
        case 2: // translating node
            {
                for (const link of node.children) {
                    const dx = link.x2 - node.x;
                    const dy = link.y2 - node.y;
                    const angle = Math.atan2(dy, dx);

                    link.x2 = link.length * Math.cos(angle) + link.x1;
                    link.y2 = link.length * Math.sin(angle) + link.y1;

                    if (link.child != null) {
                        link.child.x = link.x2;
                        link.child.y = link.y2;
                    }
                }
            }
            break;
        case 3: // clamped node
            {
                const tmp = (node as GameWidgetClampedNode);
                for (const link of node.children) {
                    const dx = link.x2 - node.x;
                    const dy = link.y2 - node.y;
                    let angle = Math.atan2(dy, dx);

                    let realMin = 0;
                    let realMax = (tmp.maxAngle - tmp.minAngle) * Math.PI / 180;
                    if (realMax < 0) {
                        realMax += 2 * Math.PI;
                    }
                    let normAngle = angle;
                    if (normAngle > -Math.PI / 2 && normAngle < 0) {
                        normAngle = Math.PI + normAngle;
                    }
                    normAngle = normAngle - Math.PI / 2;
                    let realAngle = normAngle - tmp.minAngle * Math.PI / 180;
                    if (realAngle < 0) {
                        realAngle += Math.PI * 2;
                    } else if (realAngle > Math.PI * 2) {
                        realAngle %= Math.PI * 2;
                    }
                    angle = Math.max(realMin, Math.min(realMax, realAngle)) + tmp.minAngle * Math.PI / 180 + Math.PI / 2;

                    link.x2 = link.length * Math.cos(angle) + link.x1;
                    link.y2 = link.length * Math.sin(angle) + link.y1;

                    if (link.child != null) {
                        link.child.x = link.x2;
                        link.child.y = link.y2;
                    }
                }
            }
            break;
        case 4: // rotating node
            {
                for (const link of node.children) {
                    const dx = link.x2 - node.x;
                    const dy = link.y2 - node.y;
                    const angle = Math.atan2(dy, dx);

                    link.x2 = link.length * Math.cos(angle) + link.x1;
                    link.y2 = link.length * Math.sin(angle) + link.y1;

                    if (link.child != null) {
                        link.child.x = link.x2;
                        link.child.y = link.y2;
                    }
                }
            }
            break;
    }
    calculateClosestNode(state, node);
    updateNodePosition(state, node);
    updateLinkPosition(node);
    for (const link of node.children) {
        if (link.child) {
            solveKinematics(state, link.child);
        }
    }
};

export default React.forwardRef(function GameWidget({ drag, stref, onNodeSelect, onNodeSelectionClear, onOpError }: {
    drag?: boolean,
    stref?: (o: HTMLGameWidget | null) => any | undefined,
    onNodeSelect?: () => void,
    onNodeSelectionClear?: () => void,
    onOpError?: (err: string) => void
}, ref: React.ForwardedRef<HTMLCanvasElement>) {
    const canvasElem = React.useRef(null as HTMLCanvasElement | null);
    const hadSelection = React.useRef(false);
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
        addOnClickLink: null,
        dropId: -1,
        dropLink: false,
        nodes: [],
        simLinks: [],
        deleteMode: false,
        testNode: (id, selected) => {
            for (const node of state.current.nodes) {
                if (node.id === id && (node.selected || !selected)) {
                    return true;
                }
            }
            return false;
        }
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

            const drawLink = (link: GameWidgetLink) => {
                if (state.current.worldToPx) {
                    const p1 = state.current.worldToPx(link.x1, link.y1);
                    const p2 = state.current.worldToPx(link.x2, link.y2);
                    if (p1 && p2) {
                        const cx = (p1.x + p2.x) / 2;
                        const cy = (p1.y + p2.y) / 2;
                        ctx.beginPath();
                        ctx.moveTo(link.dragTarget === 'child' ? p1.x : cx, link.dragTarget === 'child' ? p1.y : cy);
                        ctx.lineTo(link.dragTarget === 'child' ? cx : p2.x, link.dragTarget === 'child' ? cy : p2.y);
                        ctx.lineCap = "round";
                        const baseCol = (state.current.theme === 'dark' && !state.current.forceLight) ?
                            (link.selected ? '#6a6fa8' : '#858699') :
                            (link.selected ? '#38388a' : '#595966');
                        ctx.strokeStyle = baseCol;
                        ctx.lineWidth = 8;
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(link.dragTarget === 'child' ? cx : p1.x, link.dragTarget === 'child' ? cy : p1.y);
                        ctx.lineTo(link.dragTarget === 'child' ? p2.x : cx, link.dragTarget === 'child' ? p2.y : cy);
                        ctx.lineCap = "round";
                        ctx.strokeStyle = (state.current.theme === 'dark' && !state.current.forceLight) ?
                            (link.hover ? '#fff' : baseCol) :
                            (link.hover ? '#000' : baseCol);
                        ctx.lineWidth = link.hover ? 11 : 8;
                        ctx.stroke()
                        ctx.lineCap = "butt";

                        ctx.fillStyle = (state.current.theme === 'dark' && !state.current.forceLight) ?
                            '#858699' :
                            '#595966';
                        ctx.font = "38px Helvetica";
                        const label = ctx.measureText(link.length.toPrecision(3));
                        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
                        const swap = angle < -Math.PI / 2 || angle > Math.PI / 2;
                        ctx.fillText(link.length.toPrecision(3), cx - label.width / 2 + (swap ? -1 : 1) * label.width * Math.sin(angle), cy - (label.actualBoundingBoxDescent - label.actualBoundingBoxAscent) / 2 - 30);
                    }
                }
            };

            const drawLinkTemplate = (x: number, y: number) => {
                if (state.current.worldToPx) {
                    ctx.globalAlpha = .5;
                    ctx.beginPath();
                    const p1 = state.current.worldToPx(x - 1, y);
                    const p2 = state.current.worldToPx(x + 1, y);
                    if (p1 && p2) {
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.lineCap = "round";
                        ctx.strokeStyle = (state.current.theme === 'dark' && !state.current.forceLight) ? '#858699' : '#595966';
                        ctx.lineWidth = 8;
                        ctx.stroke();
                        ctx.lineCap = "butt";
                    }
                    ctx.globalAlpha = 1;
                }
            };

            if (state.current.worldToPx) {
                // draw simulation links
                if (state.current.addOnClickLink != null)
                    drawLink(state.current.addOnClickLink);

                for (const link of state.current.simLinks) {
                    drawLink(link);
                }

                // draw model nodes
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
                                        const a = 2 * Math.PI / 3 * i + angle + Math.PI / 2;
                                        const x = px.x + rad * Math.cos(-a);
                                        const y = px.y + rad * Math.sin(-a);
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
                                const min = normalizeAngle(tmp.minAngle * Math.PI / 180 + Math.PI / 2);
                                const max = maximizeAngle(tmp.maxAngle * Math.PI / 180 + Math.PI / 2, min);
                                const px = state.current.worldToPx(node.x, node.y);
                                const cp = state.current.worldToPx(tmp.cx, tmp.cy);
                                const rd = state.current.worldToPx(tmp.cx + tmp.r, tmp.cy - tmp.r);
                                if (px && cp && rd) {
                                    const rx = rd.x - cp.x;
                                    const ry = rd.y - cp.y;

                                    const angle = tmp.delta * (max - min) + min;

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
                                        const a = 2 * Math.PI / 3 * i - angle;
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
                                        const wpx = state.current.worldToPx(tmp.px[i], tmp.py[i]);
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
                                            const wpx = state.current.worldToPx(tmp.px[i], tmp.py[i]);
                                            if (wpx) {
                                                ctx.beginPath();
                                                ctx.ellipse(wpx.x, wpx.y, 30, 30, 0, 0, Math.PI * 2);
                                                ctx.fillStyle = "yellow";
                                                ctx.fill();
                                            }
                                        }

                                        if (tmp.px.length > 0) {
                                            // render extend handles
                                            const wpx0 = state.current.worldToPx(tmp.px[0], tmp.py[0]);
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
                                                const wpx1 = state.current.worldToPx(tmp.px[tmp.px.length - 1], tmp.py[tmp.py.length - 1]);
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
                    } else if (typeof (state.current.addOnClickId) === 'number' && state.current.addOnClickId !== -1) {
                        drawNodeTemplate(state.current.addOnClickId, worldMouse.x, worldMouse.y);
                    } else if ((state.current.addOnClickId === 'link' || state.current.dropLink) && state.current.addOnClickLink == null) {
                        drawLinkTemplate(worldMouse.x, worldMouse.y);
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
        state.current.updateSelection = () => {
            let anySelected = false;
            for (const node of state.current.nodes) {
                if (node.selected) {
                    anySelected = true;
                    break;
                }
            }
            if (!anySelected) {
                for (const link of state.current.simLinks) {
                    if (link.selected) {
                        anySelected = true;
                        break;
                    }
                }
            }
            if (anySelected && !hadSelection.current) {
                hadSelection.current = true;
            } else if (!anySelected && hadSelection.current) {
                hadSelection.current = false;
                if (typeof (onNodeSelectionClear) === 'function')
                    onNodeSelectionClear();
            }

            // Workaround for custom node selection updates
            if (anySelected) {
                if (typeof (onNodeSelect) === 'function')
                    onNodeSelect();
            }
        };
    }, [render, onNodeSelectionClear, onNodeSelect]);

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

        let anySelected = false;

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
                    anySelected = true;
                    node.dragging = true;
                    node.xdrag = node.x;
                    node.ydrag = node.y;

                    if (node.id === 6) // polygonal translating
                    {
                        (node as any).pxi = Array.from((node as any).px);
                        (node as any).pyi = Array.from((node as any).py);
                    }
                }
            } else if (node.handles) {
                for (const handle of node.handles) {
                    if (handle.hover) {
                        handle.dragging = true;
                        anySelected = true;
                        handle.xdrag = handle.x;
                        handle.ydrag = handle.y;
                    }
                }
                if (node.handles) {
                    for (let i = 0; i < node.handles.length; ++i) {
                        if (node.handles[i].dragging) {
                            if (!state.current.deleteMode) {
                                updateHandle(state.current, node, node.handles[i]);
                                node.handles = getHandles(state.current, node);
                            } else {
                                deleteHandle(state.current, node, node.handles[i]);
                                node.handles = getHandles(state.current, node);
                            }
                            updateLinkPosition(node);
                        }
                    }
                }
            }
        }

        for (const link of state.current.simLinks) {
            link.hover = false;
            if (state.current.worldToPx) {
                const p1 = state.current.worldToPx(link.x1, link.y1);
                const p2 = state.current.worldToPx(link.x2, link.y2);
                if (p1 && p2) {
                    const dist2 = distanceToSegmentSquared(state.current.mx, state.current.my, p1.x, p1.y, p2.x, p2.y);
                    if (dist2 <= 144) {
                        link.hover = true;
                    }

                    link.selected = false;
                    if (link.hover) {
                        link.selected = true;
                        anySelected = true;
                        link.dragging = true;
                        const closest = closestDeltaOnSegment(state.current.mx, state.current.my, p1.x, p1.y, p2.x, p2.y);
                        link.xdrag = link.x1 * (1 - closest) + link.x2 * closest;
                        link.ydrag = link.y1 * (1 - closest) + link.y2 * closest;
                        if (closest < 0.5) {
                            link.dragTarget = "parent";
                            link.edgeOffset = closest * link.length;
                        } else {
                            link.dragTarget = "child";
                            link.edgeOffset = (1 - closest) * link.length;
                        }
                    }
                }
            }
        }

        if (anySelected && !hadSelection.current) {
            hadSelection.current = true;
        } else if (!anySelected && hadSelection.current) {
            hadSelection.current = false;
            if (typeof (onNodeSelectionClear) === 'function') {
                onNodeSelectionClear();
            }
        }

        // Workaround for custom node selection updates
        if (anySelected) {
            if (typeof (onNodeSelect) === 'function') {
                onNodeSelect();
            }
        }

        requestAnimationFrame(render);
    }, [state, render, onNodeSelectionClear, onNodeSelect]);

    const pointerUp = React.useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        state.current.drag = false;

        const dx = Math.abs(state.current.mx - state.current.startMx);
        const dy = Math.abs(state.current.my - state.current.startMy);
        if (dx <= 5 && dy <= 5) {
            if (state.current.dropId === -1 && state.current.addOnClickId !== -1 && state.current.useMp) {
                let anyOver = false;
                let overNode: GameWidgetNode | null = null;
                for (const node of state.current.nodes) {
                    if (node.hover && node.selected) {
                        anyOver = true;
                        overNode = node;
                        break;
                    }
                }

                if (!anyOver) {
                    for (const link of state.current.simLinks) {
                        if (link.hover && link.selected) {
                            anyOver = true;
                            break;
                        }
                    }
                }
                if (!anyOver) {
                    const world = state.current.pxToWorld ? state.current.pxToWorld(state.current.mx, state.current.my) : null;
                    if (world) {
                        if (typeof (state.current.addOnClickId) === 'number') {
                            state.current.nodes.push(mapDefaultNode(new GameWidgetNode(
                                state.current.addOnClickId,
                                world.x,
                                world.y
                            )));
                        } else if (state.current.addOnClickId === 'link') {
                            const link = new GameWidgetLink(
                                world.x - 1,
                                world.y,
                                world.x + 1,
                                world.y,
                                null,
                                null
                            );
                            updateLink(link);
                            state.current.simLinks.push(link);
                        }
                        requestAnimationFrame(render);
                    }
                } else if (overNode != null) {
                    if (state.current.addOnClickLink == null) {
                        const world = state.current.pxToWorld ? state.current.pxToWorld(state.current.mx, state.current.my) : null;
                        if (world) {
                            if (state.current.addOnClickId === 'link') {
                                const linkP = new GameWidgetLink(
                                    overNode.x,
                                    overNode.y,
                                    world.x,
                                    world.y,
                                    overNode,
                                    null
                                );
                                overNode.children.push(linkP);
                                state.current.addOnClickLink = linkP;
                            }
                            requestAnimationFrame(render);
                        }
                    } else if (state.current.addOnClickId === 'link') {
                        state.current.addOnClickLink.child = overNode;
                        state.current.addOnClickLink.x2 = overNode.x;
                        state.current.addOnClickLink.y2 = overNode.y;
                        if (overNode.parent != null) {
                            if (onOpError)
                                onOpError("Operation resulted in an invalid link tree! This will result in disconnected links.");
                        }
                        overNode.parent = state.current.addOnClickLink;
                        state.current.simLinks.push(state.current.addOnClickLink);
                        updateLink(state.current.addOnClickLink);
                        state.current.addOnClickLink = null;
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

        for (const link of state.current.simLinks) {
            if (link.dragging) {
                link.dragging = false;
            }
        }

        // update simlinks
        if (state.current.worldToPx) {
            for (const link of state.current.simLinks) {
                let lp = state.current.worldToPx(link.x1, link.y1);
                let lc = state.current.worldToPx(link.x2, link.y2);
                if (lp && lc) {
                    if (link.parent != null) {
                        const np = state.current.worldToPx(link.parent.x, link.parent.y);
                        if (np) {
                            const ndx = lp.x - np.x;
                            const ndy = lp.y - np.y;
                            if (ndx * ndx + ndy * ndy > 400) {
                                const ind = link.parent.children.indexOf(link);
                                if (ind === -1)
                                    console.warn("Unexpected: missing child in link parent");
                                else
                                    link.parent.children.splice(ind, 1);
                                link.parent = null;
                            }
                        }
                    }

                    if (link.child != null) {
                        const np = state.current.worldToPx(link.child.x, link.child.y);
                        if (np) {
                            const ndx = lp.x - np.x;
                            const ndy = lp.y - np.y;
                            if (ndx * ndx + ndy * ndy > 400) {
                                link.child.parent = null;
                                link.child = null;
                            }
                        }
                    }

                    for (const node of state.current.nodes) {
                        const np = state.current.worldToPx(node.x, node.y);
                        if (np) {
                            const npdx = lp.x - np.x;
                            const npdy = lp.y - np.y;
                            const ncdx = lc.x - np.x;
                            const ncdy = lc.y - np.y;
                            if (npdx * npdx + npdy * npdy <= 400) {
                                link.parent = node;
                                if (!node.children.includes(link))
                                    node.children.push(link);
                            }
                            if (ncdx * ncdx + ncdy * ncdy <= 400) {
                                if (node.parent != null && node.parent !== link) {
                                    // assume user is trying to parent link instead of child:
                                    // flip parent and child edges of link, keeping the same visual appearance
                                    console.info("Attempted to attach child node that already has a parent! Flipping link to preserve visual appearance over structure.");
                                    if (link.parent != null) {
                                        const ind = link.parent.children.indexOf(link);
                                        if (ind === -1)
                                            console.warn("Unexpected: missing child in link parent");
                                        else
                                            link.parent.children.splice(ind, 1);
                                        if (link.parent.parent != null) {
                                            console.warn("[FLIP_TO_PARENTED_NODE] Invalid link tree! This will result in disconnected links.");
                                            if (onOpError)
                                                onOpError("Operation resulted in an invalid link tree! This will result in disconnected links.");
                                        }
                                        link.parent.parent = link;
                                    }
                                    link.child = link.parent;
                                    link.parent = node;
                                    if (!node.children.includes(link))
                                        node.children.push(link);

                                    let tmp = link.x1;
                                    link.x1 = link.x2;
                                    link.x2 = tmp;
                                    tmp = link.y1;
                                    link.y1 = link.y2;
                                    link.y2 = tmp;
                                    const tmp2: { x: number, y: number } = lp;
                                    lp = lc;
                                    lc = tmp2;
                                } else {
                                    link.child = node;
                                    node.parent = link;
                                }
                            }
                        }
                    }
                }
            }
        }

        for (const node of state.current.nodes) {
            updateLinkPosition(node);
        }
    }, [state, render, onOpError]);

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

                        calculateClosestNode(state.current, node);
                        updateNodePosition(state.current, node);
                        updateLinkPosition(node);
                        solveKinematics(state.current, node);
                        for (const link of node.children)
                            updateLink(link);
                        if (node.parent)
                            updateLink(node.parent);

                        if (node.id === 6) // polygonal translating
                        {
                            for (let k = 0; k < (node as GameWidgetPolygonalTranslatingNode).px.length; k++) {
                                (node as GameWidgetPolygonalTranslatingNode).px[k] = (node as any).pxi[k] + wdx * Math.max(1, aspectScreen);
                                (node as GameWidgetPolygonalTranslatingNode).py[k] = (node as any).pyi[k] + wdy / Math.min(1, aspectScreen);
                            }
                        }

                        node.handles = getHandles(state.current, node);
                    } else if (node.handles) {
                        for (let i = 0; i < node.handles.length; ++i) {
                            if (node.handles[i].dragging && typeof (node.handles[i].xdrag) === 'number' && typeof (node.handles[i].ydrag) === 'number') {
                                fallthrough = false;
                                node.handles[i].x = (node.handles[i].xdrag || 0) + dx;
                                node.handles[i].y = (node.handles[i].ydrag || 0) + dy;
                                updateHandle(state.current, node, node.handles[i]);
                                node.handles = getHandles(state.current, node);
                                updateLinkPosition(node);
                                solveKinematics(state.current, node);
                                for (const link of node.children)
                                    updateLink(link);
                                if (node.parent)
                                    updateLink(node.parent);
                            }
                        }
                    }
                }

                if (fallthrough) {
                    for (const link of state.current.simLinks) {
                        if (link.dragging && typeof (link.xdrag) === 'number' && typeof (link.ydrag) === 'number' && typeof (link.edgeOffset) === 'number') {
                            fallthrough = false;
                            const nx = link.xdrag + wdx * Math.max(1, aspectScreen);
                            const ny = link.ydrag + wdy / Math.min(1, aspectScreen);
                            if (link.dragTarget === 'parent') {
                                const ldx = nx - link.x2;
                                const ldy = ny - link.y2;
                                const length = Math.sqrt(ldx * ldx + ldy * ldy);
                                const delta = -link.edgeOffset / length;
                                link.x1 = nx * (1 - delta) + link.x2 * delta;
                                link.y1 = ny * (1 - delta) + link.y2 * delta;

                                // check nodes to snap to
                                if (state.current.worldToPx) {
                                    const lp = state.current.worldToPx(link.x1, link.y1);
                                    if (lp) {
                                        for (const node of state.current.nodes) {
                                            const np = state.current.worldToPx(node.x, node.y);
                                            if (np) {
                                                const ndx = lp.x - np.x;
                                                const ndy = lp.y - np.y;
                                                if (ndx * ndx + ndy * ndy <= 400) {
                                                    link.x1 = node.x;
                                                    link.y1 = node.y;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            } else if (link.dragTarget === 'child') {
                                const ldx = nx - link.x1;
                                const ldy = ny - link.y1;
                                const length = Math.sqrt(ldx * ldx + ldy * ldy);
                                const delta = link.edgeOffset / length + 1;
                                link.x2 = link.x1 * (1 - delta) + nx * delta;
                                link.y2 = link.y1 * (1 - delta) + ny * delta;

                                // check nodes to snap to
                                if (state.current.worldToPx) {
                                    const lp = state.current.worldToPx(link.x2, link.y2);
                                    if (lp) {
                                        for (const node of state.current.nodes) {
                                            const np = state.current.worldToPx(node.x, node.y);
                                            if (np) {
                                                const ndx = lp.x - np.x;
                                                const ndy = lp.y - np.y;
                                                if (ndx * ndx + ndy * ndy <= 400) {
                                                    link.x2 = node.x;
                                                    link.y2 = node.y;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            updateLink(link);
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
            if (state.current.addOnClickLink != null) {
                const world = state.current.pxToWorld ? state.current.pxToWorld(state.current.mx, state.current.my) : null;
                if (world) {
                    state.current.addOnClickLink.x2 = world.x;
                    state.current.addOnClickLink.y2 = world.y;
                }
            }
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
            for (const link of state.current.simLinks) {
                const old = link.hover;
                const oldTarget = link.dragTarget;
                link.hover = false;
                const p1 = state.current.worldToPx(link.x1, link.y1);
                const p2 = state.current.worldToPx(link.x2, link.y2);
                if (p1 && p2) {
                    const dist2 = distanceToSegmentSquared(state.current.mx, state.current.my, p1.x, p1.y, p2.x, p2.y);
                    if (dist2 <= 144) {
                        link.hover = true;
                        const closest = closestDeltaOnSegment(state.current.mx, state.current.my, p1.x, p1.y, p2.x, p2.y);
                        if (closest < 0.5) {
                            link.dragTarget = "parent";
                        } else {
                            link.dragTarget = "child";
                        }
                    }
                }
                if (old != link.hover || oldTarget != link.dragTarget)
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