import Head from "next/head";
import GameWidget from "../components/gamewidget";
import Box from "@mui/joy/Box";

export default function Sandbox() {
    return (
        <>
            <Head>
                <title>Pixel Perfect Kinematics | Sandbox</title>
            </Head>
            <Box sx={{
                width: '100vw',
                height: 'calc(100vh - 60px)'
            }}>
                <GameWidget />
            </Box>
        </>
    )
}