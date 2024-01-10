import { GameWidgetArcTranslatingNode, GameWidgetClampedNode, GameWidgetClampedTranslatingNode, GameWidgetNode, GameWidgetPolygonalTranslatingNode, GameWidgetRotatingNode, GameWidgetTranslatingNode, HTMLGameWidget } from "../components/gamewidget";
import { Buffer } from "buffer";

export const getNodeSize = (node: GameWidgetNode): number => {
    const headerSize = 17; // [id:1][x:8][y:8]
    switch (node.id) {
        case 0: // fixed node
            return headerSize;
        case 1: // rotating node
            return headerSize + 8; // [angle:8]
        case 2: // translating node
            return headerSize + 16; // [angle:8][delta:8]
        case 3: // clamped node
            return headerSize + 24; // [angle:8][minAngle:8][maxAngle:8]
        case 4: // clamped translating node
            return headerSize + 40; // [x1:8][y1:8][x2:8][y2:8][delta:8]
        case 5: // arc translating node
            return headerSize + 48; // [cx:8][cy:8][r:8][minAngle:8][maxAngle:8][delta:8]
        case 6: // poylgonal translating node
            return headerSize
                + 12
                + 16 * (node as GameWidgetPolygonalTranslatingNode).px.length; // [delta:8][count:4]{[x:8][y:8]}
        default:
            return headerSize;
    }
};

export const fromSimulation = (data: HTMLGameWidget): Buffer => {
    const headerLength = 36; // [bounds.left:8][bounds.top:8][bounds.right:8][bounds.bottom:8][nodes.length:4]

    let bodyLength = 0;
    for (const node of data.nodes) {
        bodyLength += getNodeSize(node);
    }

    const buffer = Buffer.allocUnsafe(headerLength + bodyLength);

    /// ========== BEGIN HEADER (0) ============
    buffer.writeDoubleLE(data.bounds.left, 0);
    buffer.writeDoubleLE(data.bounds.top, 8);
    buffer.writeDoubleLE(data.bounds.right, 16);
    buffer.writeDoubleLE(data.bounds.bottom, 24);
    buffer.writeUInt32LE(data.nodes.length, 32);
    /// ============= END HEADER ===============

    let offset = 36;
    for (const node of data.nodes) {

        /// ========== BEGIN NODE HEADER ============
        buffer[offset++] = node.id;
        offset = buffer.writeDoubleLE(node.x, offset);
        offset = buffer.writeDoubleLE(node.y, offset);
        /// =========== END NODE HEADER =============

        switch (node.id) {
            case 0: // fixed node
                /// ========== BEGIN NODE BODY ============
                /// =========== END NODE BODY =============
                break;
            case 1: // rotating node
                /// ========== BEGIN NODE BODY ============
                offset = buffer.writeDoubleLE((node as GameWidgetRotatingNode).angle, offset);
                /// =========== END NODE BODY =============
                break;
            case 2: // translating node
                /// ========== BEGIN NODE BODY ============
                offset = buffer.writeDoubleLE((node as GameWidgetTranslatingNode).angle, offset);
                offset = buffer.writeDoubleLE((node as GameWidgetTranslatingNode).delta, offset);
                /// =========== END NODE BODY =============
                break;
            case 3: // clamped node
                /// ========== BEGIN NODE BODY ============
                offset = buffer.writeDoubleLE((node as GameWidgetClampedNode).angle, offset);
                offset = buffer.writeDoubleLE((node as GameWidgetClampedNode).minAngle, offset);
                offset = buffer.writeDoubleLE((node as GameWidgetClampedNode).maxAngle, offset);
                /// =========== END NODE BODY =============
                break;
            case 4: // clamped translating node
                /// ========== BEGIN NODE BODY ============
                offset = buffer.writeDoubleLE((node as GameWidgetClampedTranslatingNode).x1, offset);
                offset = buffer.writeDoubleLE((node as GameWidgetClampedTranslatingNode).y1, offset);
                offset = buffer.writeDoubleLE((node as GameWidgetClampedTranslatingNode).x2, offset);
                offset = buffer.writeDoubleLE((node as GameWidgetClampedTranslatingNode).y2, offset);
                offset = buffer.writeDoubleLE((node as GameWidgetClampedTranslatingNode).delta, offset);
                /// =========== END NODE BODY =============
                break;
            case 5: // arc translating node
                /// ========== BEGIN NODE BODY ============
                offset = buffer.writeDoubleLE((node as GameWidgetArcTranslatingNode).cx, offset);
                offset = buffer.writeDoubleLE((node as GameWidgetArcTranslatingNode).cy, offset);
                offset = buffer.writeDoubleLE((node as GameWidgetArcTranslatingNode).r, offset);
                offset = buffer.writeDoubleLE((node as GameWidgetArcTranslatingNode).minAngle, offset);
                offset = buffer.writeDoubleLE((node as GameWidgetArcTranslatingNode).maxAngle, offset);
                offset = buffer.writeDoubleLE((node as GameWidgetArcTranslatingNode).delta, offset);
                /// =========== END NODE BODY =============
                break;
            case 6: // poylgonal translating node
                const tmp = (node as GameWidgetPolygonalTranslatingNode);
                /// ========== BEGIN NODE BODY ============
                offset = buffer.writeDoubleLE(tmp.delta, offset);
                offset = buffer.writeUint32LE(tmp.px.length, offset);
                for (let i = 0; i < tmp.px.length; ++i) {
                    offset = buffer.writeDoubleLE(tmp.px[i], offset);
                    offset = buffer.writeDoubleLE(tmp.py[i], offset);
                }
                /// =========== END NODE BODY =============
                break;
        }
    }

    return buffer;
};

export const toSimulation = (buffer: Buffer, data: HTMLGameWidget) => {
    /// ========== BEGIN HEADER (0) ============
    data.bounds.left = buffer.readDoubleLE(0);
    data.bounds.top = buffer.readDoubleLE(8);
    data.bounds.right = buffer.readDoubleLE(16);
    data.bounds.bottom = buffer.readDoubleLE(24);
    const nodeCount = buffer.readUint32LE(32);
    /// ============= END HEADER ===============

    let offset = 36;
    let nodes: GameWidgetNode[] = new Array(nodeCount);
    for (let i = 0; i < nodeCount; ++i) {
        /// ========== BEGIN NODE HEADER ============
        const id = buffer[offset++];
        const x = buffer.readDoubleLE(offset); offset += 8;
        const y = buffer.readDoubleLE(offset); offset += 8;
        /// =========== END NODE HEADER =============

        const node: GameWidgetNode = new GameWidgetNode(id, x, y);
        switch (id) {
            case 0: // fixed node
                /// ========== BEGIN NODE BODY ============
                /// =========== END NODE BODY =============
                break;
            case 1: // rotating node
                /// ========== BEGIN NODE BODY ============
                (node as GameWidgetRotatingNode).angle = buffer.readDoubleLE(offset); offset += 8;
                /// =========== END NODE BODY =============
                break;
            case 2: // translating node
                /// ========== BEGIN NODE BODY ============
                (node as GameWidgetTranslatingNode).angle = buffer.readDoubleLE(offset); offset += 8;
                (node as GameWidgetTranslatingNode).delta = buffer.readDoubleLE(offset); offset += 8;
                /// =========== END NODE BODY =============
                break;
            case 3: // clamped node
                /// ========== BEGIN NODE BODY ============
                (node as GameWidgetClampedNode).angle = buffer.readDoubleLE(offset); offset += 8;
                (node as GameWidgetClampedNode).minAngle = buffer.readDoubleLE(offset); offset += 8;
                (node as GameWidgetClampedNode).maxAngle = buffer.readDoubleLE(offset); offset += 8;
                /// =========== END NODE BODY =============
                break;
            case 4: // clamped translating node
                /// ========== BEGIN NODE BODY ============
                (node as GameWidgetClampedTranslatingNode).x1 = buffer.readDoubleLE(offset); offset += 8;
                (node as GameWidgetClampedTranslatingNode).y1 = buffer.readDoubleLE(offset); offset += 8;
                (node as GameWidgetClampedTranslatingNode).x2 = buffer.readDoubleLE(offset); offset += 8;
                (node as GameWidgetClampedTranslatingNode).y2 = buffer.readDoubleLE(offset); offset += 8;
                (node as GameWidgetClampedTranslatingNode).delta = buffer.readDoubleLE(offset); offset += 8;
                /// =========== END NODE BODY =============
                break;
            case 5: // arc translating node
                /// ========== BEGIN NODE BODY ============
                (node as GameWidgetArcTranslatingNode).cx = buffer.readDoubleLE(offset); offset += 8;
                (node as GameWidgetArcTranslatingNode).cy = buffer.readDoubleLE(offset); offset += 8;
                (node as GameWidgetArcTranslatingNode).r = buffer.readDoubleLE(offset); offset += 8;
                (node as GameWidgetArcTranslatingNode).minAngle = buffer.readDoubleLE(offset); offset += 8;
                (node as GameWidgetArcTranslatingNode).maxAngle = buffer.readDoubleLE(offset); offset += 8;
                (node as GameWidgetArcTranslatingNode).delta = buffer.readDoubleLE(offset); offset += 8;
                /// =========== END NODE BODY =============
                break;
            case 6: // poylgonal translating node
                /// ========== BEGIN NODE BODY ============
                (node as GameWidgetPolygonalTranslatingNode).delta = buffer.readDoubleLE(offset); offset += 8;
                const pointCount = buffer.readUint32LE(offset); offset += 4;
                let px: number[] = new Array(pointCount);
                let py: number[] = new Array(pointCount);
                for (let i = 0; i < pointCount; ++i) {
                    px[i] = buffer.readDoubleLE(offset); offset += 8;
                    py[i] = buffer.readDoubleLE(offset); offset += 8;
                }
                (node as GameWidgetPolygonalTranslatingNode).px = px;
                (node as GameWidgetPolygonalTranslatingNode).py = py;
                /// =========== END NODE BODY =============
                break;
        }
        nodes[i] = node;
    }

    data.nodes = nodes;
};

export const fromSimulationUrl = async (data: HTMLGameWidget): Promise<string> => {
    let buffer = fromSimulation(data);
    let isCompressed = false;
    if (buffer.byteLength > 64 && typeof (CompressionStream) !== 'undefined') { // only compress if buffer is big and CompressionStream is supported on client side
        const ds = new CompressionStream("gzip");
        const writer = ds.writable.getWriter();
        writer.write(buffer);
        writer.close();
        buffer = Buffer.from(await new Response(ds.readable).arrayBuffer());
        isCompressed = true;
    }
    const headerBuffer = Buffer.allocUnsafe(1);
    // Compression type 0x00: None, 0xFF: GZip
    headerBuffer[0] = isCompressed ? 0xFF : 0x00;
    const finalBytes = Buffer.concat([headerBuffer, buffer]);
    return finalBytes.toString("base64").replaceAll('+', '-').replaceAll('/', '_');
};

export const toSimulationUrl = async (encoded: string, data: HTMLGameWidget) => {
    let bytes = Buffer.from(encoded.replaceAll('_', '/').replaceAll('-', '+'), "base64");
    const compressionType = bytes[0];
    let buffer = bytes.subarray(1);
    if (compressionType === 0xFF) { // GZip compression
        if (typeof (DecompressionStream) !== 'undefined') {
            const ds = new DecompressionStream("gzip");
            const writer = ds.writable.getWriter();
            writer.write(buffer);
            writer.close();
            buffer = Buffer.from(await new Response(ds.readable).arrayBuffer());
        } else {
            console.error("Client does not support GZip compression! Calling server decompression api.");
            const res = await fetch('/api/decompress?b=' + encoded, {
                method: 'GET'
            });
            if (res.ok) {
                buffer = Buffer.from(await res.arrayBuffer());
            } else {
                return data;
            }
        }
    }
    return toSimulation(buffer, data);
};