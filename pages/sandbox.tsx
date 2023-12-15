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
import Sheet from "@mui/joy/Sheet";
import cardPlaceholderImg from "../images/placeholder_360x360.webp";
import ListItem from "@mui/joy/ListItem";
import SandboxCard from "../components/sandbox-card";
import HelpOutlineRounded from "@mui/icons-material/HelpOutlineRounded";
import Tooltip from "@mui/joy/Tooltip";

export default function Sandbox() {
    const [open, setOpen] = React.useState(true);
    const [currentAdd, setCurrentAdd] = React.useState(-1);

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
                    <GameWidget drag
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "copy";
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                        }} />
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
                            <Tooltip title={
                                <>
                                    Drag and drop nodes to add them to the sandbox, <br />
                                    or click the &#39;+&#39; icon to toggle add-on-click functionallity.
                                </>
                            } arrow placement="right" variant="outlined">
                                <IconButton variant="plain" sx={{
                                    position: 'fixed',
                                    top: '5px',
                                    left: '5px',
                                    '&:hover': {
                                        backgroundColor: 'transparent'
                                    }
                                }}>
                                    <HelpOutlineRounded />
                                </IconButton>
                            </Tooltip>
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
                                <SandboxCard
                                    addToggled={currentAdd === 0} onAddClick={() => setCurrentAdd(currentAdd === 0 ? -1 : 0)}
                                    thumbnail={cardPlaceholderImg}
                                    name="Fixed Node"
                                    description="A simple kinematics node with a fixed position. Used as the initial node in a model." />
                            </ListItem>
                            <ListItem>
                                <SandboxCard
                                    addToggled={currentAdd === 1} onAddClick={() => setCurrentAdd(currentAdd === 1 ? -1 : 1)}
                                    thumbnail={cardPlaceholderImg}
                                    name="Rotating Node"
                                    description="A node that allows for the unconstrained rotation of all connected links." />
                            </ListItem>
                            <ListItem>
                                <SandboxCard
                                    addToggled={currentAdd === 2} onAddClick={() => setCurrentAdd(currentAdd === 2 ? -1 : 2)}
                                    thumbnail={cardPlaceholderImg}
                                    name="Translating Node"
                                    description="This node moves along an infinite linear track. Constrained, for eternity, to a life of 1d." />
                            </ListItem>
                        </List>
                    </Drawer>
                </Box>
            </Box>
        </>
    )
}