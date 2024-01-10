export const closestDeltaOnSegment = (x: number, y: number, x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1;
    const ddx = x1 - x2;
    const dy = y2 - y1;
    const sdx = dx === 0 ? Number.EPSILON : dx;
    const sdy = dy === 0 ? Number.EPSILON : dy;

    return Math.max(0, Math.min(1,
        (
            (y1 - dy * x1 / sdx - y + ddx * x / sdy)
            /
            (ddx / sdy - dy / sdx) - x1
        )
        /
        sdx
    ));
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