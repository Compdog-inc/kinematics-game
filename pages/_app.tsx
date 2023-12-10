import { AppProps } from "next/app";
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import { Analytics } from '@vercel/analytics/react';

function App({ Component, pageProps }: AppProps) {
    return (
        <div suppressHydrationWarning>
            <CssVarsProvider>
                <CssBaseline />
                <Component {...pageProps} />
                <Analytics />
            </CssVarsProvider>
        </div>
    )
}

export default App;