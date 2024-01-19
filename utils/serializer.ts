import { GameWidgetArcTranslatingNode, GameWidgetClampedNode, GameWidgetClampedTranslatingNode, GameWidgetLink, GameWidgetNode, GameWidgetPolygonalTranslatingNode, GameWidgetRotatingNode, GameWidgetTranslatingNode, HTMLGameWidget, updateLink } from "../components/gamewidget";
import { Buffer } from "buffer";

export const SERIALIZER_VERSION = 2;

export const getNodeSize = (node: GameWidgetNode): number => {
    const headerSize = 25 + node.children.length * 4; // [id:1][x:8][y:8][parent:4][childCount:4]{[child:4]}
    switch (node.id) {
        case 0: // fixed node
            return headerSize;
        case 1: // rotating node
            return headerSize + 8; // [angle:8]
        case 2: // translating node
            return headerSize + 32; // [angle:8][delta:8][cx:8][cy:8]
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
    const headerLength = 41; // [version:1][bounds.left:8][bounds.top:8][bounds.right:8][bounds.bottom:8][nodes.length:4][simlinks.length:4]

    let bodyLength = 0;
    for (const node of data.nodes) {
        bodyLength += getNodeSize(node);
    }
    bodyLength += data.simLinks.length * 40; // [x1:8][y1:8][x2:8][y2:8][parent:4][child:4]

    const buffer = Buffer.allocUnsafe(headerLength + bodyLength);

    /// ========== BEGIN HEADER (0) ============
    buffer[0] = SERIALIZER_VERSION;
    buffer.writeDoubleLE(data.bounds.left, 1);
    buffer.writeDoubleLE(data.bounds.top, 9);
    buffer.writeDoubleLE(data.bounds.right, 17);
    buffer.writeDoubleLE(data.bounds.bottom, 25);
    buffer.writeUInt32LE(data.nodes.length, 33);
    buffer.writeUInt32LE(data.simLinks.length, 37);
    /// ============= END HEADER ===============

    let offset = headerLength;
    for (const node of data.nodes) {

        /// ========== BEGIN NODE HEADER ============
        buffer[offset++] = node.id;
        offset = buffer.writeDoubleLE(node.x, offset);
        offset = buffer.writeDoubleLE(node.y, offset);
        offset = buffer.writeUint32LE(node.parent === null ? 0 : data.simLinks.indexOf(node.parent) + 1, offset);
        offset = buffer.writeUint32LE(node.children.length, offset);
        for (const child of node.children) {
            offset = buffer.writeUint32LE(data.simLinks.indexOf(child) + 1, offset);
        }
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
                offset = buffer.writeDoubleLE((node as GameWidgetTranslatingNode).cx, offset);
                offset = buffer.writeDoubleLE((node as GameWidgetTranslatingNode).cy, offset);
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

    for (const link of data.simLinks) {
        /// ========== BEGIN LINK HEADER ============
        offset = buffer.writeDoubleLE(link.x1, offset);
        offset = buffer.writeDoubleLE(link.y1, offset);
        offset = buffer.writeDoubleLE(link.x2, offset);
        offset = buffer.writeDoubleLE(link.y2, offset);
        offset = buffer.writeUint32LE(link.parent === null ? 0 : data.nodes.indexOf(link.parent) + 1, offset);
        offset = buffer.writeUint32LE(link.child === null ? 0 : data.nodes.indexOf(link.child) + 1, offset);
        /// =========== END LINK HEADER =============
    }

    return buffer;
};

export const toSimulation = (buffer: Buffer, data: HTMLGameWidget) => {
    /// ========== BEGIN HEADER (0) ============
    const version = buffer[0];
    if (version <= 0 || version > SERIALIZER_VERSION) {
        return;
    }
    data.bounds.left = buffer.readDoubleLE(1);
    data.bounds.top = buffer.readDoubleLE(9);
    data.bounds.right = buffer.readDoubleLE(17);
    data.bounds.bottom = buffer.readDoubleLE(25);
    const nodeCount = buffer.readUint32LE(33);
    const linkCount = version >= 2 ? buffer.readUint32LE(37) : 0;
    /// ============= END HEADER ===============

    let offset = version >= 2 ? 41 : 37;
    let nodes: GameWidgetNode[] = new Array(nodeCount);
    let links: GameWidgetLink[] = new Array(linkCount);
    for (let i = 0; i < nodeCount; ++i) {
        /// ========== BEGIN NODE HEADER ============
        const id = buffer[offset++];
        const x = buffer.readDoubleLE(offset); offset += 8;
        const y = buffer.readDoubleLE(offset); offset += 8;
        let parentInd = 0;
        let childrenInds: number[] = [];
        if (version >= 2) { // Link relationships
            parentInd = buffer.readUint32LE(offset); offset += 4;
            const childCount = buffer.readUint32LE(offset); offset += 4;
            childrenInds = new Array(childCount);
            for (let k = 0; k < childCount; ++k) {
                childrenInds[k] = buffer.readUint32LE(offset); offset += 4;
            }
        }
        /// =========== END NODE HEADER =============

        const node: GameWidgetNode = new GameWidgetNode(id, x, y);

        // Temparary unsafe assignment to cache indices
        (node as any).parent = parentInd;
        (node as any).children = childrenInds;

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
                (node as GameWidgetTranslatingNode).cx = buffer.readDoubleLE(offset); offset += 8;
                (node as GameWidgetTranslatingNode).cy = buffer.readDoubleLE(offset); offset += 8;
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

    for (let i = 0; i < linkCount; ++i) {
        /// ========== BEGIN LINK HEADER ============
        const x1 = buffer.readDoubleLE(offset); offset += 8;
        const y1 = buffer.readDoubleLE(offset); offset += 8;
        const x2 = buffer.readDoubleLE(offset); offset += 8;
        const y2 = buffer.readDoubleLE(offset); offset += 8;
        const parentInd = buffer.readUint32LE(offset); offset += 4;
        const childInd = buffer.readUint32LE(offset); offset += 4;
        /// =========== END LINK HEADER =============
        links[i] = new GameWidgetLink(x1, y1, x2, y2,
            parentInd === 0 ? null : nodes[parentInd - 1],
            childInd === 0 ? null : nodes[childInd - 1]
        );
        updateLink(links[i]);
    }

    for (const node of nodes) {
        const parentInd: number = (node as any).parent;
        if (parentInd === 0)
            node.parent = null;
        else
            node.parent = links[parentInd - 1];
        const childInds: number[] = (node as any).children;
        const children: GameWidgetLink[] = new Array(childInds.length);
        for (let k = 0; k < childInds.length; ++k) {
            children[k] = links[childInds[k] - 1];
        }
        node.children = children;
    }

    data.nodes = nodes;
    data.simLinks = links;
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