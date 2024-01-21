import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Head from "next/head";
import Accordion from '@mui/joy/Accordion';
import AccordionDetails from '@mui/joy/AccordionDetails';
import AccordionGroup from '@mui/joy/AccordionGroup';
import AccordionSummary from '@mui/joy/AccordionSummary';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from "@mui/joy/ListItemButton";
import NextLink from "next/link";

export default function Learn() {
    return (
        <>
            <Head>
                <title>Pixel Perfect Kinematics | Lessons</title>
            </Head>
            <Box width="100%" sx={{
                pl: {
                    xs: 0,
                    md: 5,
                    lg: 10
                },
                pr: {
                    xs: 0,
                    md: 5,
                    lg: 10
                },
                pt: 5,
                pb: 5
            }}>
                <Typography level="h3" mb={4} textColor="text.tertiary" textAlign="center">
                    LESSONS
                </Typography>
                <AccordionGroup size="lg" transition={{
                    initial: "0.3s ease-out",
                    expanded: "0.2s ease",
                }}>
                    <Accordion defaultExpanded>
                        <AccordionSummary>Introductory Tutorials</AccordionSummary>
                        <AccordionDetails>
                            <List
                                size="lg"
                                variant="plain"
                                sx={{
                                    borderRadius: 'sm',
                                    pl: 1,
                                    pr: 1
                                }}
                            >
                                <ListItem>
                                    <NextLink href="/lesson/1" passHref legacyBehavior><ListItemButton component="a"><Typography textColor="text.tertiary">1</Typography>How to use the puzzles page</ListItemButton></NextLink>
                                </ListItem>
                                <ListItem>
                                    <NextLink href="/lesson/2" passHref legacyBehavior><ListItemButton component="a"><Typography textColor="text.tertiary">2</Typography>How to use the sandbox - Adding and removing nodes</ListItemButton></NextLink>
                                </ListItem>
                                <ListItem>
                                    <NextLink href="/lesson/3" passHref legacyBehavior><ListItemButton component="a"><Typography textColor="text.tertiary">3</Typography>How to use the sandbox - Linking nodes</ListItemButton></NextLink>
                                </ListItem>
                                <ListItem>
                                    <NextLink href="/lesson/4" passHref legacyBehavior><ListItemButton component="a"><Typography textColor="text.tertiary">4</Typography>How to use the sandbox - Interactive kinematics</ListItemButton></NextLink>
                                </ListItem>
                                <ListItem>
                                    <NextLink href="/lesson/5" passHref legacyBehavior><ListItemButton component="a"><Typography textColor="text.tertiary">5</Typography>How to use the sandbox - Sharing</ListItemButton></NextLink>
                                </ListItem>
                                <ListItem>
                                    <NextLink href="/lesson/6" passHref legacyBehavior><ListItemButton component="a"><Typography textColor="text.tertiary">6</Typography>How to use the sandbox - Labels and Comments</ListItemButton></NextLink>
                                </ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion defaultExpanded>
                        <AccordionSummary>Unit Circle Kinematics</AccordionSummary>
                        <AccordionDetails>
                            <List
                                size="lg"
                                variant="plain"
                                sx={{
                                    borderRadius: 'sm',
                                    pl: 1,
                                    pr: 1
                                }}
                            >
                                <ListItem>
                                    <NextLink href="/lesson/7" passHref legacyBehavior><ListItemButton component="a"><Typography textColor="text.tertiary">7</Typography>Sine and Cosine values on the unit circle</ListItemButton></NextLink>
                                </ListItem>
                                <ListItem>
                                    <NextLink href="/lesson/8" passHref legacyBehavior><ListItemButton component="a"><Typography textColor="text.tertiary">8</Typography>Trigonometry - Right triangle vertex from an angle</ListItemButton></NextLink>
                                </ListItem>
                                <ListItem>
                                    <NextLink href="/lesson/9" passHref legacyBehavior><ListItemButton component="a"><Typography textColor="text.tertiary">9</Typography>Trigonometry - Right triangle vertex from an angle and hypotenuse</ListItemButton></NextLink>
                                </ListItem>
                                <ListItem>
                                    <NextLink href="/lesson/10" passHref legacyBehavior><ListItemButton component="a"><Typography textColor="text.tertiary">10</Typography>Trigonometry - Stacking triangles</ListItemButton></NextLink>
                                </ListItem>
                                <ListItem>
                                    <NextLink href="/lesson/11" passHref legacyBehavior><ListItemButton component="a"><Typography textColor="text.tertiary">11</Typography>Solving kinematics problems using trigonometry</ListItemButton></NextLink>
                                </ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion defaultExpanded>
                        <AccordionSummary>Advanced Kinematics</AccordionSummary>
                        <AccordionDetails>
                            <List
                                size="lg"
                                variant="plain"
                                sx={{
                                    borderRadius: 'sm',
                                    pl: 1,
                                    pr: 1
                                }}
                            >
                                <ListItem>
                                    <NextLink href="/lesson/12" passHref legacyBehavior><ListItemButton component="a"><Typography textColor="text.tertiary">12</Typography>Solving kinematics with arbitrary angles</ListItemButton></NextLink>
                                </ListItem>
                                <ListItem>
                                    <NextLink href="/lesson/13" passHref legacyBehavior><ListItemButton component="a"><Typography textColor="text.tertiary">13</Typography>Advanced nodes - Translating node</ListItemButton></NextLink>
                                </ListItem>
                                <ListItem>
                                    <NextLink href="/lesson/14" passHref legacyBehavior><ListItemButton component="a"><Typography textColor="text.tertiary">14</Typography>Advanced nodes - Arc translating node</ListItemButton></NextLink>
                                </ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion defaultExpanded>
                        <AccordionSummary>Inverse Kinematics</AccordionSummary>
                        <AccordionDetails>
                            <List
                                size="lg"
                                variant="plain"
                                sx={{
                                    borderRadius: 'sm',
                                    pl: 1,
                                    pr: 1
                                }}
                            >
                                <ListItem>
                                    <NextLink href="/lesson/15" passHref legacyBehavior><ListItemButton component="a"><Typography textColor="text.tertiary">15</Typography>Does not exist</ListItemButton></NextLink>
                                </ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>
                </AccordionGroup>
            </Box>
        </>
    )
}