import Head from "next/head";
import GameWidget, { HTMLGameWidget, mapDefaultNode, getHandles, GameWidgetNode, GameWidgetLink } from "../components/gamewidget";
import Box from "@mui/joy/Box";
import Drawer from "@mui/joy/Drawer";
import IconButton from "@mui/joy/IconButton";
import React from "react";
import KeyboardDoubleArrowLeftRounded from '@mui/icons-material/KeyboardDoubleArrowLeftRounded';
import KeyboardDoubleArrowRightRounded from '@mui/icons-material/KeyboardDoubleArrowRightRounded';
import KeyboardDoubleArrowUpRounded from '@mui/icons-material/KeyboardDoubleArrowUpRounded';
import KeyboardDoubleArrowDownRounded from '@mui/icons-material/KeyboardDoubleArrowDownRounded';
import IosShareRounded from '@mui/icons-material/IosShareRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded';
import WarningIcon from '@mui/icons-material/Warning';
import CloseIcon from '@mui/icons-material/Close';
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
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";
import { fromSimulationUrl, toSimulationUrl } from "../utils/serializer";
import Grid from "@mui/joy/Grid";
import Alert from "@mui/joy/Alert";

export default function Sandbox() {
    const [open, setOpen] = React.useState(true);
    const [currentAdd, setCurrentAdd] = React.useState(-1 as number | string);
    const [shareUrl, setShareUrl] = React.useState("");
    const [copyBtnCopied, setCopyBtnCopied] = React.useState(false);
    const [showShareDialog, setShowShareDialog] = React.useState(false);
    const [forceLightMode, setForceLightMode] = React.useState(false);
    const [nodeSelected, setNodeSelected] = React.useState(false);
    const [polygonNodeSelected, setPolygonNodeSelected] = React.useState(false);
    const [polygonDelete, setPolygonDelete] = React.useState(false);
    const [opError, setOpError] = React.useState("");
    const [showError, setShowError] = React.useState(false);
    const [hadError, setHadError] = React.useState(false);

    const shareUrlInput = React.useRef(null as HTMLInputElement | null);

    const widget = React.useRef(null as HTMLGameWidget | null);
    const widgetCv = React.useRef(null as HTMLCanvasElement | null);
    if (widget.current) {
        widget.current.addOnClickId = currentAdd;
    }

    // add key press listener to widget
    React.useEffect(() => {
        if (widgetCv.current) {
            const listener = (e: KeyboardEvent) => {
                if (e.key === 'Backspace') {
                    if (widget.current) {
                        for (let i = widget.current.nodes.length - 1; i >= 0; i--) {
                            if (widget.current.nodes[i].selected) {
                                widget.current.nodes.splice(i, 1);
                            }
                        }
                        for (let i = widget.current.simLinks.length - 1; i >= 0; i--) {
                            if (widget.current.simLinks[i].selected) {
                                widget.current.simLinks.splice(i, 1);
                            }
                        }
                        if (widget.current.updateSelection)
                            widget.current.updateSelection();
                        if (widget.current.render)
                            requestAnimationFrame(widget.current.render);
                    }
                }
            };
            window.addEventListener('keydown', listener);
            return () => {
                window.removeEventListener('keydown', listener);
            }
        }
    }, []);

    // load query simulation
    React.useEffect(() => {
        const url = new URL(location.href);
        if (url.searchParams.has("b") && widget.current) {
            const encoded = decodeURIComponent(url.searchParams.get("b") || "");
            toSimulationUrl(encoded, widget.current).then(() => {
                if (widget.current && widget.current.render)
                    requestAnimationFrame(widget.current.render);
            });
        }
    }, []);

    const setDropTransfer = React.useCallback(() => {
        if (widget.current) {
            const world = widget.current.pxToWorld ? widget.current.pxToWorld(widget.current.mx, widget.current.my) : null;
            if (world) {
                for (const n of widget.current.nodes) {
                    n.selected = false;
                }
                if (widget.current.dropLink) {
                    const link = new GameWidgetLink(
                        world.x - 1,
                        world.y,
                        world.x + 1,
                        world.y,
                        null,
                        null
                    );
                    link.selected = true;
                    widget.current.simLinks.push(link);
                } else {
                    const ref = new GameWidgetNode(
                        widget.current.dropId,
                        world.x,
                        world.y
                    );
                    ref.selected = true;
                    const node = mapDefaultNode(ref);
                    node.handles = getHandles(widget.current, node);
                    widget.current.nodes.push(node);
                }
                if (widget.current.updateSelection)
                    widget.current.updateSelection();
            }
            widget.current.dropId = -1;
            widget.current.dropLink = false;
            if (widget.current.render)
                requestAnimationFrame(widget.current.render);
        }
    }, []);

    const gameDragOver = React.useCallback((e: globalThis.PointerEvent, id: string) => {
        if (widget.current && widgetCv.current) {
            if (id === "link") {
                widget.current.dropLink = true;
                const bounds = widgetCv.current.getBoundingClientRect();
                widget.current.mx = (e.clientX - bounds.left) * 2;
                widget.current.my = (e.clientY - bounds.top) * 2;
                widget.current.useMp = true;
            } else {
                widget.current.dropLink = false;
            }
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
            widget.current.dropLink = false;
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
                <Grid container wrap="wrap" gap={1} sx={{
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Grid>
                        <SandboxCard id="link"
                            addToggled={currentAdd === "link"} onAddClick={() => setCurrentAdd(currentAdd === "link" ? -1 : "link")} drop={setDropTransfer} dragOver={gameDragOver} dragLeave={gameDragLeave} dragFilter={gameDragFilter}
                            thumbnail={cardPlaceholderImg}
                            name="Link" mode="square" />
                    </Grid>
                    <Grid>
                        <SandboxCard id="label"
                            addToggled={currentAdd === "label"} onAddClick={() => setCurrentAdd(currentAdd === "label" ? -1 : "label")} drop={setDropTransfer} dragOver={gameDragOver} dragLeave={gameDragLeave} dragFilter={gameDragFilter}
                            thumbnail={cardPlaceholderImg}
                            name="Label" mode="square" />
                    </Grid>
                    <Grid>
                        <SandboxCard id="comment"
                            addToggled={currentAdd === "comment"} onAddClick={() => setCurrentAdd(currentAdd === "comment" ? -1 : "comment")} drop={setDropTransfer} dragOver={gameDragOver} dragLeave={gameDragLeave} dragFilter={gameDragFilter}
                            thumbnail={cardPlaceholderImg}
                            name="Comment" mode="square" />
                    </Grid>
                </Grid>
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
                    <div style={{ height: '100%', backgroundColor: forceLightMode ? '#fff' : undefined }}>
                        <GameWidget drag stref={(o) => widget.current = o} ref={widgetCv}
                            onNodeSelect={() => {
                                setNodeSelected(true);
                                if (widget.current && widget.current.testNode(6, true))
                                    setPolygonNodeSelected(true);
                                else
                                    setPolygonNodeSelected(false);
                            }}
                            onNodeSelectionClear={() => {
                                setNodeSelected(false);
                                setPolygonNodeSelected(false);
                            }}
                            onOpError={(err) => {
                                setOpError(err);
                                setShowError(true);
                                setHadError(true);
                            }} />
                    </div>
                    {hadError ? <Alert
                        startDecorator={<WarningIcon />}
                        sx={{
                            position: 'fixed',
                            top: '0',
                            left: '50%',
                            transform: 'translate(-50%,-100%)',
                            zIndex: 3,
                            '@keyframes enter': {
                                from: {
                                    top: '0',
                                    transform: 'translate(-50%,-100%)'
                                },
                                to: {
                                    top: '110px',
                                    transform: 'translate(-50%,0)'
                                }
                            },
                            '@keyframes exit': {
                                to: {
                                    top: '0',
                                    transform: 'translate(-50%,-100%)'
                                },
                                from: {
                                    top: '110px',
                                    transform: 'translate(-50%,0)'
                                }
                            },
                            animation: 'exit .8s linear(0 0%, 0 1.8%, 0.01 3.6%, 0.03 6.35%, 0.07 9.1%, 0.13 11.4%, 0.19 13.4%, 0.27 15%, 0.34 16.1%, 0.54 18.35%, 0.66 20.6%, 0.72 22.4%, 0.77 24.6%, 0.81 27.3%, 0.85 30.4%, 0.88 35.1%, 0.92 40.6%, 0.94 47.2%, 0.96 55%, 0.98 64%, 0.99 74.4%, 1 86.4%, 1 100%) both'
                        }}
                        className={classNames({ [styles.alert]: showError })}
                        variant="soft"
                        color="danger"
                        endDecorator={
                            <React.Fragment>
                                <Button variant="soft" color="danger" sx={{ mr: 1 }} onClick={() => setShowError(false)}>
                                    Undo
                                </Button>
                                <IconButton variant="soft" size="sm" color="danger" onClick={() => setShowError(false)}>
                                    <CloseIcon />
                                </IconButton>
                            </React.Fragment>
                        }
                    >
                        <div>
                            <div>Invalid Operation</div>
                            <Typography level="body-sm" color={"danger"}>
                                {opError}
                            </Typography>
                        </div>
                    </Alert> : null}
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
                    {polygonNodeSelected ?
                        <Tooltip title={
                            <>
                                Toggle polygon delete mode
                            </>
                        } arrow placement="bottom" variant="outlined">
                            <IconButton color="danger" variant={polygonDelete ? "solid" : "plain"} size="md" tabIndex={1} aria-label={polygonDelete ? "Disable polygon delete mode" : "Enable polygon delete mode"} sx={{
                                position: 'fixed',
                                right: '125px',
                                top: '65px',
                            }} onClick={() => {
                                setPolygonDelete(!polygonDelete);
                                if (widget.current) {
                                    widget.current.deleteMode = !polygonDelete;
                                }
                            }}>
                                <RemoveCircleOutlineRoundedIcon />
                            </IconButton>
                        </Tooltip>
                        : null}
                    {nodeSelected ?
                        <Tooltip title={
                            <>
                                Delete selected node
                            </>
                        } arrow placement="bottom" variant="outlined">
                            <IconButton color="danger" variant="plain" size="md" tabIndex={2} aria-label="Delete selected node" sx={{
                                position: 'fixed',
                                right: '85px',
                                top: '65px',
                            }} onClick={() => {
                                if (widget.current) {
                                    for (let i = widget.current.nodes.length - 1; i >= 0; i--) {
                                        if (widget.current.nodes[i].selected) {
                                            widget.current.nodes.splice(i, 1);
                                        }
                                    }
                                    for (let i = widget.current.simLinks.length - 1; i >= 0; i--) {
                                        if (widget.current.simLinks[i].selected) {
                                            widget.current.simLinks.splice(i, 1);
                                        }
                                    }
                                    if (widget.current.updateSelection)
                                        widget.current.updateSelection();
                                    if (widget.current.render)
                                        requestAnimationFrame(widget.current.render);
                                }
                            }}>
                                <DeleteRoundedIcon />
                            </IconButton>
                        </Tooltip>
                        : null}
                    <Tooltip title={
                        <>
                            Toggle forced light mode
                        </>
                    } arrow placement="bottom" variant="outlined">
                        <IconButton variant={forceLightMode ? "solid" : "plain"} size="md" tabIndex={3} aria-label={forceLightMode ? "Disable forced light mode" : "Enable forced light mode"} sx={{
                            position: 'fixed',
                            right: '45px',
                            top: '65px',
                        }} onClick={() => {
                            setForceLightMode(!forceLightMode);
                            if (widget.current) {
                                widget.current.forceLight = !forceLightMode;
                                if (widget.current.render)
                                    requestAnimationFrame(widget.current.render);
                            }
                        }}>
                            <LightModeRoundedIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={
                        <>
                            Share this simulation
                        </>
                    } arrow placement="bottom" variant="outlined">
                        <IconButton variant="plain" size="md" tabIndex={4} aria-label="Share this simulation" sx={{
                            position: 'fixed',
                            right: '5px',
                            top: '65px',
                            zIndex: '2'
                        }} onClick={() => {
                            if (widget.current) {
                                fromSimulationUrl(widget.current).then((b) => {
                                    setShareUrl(location.origin + location.pathname + "?b=" + encodeURIComponent(b));
                                    setShowShareDialog(true);
                                    setCopyBtnCopied(false);
                                });
                            }
                        }}>
                            <IosShareRounded />
                        </IconButton>
                    </Tooltip>
                    <Box sx={{
                        position: 'fixed',
                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0)',
                        touchAction: 'none',
                        zIndex: '1',
                        display: showShareDialog ? 'initial' : 'none'
                    }} onPointerDown={(e) => { e.currentTarget === e.target && setShowShareDialog(false); }}>
                        <Card color="neutral" variant="outlined" sx={{
                            position: 'fixed',
                            right: '10px',
                            top: '106px'
                        }}>
                            <CardContent>
                                <Typography level="title-lg">Share Simulation</Typography>
                                <Typography level="body-xs">Copy and share this link</Typography>
                                <Input value={shareUrl} ref={shareUrlInput} color="neutral" variant="outlined"
                                    endDecorator={
                                        <Button variant="solid" color="primary" onClick={() => {
                                            if (shareUrlInput.current) {
                                                const elem = shareUrlInput.current.querySelector("input");
                                                if (elem) {
                                                    elem.select();
                                                }
                                                if (typeof (navigator) !== 'undefined' && typeof (navigator.clipboard) !== 'undefined' && typeof (navigator.clipboard.writeText) === 'function') {
                                                    navigator.clipboard.writeText(shareUrl);
                                                } else {
                                                    console.warn("Forced to use deprecated document.execCommand");
                                                    document.execCommand("copy");
                                                }
                                                setCopyBtnCopied(true);
                                            }
                                        }}>
                                            {copyBtnCopied ? "Copied" : "Copy"}
                                        </Button>
                                    } sx={{ width: 300 }} />
                            </CardContent>
                        </Card>
                    </Box>
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
                </Box >
            </Box >
        </>
    )
}