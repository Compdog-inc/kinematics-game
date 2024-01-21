import Head from "next/head";
import Box from '@mui/joy/Box';
import Container from "@mui/joy/Container";
import Grid from "@mui/joy/Grid";
import Typography from "@mui/joy/Typography";
import Button from "@mui/joy/Button";
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import { useColorScheme } from "@mui/joy/styles";
import React from "react";
import Stack from "@mui/joy/Stack";
import Image from "next/image";
import placeholderImg from "../images/placeholder_600x1200.webp";
import AspectRatio from "@mui/joy/AspectRatio";

export default function Index() {
    const { mode } = useColorScheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <>
            <Head>
                <title>Pixel Perfect Kinematics</title>
            </Head>
            <Box sx={{ overflow: 'hidden' }}>
                <Container maxWidth="xl" sx={{
                    paddingTop: {
                        xs: '64px',
                        sm: 0
                    },
                    minHeight: '500px',
                    transition: '0.3s'
                }}>
                    <Grid container wrap="nowrap" sx={{
                        width: '100%',
                        alignItems: 'center',
                        height: '100%'
                    }}>
                        <Grid md={7} lg={6} sx={{
                            margin: 'auto',
                            zIndex: 1
                        }}>
                            <Box sx={{
                                textAlign: {
                                    xs: 'center',
                                    md: 'left'
                                }
                            }}>
                                <Typography level="h1" sx={{
                                    marginLeft: 0,
                                    marginTop: 0,
                                    marginRight: 0,
                                    marginBottom: '16px',
                                    fontSize: 'clamp(2.5rem, 1.125rem + 3.5vw, 3.5em)',
                                    lineHeight: 1.1142857142857143,
                                    scrollSnapMarginTop: '92px',
                                    scrollMarginTop: '92px',
                                    letterSpacing: -0.2,
                                    maxWidth: '500px'
                                }}>
                                    <Typography component="span" sx={{
                                        backgroundImage: theme => `linear-gradient(90deg, ${theme.palette.primary[400]} 5%, ${theme.palette.primary[500]} 90%)`,
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent"
                                    }}>Learn more</Typography>
                                    <br />
                                    about kinematics
                                </Typography>
                                <Typography level="body-md" sx={{
                                    marginBottom: '24px',
                                    maxWidth: '500px'
                                }}>
                                    Pixel Perfect Kinematics offers an interactive and fun way to learn about kinematics through solving puzzles.
                                    Start with an introductory lesson, complete our engaging levels, or play around with the sandbox.
                                </Typography>
                                <Box sx={{
                                    display: 'flex',
                                    flexWrap: {
                                        xs: 'wrap',
                                        md: 'nowrap'
                                    }
                                }}>
                                    {mounted ?
                                        <Button component="a" href="/welcome/" target="_self" rel="noopener" size="lg" variant="solid" tabIndex={0}
                                            sx={{
                                                marginRight: {
                                                    xs: 0,
                                                    md: '12px'
                                                },
                                                marginBottom: {
                                                    xs: '16px',
                                                    md: 0
                                                },
                                                minWidth: {
                                                    xs: '100%',
                                                    md: 0
                                                },
                                                padding: '12px 12px 12px 14px',
                                                borderRadius: '12px',
                                                backgroundImage: _ => mode === 'dark' ?
                                                    `linear-gradient(180deg, rgba(51, 153, 255, 0.2) 0%, #0059b2 100%)` :
                                                    `linear-gradient(180deg, rgba(102, 178, 255, 0.5) 0%, rgba(0, 114, 229, 0.5) 100%)`,
                                                boxShadow: _ => mode === 'dark' ?
                                                    `0px 1px 2px rgba(0, 58, 117, 0.1), inset 0px 0px 0px 1px #0072E5, inset 0px 0px 0px 2px rgba(255, 255, 255, 0.1), 0px 2px 1px #0B0D0E` :
                                                    `0px 1px 2px rgba(0, 58, 117, 0.1), inset 0px 0px 0px 1px #0072E5, inset 0px 0px 0px 2px rgba(255, 255, 255, 0.2), 0px 2px 1px rgba(153, 204, 243, 0.3)`,
                                                textShadow: `0px 1px 1px rgba(28, 32, 37, 0.3)`,
                                                '&>span': {
                                                    marginLeft: '4px',
                                                    transition: '0.2s'
                                                },
                                                "&:hover": {
                                                    backgroundColor: theme => theme.palette.primary[600],
                                                    boxShadow: 'none',
                                                    '&>span': {
                                                        transform: 'translateX(2px)'
                                                    }
                                                },
                                                transition: 'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'
                                            }}
                                            endDecorator={<KeyboardArrowRightRounded />}>
                                            Expand your knowledge
                                        </Button> :
                                        <Button component="a" href="/welcome/" target="_self" rel="noopener" size="lg" variant="solid" tabIndex={0}
                                            sx={{
                                                marginRight: {
                                                    xs: 0,
                                                    md: '12px'
                                                },
                                                marginBottom: {
                                                    xs: '16px',
                                                    md: 0
                                                },
                                                minWidth: {
                                                    xs: '100%',
                                                    md: 0
                                                },
                                                padding: '12px 12px 12px 14px',
                                                borderRadius: '12px',
                                                backgroundImage: `linear-gradient(180deg, rgba(102, 178, 255, 0.5) 0%, rgba(0, 114, 229, 0.5) 100%)`,
                                                boxShadow: `0px 1px 2px rgba(0, 58, 117, 0.1), inset 0px 0px 0px 1px #0072E5, inset 0px 0px 0px 2px rgba(255, 255, 255, 0.2), 0px 2px 1px rgba(153, 204, 243, 0.3)`,
                                                textShadow: `0px 1px 1px rgba(28, 32, 37, 0.3)`,
                                                '&>span': {
                                                    marginLeft: '4px',
                                                    transition: '0.2s'
                                                },
                                                "&:hover": {
                                                    backgroundColor: theme => theme.palette.primary[600],
                                                    boxShadow: 'none',
                                                    '&>span': {
                                                        transform: 'translateX(2px)'
                                                    }
                                                },
                                                transition: 'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'
                                            }}
                                            endDecorator={<KeyboardArrowRightRounded />}>
                                            Expand your knowledge
                                        </Button>
                                    }
                                </Box>
                            </Box>
                        </Grid>
                        <Grid md={5} lg={6} sx={{
                            maxHeight: '100%',
                            display: {
                                xs: 'none',
                                md: 'initial'
                            },
                            marginLeft: '16px',
                            perspective: '1000px',
                            position: 'relative'
                        }}>
                            <Box aria-hidden sx={{
                                minHeight: '500px',
                                height: 'calc(100vh - 120px)',
                                transition: 'max-height 0.3s',
                                position: 'relative',
                                minWidth: '1140px',
                                maxHeight: {
                                    md: '800px',
                                    xl: '1100px'
                                },
                                '&::after': {
                                    content: "''",
                                    position: 'absolute',
                                    left: '-220px',
                                    right: '-220px',
                                    bottom: '-5px',
                                    top: '-1px',
                                    background: 'linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 40%),linear-gradient(0deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 40%)',
                                },
                                '&:is(:root[data-joy-color-scheme="dark"] &)::after': {
                                    background: 'linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 40%),linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 40%)'
                                }
                            }}>
                                <Box aria-hidden sx={{
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transform: 'translateX(-40%) rotateZ(-15deg) rotateX(12deg) rotateY(8deg)',
                                    transformOrigin: 'center',
                                    left: '40%',
                                    top: '-50%',
                                    zIndex: -1,
                                    userSelect: 'none',
                                    pointerEvents: 'none',
                                    '&>div': {
                                        width: '360px',
                                        display: 'inline-flex',
                                        verticalAlign: 'top'
                                    }
                                }}>
                                    <Stack direction="column" gap={10} sx={{
                                        transform: 'translateY(-180px)'
                                    }}>
                                        <AspectRatio sx={{ width: 300, borderRadius: 'md', boxShadow: 1 }} ratio="1/2" variant="outlined">
                                            <Image alt="" aria-hidden src={placeholderImg} placeholder="blur" />
                                        </AspectRatio>
                                        <AspectRatio sx={{ width: 300, borderRadius: 'md', boxShadow: 1 }} ratio="1/2" variant="outlined">
                                            <Image alt="" aria-hidden src={placeholderImg} placeholder="blur" />
                                        </AspectRatio>
                                        <AspectRatio sx={{ width: 300, borderRadius: 'md', boxShadow: 1 }} ratio="1/2" variant="outlined">
                                            <Image alt="" aria-hidden src={placeholderImg} placeholder="blur" />
                                        </AspectRatio>
                                    </Stack>
                                    <Stack direction="column" marginLeft="24px" gap={10}>
                                        <AspectRatio sx={{ width: 300, borderRadius: 'md', boxShadow: 1 }} ratio="1/2" variant="outlined">
                                            <Image alt="" aria-hidden src={placeholderImg} placeholder="blur" />
                                        </AspectRatio>
                                        <AspectRatio sx={{ width: 300, borderRadius: 'md', boxShadow: 1 }} ratio="1/2" variant="outlined">
                                            <Image alt="" aria-hidden src={placeholderImg} placeholder="blur" />
                                        </AspectRatio>
                                        <AspectRatio sx={{ width: 300, borderRadius: 'md', boxShadow: 1 }} ratio="1/2" variant="outlined">
                                            <Image alt="" aria-hidden src={placeholderImg} placeholder="blur" />
                                        </AspectRatio>
                                    </Stack>
                                    <Stack direction="column" marginLeft="24px" gap={10} sx={{
                                        transform: 'translateY(180px)'
                                    }}>
                                        <AspectRatio sx={{ width: 300, borderRadius: 'md', boxShadow: 1 }} ratio="1/2" variant="outlined">
                                            <Image alt="" aria-hidden src={placeholderImg} placeholder="blur" />
                                        </AspectRatio>
                                        <AspectRatio sx={{ width: 300, borderRadius: 'md', boxShadow: 1 }} ratio="1/2" variant="outlined">
                                            <Image alt="" aria-hidden src={placeholderImg} placeholder="blur" />
                                        </AspectRatio>
                                        <AspectRatio sx={{ width: 300, borderRadius: 'md', boxShadow: 1 }} ratio="1/2" variant="outlined">
                                            <Image alt="" aria-hidden src={placeholderImg} placeholder="blur" />
                                        </AspectRatio>
                                    </Stack>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
            <Box sx={{
                width: '100%',
                backgroundColor: "#f7f9ff",
                '&:is(:root[data-joy-color-scheme="dark"] &)': {
                    backgroundColor: "#090909"
                }
            }}>
                <Container maxWidth="lg" sx={{
                    paddingTop: '60px',
                    minHeight: '500px',
                    transition: '0.3s'
                }}>
                    <Typography level="h1">
                        TODO: add more information
                    </Typography>
                </Container>
            </Box>
        </>
    )
}