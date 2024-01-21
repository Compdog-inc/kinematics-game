import AspectRatio from "@mui/joy/AspectRatio";
import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Link from "@mui/joy/Link";
import NextLink from "next/link";
import Typography from "@mui/joy/Typography";
import { styled } from "@mui/joy/styles";
import Head from "next/head";
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';

const OptionCard = styled(Card)(({ theme }) => (
    {
        width: 100,
        '&:hover': { boxShadow: theme.shadow.md }
    }
));

export default function Welcome() {
    return (
        <>
            <Head>
                <title>Pixel Perfect Kinematics | Welcome</title>
            </Head>
            <Box display="flex" alignItems="center" justifyContent="center" overflow="hidden" height="calc(100vh - 60px)">
                <Card variant="outlined" size="lg" sx={{
                    maxWidth: {
                        xs: '100%',
                        md: '500px'
                    },
                    height: {
                        xs: '100%',
                        md: 'unset'
                    },
                    borderRadius: {
                        xs: '0',
                        md: 'lg'
                    }
                }}>
                    <Typography level="h2">
                        Choose a way to learn
                    </Typography>
                    <Typography level="body-md">
                        First time doing kinematics? Try out some lessons and play around in the sandbox. Or test your knowledge with some practice puzzles!
                    </Typography>
                    <Box display="flex" flexDirection="row" alignItems="center" justifyContent="center" gap={3} flexWrap="wrap">
                        <OptionCard variant="outlined" size="md">
                            <AspectRatio ratio="1" variant="plain">
                                <SchoolRoundedIcon />
                            </AspectRatio>
                            <CardContent>
                                <Typography level="body-sm" textAlign="center">
                                    <NextLink href="/learn/" passHref legacyBehavior><Link
                                        overlay
                                        underline="none"
                                        sx={{ color: 'text.tertiary' }}
                                    >
                                        Lessons
                                    </Link></NextLink>
                                </Typography>
                            </CardContent>
                        </OptionCard>
                        <OptionCard variant="outlined" size="md">
                            <AspectRatio ratio="1" variant="plain">
                                <QuizRoundedIcon />
                            </AspectRatio>
                            <CardContent>
                                <Typography level="body-sm" textAlign="center">
                                    <NextLink href="/puzzles/" passHref legacyBehavior><Link
                                        overlay
                                        underline="none"
                                        sx={{ color: 'text.tertiary' }}
                                    >
                                        Puzzles
                                    </Link></NextLink>
                                </Typography>
                            </CardContent>
                        </OptionCard>
                        <OptionCard variant="outlined" size="md">
                            <AspectRatio ratio="1" variant="plain">
                                <ScienceRoundedIcon />
                            </AspectRatio>
                            <CardContent>
                                <Typography level="body-sm" textAlign="center">
                                    <NextLink href="/sandbox/" passHref legacyBehavior><Link
                                        overlay
                                        underline="none"
                                        sx={{ color: 'text.tertiary' }}
                                    >
                                        Sandbox
                                    </Link></NextLink>
                                </Typography>
                            </CardContent>
                        </OptionCard>
                    </Box>
                </Card>
            </Box>
        </>
    )
}