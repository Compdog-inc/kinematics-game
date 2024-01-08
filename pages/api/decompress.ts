import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const encoded = req.query.b;
    if (typeof (encoded) !== 'string') {
        res.status(400).end();
    } else {
        let bytes = Buffer.from(encoded.replaceAll('_', '/').replaceAll('-', '+'), "base64");
        const compressionType = bytes[0];
        let buffer = bytes.subarray(1);
        if (compressionType === 0xFF) { // GZip compression
            const ds = new DecompressionStream("gzip");
            const writer = ds.writable.getWriter();
            writer.write(buffer);
            writer.close();
            buffer = Buffer.from(await new Response(ds.readable).arrayBuffer());
        }

        res.write(buffer, (err) => {
            if (err) {
                res.status(500).end();
            } else {
                res.status(200).end();
            }
        });
    }
};