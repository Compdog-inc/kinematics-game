import { AppProps } from "next/app";
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';

function App({ Component, pageProps }: AppProps) {
    return (
        <div suppressHydrationWarning>
            <CssVarsProvider>
                <CssBaseline />
                <Component {...pageProps} />
            </CssVarsProvider>
        </div>
    )
}

export default App;