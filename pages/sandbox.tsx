import Head from "next/head";
import GameWidget from "../components/gamewidget";
import Box from "@mui/joy/Box";
import Drawer from "@mui/joy/Drawer";
import IconButton from "@mui/joy/IconButton";
import React from "react";
import KeyboardDoubleArrowLeftRounded from '@mui/icons-material/KeyboardDoubleArrowLeftRounded';
import KeyboardDoubleArrowRightRounded from '@mui/icons-material/KeyboardDoubleArrowRightRounded';
import styles from "../styles/sandbox.module.css";
import classNames from "classnames";
import List from "@mui/joy/List";
import Card from "@mui/joy/Card";
import Sheet from "@mui/joy/Sheet";
import CardOverflow from "@mui/joy/CardOverflow";
import AspectRatio from "@mui/joy/AspectRatio";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import cardPlaceholderImg from "../images/placeholder_360x360.webp";
import Image from "next/image";
import ListItem from "@mui/joy/ListItem";

export default function Sandbox() {
    const [open, setOpen] = React.useState(true);

    return (
        <>
            <Head>
                <title>Pixel Perfect Kinematics | Sandbox</title>
            </Head>
            <Box sx={{ overflow: 'hidden' }}>
                <Box sx={{
                    width: '100vw',
                    height: 'calc(100vh - 60px)'
                }}>
                    <GameWidget drag />
                    <IconButton variant="plain" size="md" tabIndex={0} aria-label="Open drawer" onClick={() => setOpen(!open)} sx={{
                        position: 'fixed',
                        left: '5px',
                        top: '65px',
                        display: {
                            xs: 'none',
                            md: 'initial'
                        }
                    }} className={classNames(styles.openBtn, { [styles.show]: !open })}>
                        <KeyboardDoubleArrowRightRounded />
                    </IconButton>
                    <Drawer open={open} onClose={() => setOpen(false)} anchor="left" size="md" hideBackdrop slotProps={{
                        root: {
                            sx: {
                                position: 'unset',
                                display: {
                                    xs: 'none',
                                    md: 'initial'
                                }
                            }
                        },
                        content: {
                            sx: {
                                mt: '60px'
                            }
                        }
                    }}>
                        <Sheet sx={{ height: '46px' }}>
                            <IconButton variant="plain" size="md" tabIndex={0} aria-label="Close drawer" onClick={() => setOpen(!open)} sx={{
                                position: 'fixed',
                                right: '5px',
                                top: '5px'
                            }}>
                                <KeyboardDoubleArrowLeftRounded />
                            </IconButton>
                        </Sheet>
                        <List role="list" size="lg" sx={{ mt: '-14px' }}>
                            <ListItem>
                                <Card orientation="horizontal" variant="outlined" sx={{ width: '100%' }}>
                                    <CardOverflow>
                                        <AspectRatio ratio="1" sx={{ width: 100 }} flex>
                                            <Image alt="" aria-hidden src={cardPlaceholderImg} placeholder="blur" />
                                        </AspectRatio>
                                    </CardOverflow>
                                    <CardContent>
                                        <Typography fontWeight="md">Fixed Node</Typography>
                                        <Typography level="body-xs">A simple kinematics node with a fixed position. Used as the initial node in a model.</Typography>
                                    </CardContent>
                                </Card>
                            </ListItem>
                            <ListItem>
                                <Card orientation="horizontal" variant="outlined" sx={{ width: '100%' }}>
                                    <CardOverflow>
                                        <AspectRatio ratio="1" sx={{ width: 100 }} flex>
                                            <Image alt="" aria-hidden src={cardPlaceholderImg} placeholder="blur" />
                                        </AspectRatio>
                                    </CardOverflow>
                                    <CardContent>
                                        <Typography fontWeight="md">Rotating Node</Typography>
                                        <Typography level="body-xs">A node that allows for the unconstrained rotation of all connected links.</Typography>
                                    </CardContent>
                                </Card>
                            </ListItem>
                            <ListItem>
                                <Card orientation="horizontal" variant="outlined" sx={{ width: '100%' }}>
                                    <CardOverflow>
                                        <AspectRatio ratio="1" sx={{ width: 100 }} flex>
                                            <Image alt="" aria-hidden src={cardPlaceholderImg} placeholder="blur" />
                                        </AspectRatio>
                                    </CardOverflow>
                                    <CardContent>
                                        <Typography fontWeight="md">Translating Node</Typography>
                                        <Typography level="body-xs">This node moves along an infinite linear track. Constrained, for eternity, to a life of 1d.</Typography>
                                    </CardContent>
                                </Card>
                            </ListItem>
                        </List>
                    </Drawer>
                </Box>
            </Box>
        </>
    )
}