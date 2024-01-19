export const segmentFromPointAngle = (x: number, y: number, angle: number): { x1: number, y1: number, x2: number, y2: number } => {
    return {
        x1: x,
        y1: y,
        x2: Math.cos(angle) + x,
        y2: Math.sin(angle) + y
    };
};

export const closestDeltaOnSegment = (x: number, y: number, x1: number, y1: number, x2: number, y2: number, infinite?: boolean) => {
    const dx = x2 - x1;
    const ddx = x1 - x2;
    const dy = y2 - y1;
    const sdx = dx === 0 ? Number.EPSILON : dx;
    const sdy = dy === 0 ? Number.EPSILON : dy;

    const l = (
        (y1 - dy * x1 / sdx - y + ddx * x / sdy)
        /
        (ddx / sdy - dy / sdx) - x1
    )
        /
        sdx;

    if (infinite)
        return l;
    else
        return Math.max(0, Math.min(1, l));
};

export const distanceToSegmentSquared = (x: number, y: number, x1: number, y1: number, x2: number, y2: number) => {
    const delta = closestDeltaOnSegment(x, y, x1, y1, x2, y2);
    const px = x1 * (1 - delta) + x2 * delta;
    const py = y1 * (1 - delta) + y2 * delta;
    const dx = x - px;
    const dy = y - py;
    return dx * dx + dy * dy;
};

const PI2 = Math.PI * 2;

export const normalizeAngle = (angle: number): number => {
    const mod = angle % PI2;
    if (mod < 0)
        return mod + PI2;
    else
        return mod;
};

export const maximizeAngle = (angle: number, min: number): number => {
    const minBase = Math.floor(min / PI2);
    const norm = normalizeAngle(angle);
    const rebased = minBase + norm;
    if (rebased < min)
        return rebased + PI2;
    else
        return rebased;
};