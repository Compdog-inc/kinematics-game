import { AppProps } from "next/app";
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import { Analytics } from '@vercel/analytics/react';
import Head from "next/head";
import Navbar from "../components/navbar";
import Link from "@mui/joy/Link";

function App({ Component, pageProps }: AppProps) {
    return (
        <div suppressHydrationWarning>
            <CssVarsProvider defaultMode="system">
                <CssBaseline />
                <Head>
                    <meta name="viewport" content="initial-scale=1, width=device-width" />
                    <link rel="icon" type="image/png" sizes="64x64" href="/favicon.png" />
                    <link rel="apple-touch-icon" sizes="180x180" href="/appleicon.png" />
                </Head>
                <Link href="#main-content" underline="none" level="inherit" sx={{
                    fontWeight: '700',
                    display: 'inline-flex',
                    alignItems: 'center',
                    color: theme => theme.palette.primary[600],
                    position: 'fixed',
                    padding: '8px 16px',
                    backgroundColor: theme => theme.palette.primary[50],
                    border: '1px solid',
                    borderColor: theme => theme.palette.primary[100],
                    outlineOffset: '5px',
                    outlineColor: theme => theme.palette.primary[300],
                    borderRadius: '12px',
                    left: '16px',
                    zIndex: 1501,
                    top: '-80px',
                    transition: 'top 195ms cubic-bezier(0.4, 0, 1, 1) 0ms',
                    '&:is(:root[data-joy-color-scheme="dark"] &)': {
                        backgroundColor: theme => theme.palette.neutral[700],
                        borderColor: theme => theme.palette.neutral[500],
                        color: theme => theme.palette.neutral[100],
                        outlineColor: theme => theme.palette.neutral[100]
                    },
                    '&:hover': {
                        backgroundColor: theme => theme.palette.primary[100],
                        color: theme => theme.palette.primary[700]
                    },
                    '&:focus': {
                        top: '16px',
                        transition: 'top 225ms cubic-bezier(0.0, 0, 0.2, 1) 0ms'
                    },
                    '&:is(:root[data-joy-color-scheme="dark"] &):hover': {
                        backgroundColor: theme => theme.palette.neutral[600],
                        color: theme => theme.palette.neutral[50]
                    }
                }}>
                    Skip to content
                </Link>
                <Navbar />
                <main id="main-content">
                    <Component {...pageProps} />
                </main>
                <Analytics />
            </CssVarsProvider>
        </div >
    )
}

export default App;