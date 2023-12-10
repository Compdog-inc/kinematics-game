import { Html, Head, Main, NextScript } from "next/document";
import { getInitColorSchemeScript } from '@mui/joy/styles';
import { GA_TRACKING_ID } from "../utils/gtag";

function Document() {
    return (
        <Html data-color-scheme="light">
            <Head>
                <meta name="viewport" content="initial-scale=1, width=device-width" />
                <script
                    async
                    src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
                />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_TRACKING_ID}',{page_path:window.location.pathname,});`
                    }}
                />
            </Head>
            <body>
                {getInitColorSchemeScript()}
                <Main />
                <NextScript />
            </body>
        </Html >
    )
}

export default Document;