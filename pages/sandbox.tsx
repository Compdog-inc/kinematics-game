import Head from "next/head";
import GameWidget, { HTMLGameWidget, mapDefaultNode, getHandles } from "../components/gamewidget";
import Box from "@mui/joy/Box";
import Drawer from "@mui/joy/Drawer";
import IconButton from "@mui/joy/IconButton";
import React from "react";
import KeyboardDoubleArrowLeftRounded from '@mui/icons-material/KeyboardDoubleArrowLeftRounded';
import KeyboardDoubleArrowRightRounded from '@mui/icons-material/KeyboardDoubleArrowRightRounded';
import KeyboardDoubleArrowUpRounded from '@mui/icons-material/KeyboardDoubleArrowUpRounded';
import KeyboardDoubleArrowDownRounded from '@mui/icons-material/KeyboardDoubleArrowDownRounded';
import styles from "../styles/sandbox.module.css";
import classNames from "classnames";
import List from "@mui/joy/List";
import Sheet from "@mui/joy/Sheet";
import cardPlaceholderImg from "../images/placeholder_360x360.webp";
import ListItem from "@mui/joy/ListItem";
import SandboxCard from "../components/sandbox-card";
import HelpOutlineRounded from "@mui/icons-material/HelpOutlineRounded";
import Tooltip from "@mui/joy/Tooltip";
import ListDivider from "@mui/joy/ListDivider";

export default function Sandbox() {
    const [open, setOpen] = React.useState(true);
    const [currentAdd, setCurrentAdd] = React.useState(-1);

    const widget = React.useRef(null as HTMLGameWidget | null);
    const widgetCv = React.useRef(null as HTMLCanvasElement | null);
    if (widget.current) {
        widget.current.addOnClickId = currentAdd;
    }

    const setDropTransfer = React.useCallback(() => {
        if (widget.current) {
            const world = widget.current.pxToWorld ? widget.current.pxToWorld(widget.current.mx, widget.current.my) : null;
            if (world) {
                for (const n of widget.current.nodes) {
                    n.selected = false;
                }
                const node = mapDefaultNode({
                    id: widget.current.dropId,
                    x: world.x,
                    y: world.y,
                    selected: true
                });
                node.handles = getHandles(widget.current, node);
                widget.current.nodes.push(node);
            }
            widget.current.dropId = -1;
            if (widget.current.render)
                requestAnimationFrame(widget.current.render);
        }
    }, []);

    const gameDragOver = React.useCallback((e: globalThis.PointerEvent, id: string) => {
        if (widget.current && widgetCv.current) {
            if (!isNaN(parseInt(id)) && !isNaN(Number(id))) {
                widget.current.dropId = Number(id);
                const bounds = widgetCv.current.getBoundingClientRect();
                widget.current.mx = (e.clientX - bounds.left) * 2;
                widget.current.my = (e.clientY - bounds.top) * 2;
                widget.current.useMp = true;
            } else {
                widget.current.dropId = -1;
            }

            if (widget.current.render)
                requestAnimationFrame(widget.current.render);
        }
    }, []);

    const gameDragLeave = React.useCallback(() => {
        if (widget.current) {
            widget.current.dropId = -1;
            widget.current.useMp = false;
            if (widget.current.render)
                requestAnimationFrame(widget.current.render);
        }
    }, []);

    const gameDragFilter = React.useCallback((target: HTMLElement) => {
        return widgetCv.current == target;
    }, []);

    const drawerContent = (<Box sx={{ height: '100%', overflowY: 'auto' }}>
        <List role="list" size="lg" sx={{ mt: '-14px' }}>
            <ListItem>
                <SandboxCard id="0"
                    addToggled={currentAdd === 0} onAddClick={() => setCurrentAdd(currentAdd === 0 ? -1 : 0)} drop={setDropTransfer} dragOver={gameDragOver} dragLeave={gameDragLeave} dragFilter={gameDragFilter}
                    thumbnail={cardPlaceholderImg}
                    name="Fixed Node"
                    description="A simple kinematics node with a fixed position. Used as the initial node in a model." />
            </ListItem>
            <ListItem>
                <SandboxCard id="1"
                    addToggled={currentAdd === 1} onAddClick={() => setCurrentAdd(currentAdd === 1 ? -1 : 1)} drop={setDropTransfer} dragOver={gameDragOver} dragLeave={gameDragLeave} dragFilter={gameDragFilter}
                    thumbnail={cardPlaceholderImg}
                    name="Rotating Node"
                    description="A node that allows for the unconstrained rotation of the connected link." />
            </ListItem>
            <ListItem>
                <SandboxCard id="2"
                    addToggled={currentAdd === 2} onAddClick={() => setCurrentAdd(currentAdd === 2 ? -1 : 2)} drop={setDropTransfer} dragOver={gameDragOver} dragLeave={gameDragLeave} dragFilter={gameDragFilter}
                    thumbnail={cardPlaceholderImg}
                    name="Translating Node"
                    description="This node moves along an infinite linear track. Constrained, for eternity, to a life of 1d." />
            </ListItem>
            <ListDivider />
            <ListItem>
                <SandboxCard id="3"
                    addToggled={currentAdd === 3} onAddClick={() => setCurrentAdd(currentAdd === 3 ? -1 : 3)} drop={setDropTransfer} dragOver={gameDragOver} dragLeave={gameDragLeave} dragFilter={gameDragFilter}
                    thumbnail={cardPlaceholderImg}
                    name="Clamped Node"
                    description="A rotating node with its angle clamped between two values, adjustable with drag handles." />
            </ListItem>
            <ListItem>
                <SandboxCard id="4"
                    addToggled={currentAdd === 4} onAddClick={() => setCurrentAdd(currentAdd === 4 ? -1 : 4)} drop={setDropTransfer} dragOver={gameDragOver} dragLeave={gameDragLeave} dragFilter={gameDragFilter}
                    thumbnail={cardPlaceholderImg}
                    name="Clamped Translating Node"
                    description="A translating node that moves along a linear track with a start and end point." />
            </ListItem>
            <ListItem>
                <SandboxCard id="5"
                    addToggled={currentAdd === 5} onAddClick={() => setCurrentAdd(currentAdd === 5 ? -1 : 5)} drop={setDropTransfer} dragOver={gameDragOver} dragLeave={gameDragLeave} dragFilter={gameDragFilter}
                    thumbnail={cardPlaceholderImg}
                    name="Arc Translating Node"
                    description="A translating node that moves along a circular track with clamping angles." />
            </ListItem>
            <ListItem>
                <SandboxCard id="6"
                    addToggled={currentAdd === 6} onAddClick={() => setCurrentAdd(currentAdd === 6 ? -1 : 6)} drop={setDropTransfer} dragOver={gameDragOver} dragLeave={gameDragLeave} dragFilter={gameDragFilter}
                    thumbnail={cardPlaceholderImg}
                    name="Polygonal Translating Node"
                    description="A translating node that moves along a series of connected linear tracks." />
            </ListItem>
        </List>
    </Box>);

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
                    <GameWidget drag stref={(o) => widget.current = o} ref={widgetCv} />
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
                    <IconButton variant="plain" size="md" tabIndex={0} aria-label="Open drawer" onClick={() => setOpen(!open)} sx={{
                        position: 'fixed',
                        right: '8px',
                        bottom: '8px',
                        display: {
                            md: 'none'
                        }
                    }} className={classNames(styles.openBtn, { [styles.show]: !open })}>
                        <KeyboardDoubleArrowUpRounded />
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
                                mt: '60px',
                                height: 'calc(100% - 60px)',
                                overflow: 'hidden'
                            }
                        }
                    }}>
                        <Sheet sx={{ height: '46px', flex: '0 0 auto' }}>
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
                        {drawerContent}
                    </Drawer>
                    <Drawer open={open} onClose={() => setOpen(false)} anchor="bottom" size="md" hideBackdrop slotProps={{
                        root: {
                            sx: {
                                position: 'unset',
                                display: {
                                    md: 'none'
                                }
                            }
                        },
                        content: {
                            sx: {
                                mt: '5px',
                                overflow: 'hidden'
                            }
                        }
                    }}>
                        <Sheet sx={{ height: '46px', flex: '0 0 auto' }}>
                            <Tooltip title={
                                <>
                                    Drag and drop nodes to add them to the sandbox, <br />
                                    or click the &#39;+&#39; icon to toggle add-on-click functionallity.
                                </>
                            } arrow placement="right" variant="outlined" enterTouchDelay={0}>
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
                                <KeyboardDoubleArrowDownRounded />
                            </IconButton>
                        </Sheet>
                        {drawerContent}
                    </Drawer>
                </Box>
            </Box>
        </>
    )
}