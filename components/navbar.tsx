import Link from "@mui/joy/Link";
import NextLink from "next/link";
import styles from "../styles/navbar.module.css";
import Container from "@mui/joy/Container";
import LogoIcon from "./svg/logo";
import Box from "@mui/joy/Box";
import IconButton from "@mui/joy/IconButton";
import classNames from "classnames";
import React from "react";
import Drawer from "@mui/joy/Drawer";
import Sheet from "@mui/joy/Sheet";
import List from "@mui/joy/List";
import ListItemButton from "@mui/joy/ListItemButton";

export default function Navbar() {
    const [open, setOpen] = React.useState(false);

    const clicked = () => {
        setOpen(false);
    }

    return (
        <header className={styles.header}>
            <Container maxWidth="lg" sx={{
                display: 'flex',
                alignItems: 'center',
                minHeight: '60px'
            }}>
                <NextLink href="/" passHref legacyBehavior><Link level="inherit" underline="none" lineHeight={0} marginRight="16px" aria-label="Go to homepage">
                    <LogoIcon width="32px" height="32px" />
                </Link></NextLink>
                <Box display={{ xs: 'none', md: 'initial' }}>
                    <nav className={styles.nav}>
                        <ul role="menubar">
                            <li>
                                <NextLink href="/tutorial/" passHref legacyBehavior><Link variant="plain" underline="none" color="neutral" aria-label="Go to tutorial" >
                                    Tutorial
                                </Link></NextLink>
                            </li>
                            <li>
                                <NextLink href="/puzzles/" passHref legacyBehavior><Link variant="plain" underline="none" color="neutral" aria-label="Go to puzzles" >
                                    Puzzles
                                </Link></NextLink>
                            </li>
                            <li>
                                <NextLink href="/sandbox/" passHref legacyBehavior><Link variant="plain" underline="none" color="neutral" aria-label="Go to sandbox" >
                                    Sandbox
                                </Link></NextLink>
                            </li>
                            <li>
                                <NextLink href="/about/" passHref legacyBehavior><Link variant="plain" underline="none" color="neutral" aria-label="Go to about us" >
                                    About us
                                </Link></NextLink>
                            </li>
                        </ul>
                    </nav>
                </Box>
                <Box marginLeft="auto" />
                <Box display={{ md: 'none' }} marginLeft="8px">
                    <IconButton variant="outlined" size="md" tabIndex={0} aria-label="Menu" className={classNames(styles.menuBtn, { [styles.open]: open })} onClick={() => setOpen(!open)}>
                        <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
                            <rect x="1" y="5" width="14" height="1.5" rx="1" fill="#007FFF" />
                            <rect x="1" y="9" width="14" height="1.5" rx="1" fill="#007FFF" />
                        </svg>
                    </IconButton>
                    <Drawer open={open} onClose={() => setOpen(false)} size="md" sx={{
                        top: '60px',
                        display: {
                            md: 'none'
                        }
                    }}
                        variant="plain" slotProps={{
                            content: {
                                sx: {
                                    bgcolor: 'transparent',
                                    p: 0,
                                    boxShadow: 'none',
                                    top: '60px',
                                    height: 'unset',
                                    bottom: 0
                                },
                            }
                        }} anchor="top" hideBackdrop>
                        <Sheet
                            sx={{
                                borderRadius: 'md',
                                p: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                                height: '100%',
                                overflow: 'auto',
                            }}
                        >
                            <nav>
                                <List
                                    role="menubar"
                                    size="lg"
                                    sx={{
                                        flex: 'none',
                                        fontSize: 'xl',
                                        '& > a': { justifyContent: 'center' }
                                    }}
                                >
                                    <NextLink href="/" passHref legacyBehavior><ListItemButton
                                        role="menuitem"
                                        component="a"
                                        aria-label="Go to homepage" sx={{ fontWeight: 'lg' }} onClick={clicked}>Home</ListItemButton></NextLink>
                                    <NextLink href="/tutorial/" passHref legacyBehavior><ListItemButton
                                        role="menuitem"
                                        component="a"
                                        aria-label="Go to tutorial" sx={{ fontWeight: 'lg' }} onClick={clicked}>Tutorial</ListItemButton></NextLink>
                                    <NextLink href="/puzzles/" passHref legacyBehavior><ListItemButton
                                        role="menuitem"
                                        component="a"
                                        aria-label="Go to puzzles" sx={{ fontWeight: 'lg' }} onClick={clicked}>Puzzles</ListItemButton></NextLink>
                                    <NextLink href="/sandbox/" passHref legacyBehavior><ListItemButton
                                        role="menuitem"
                                        component="a"
                                        aria-label="Go to sandbox" sx={{ fontWeight: 'lg' }} onClick={clicked}>Sandbox</ListItemButton></NextLink>
                                    <NextLink href="/about/" passHref legacyBehavior><ListItemButton
                                        role="menuitem"
                                        component="a"
                                        aria-label="Go to about us" sx={{ fontWeight: 'lg' }} onClick={clicked}>About us</ListItemButton></NextLink>
                                </List>
                            </nav>
                        </Sheet>
                    </Drawer>
                </Box>
            </Container>
        </header>
    )
}