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
import CircularProgress from "@mui/joy/CircularProgress";
import { styled } from "@mui/joy/styles";
import { PropsWithChildren, useEffect, useState } from "react";
import { useCountUp } from "use-count-up";
import { getLessonCompleted, getLessonProgress } from "../utils/lesson";
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';

const CircularProgressRight = styled(CircularProgress)({
    marginLeft: "auto"
});

const LessonDoneIcon = styled(DoneRoundedIcon)({
    marginLeft: "auto"
});

const LessonSummary = (props: PropsWithChildren<{
    progress?: number
}>) => {
    const { value } = useCountUp({
        isCounting: true,
        duration: 1,
        start: 0,
        end: props.progress || 0,
    });

    const valueNum = typeof (value) === 'number' ? value : Number(value);

    return (<AccordionSummary>
        {props.children}
        {valueNum === 0 ? null : <CircularProgressRight
            color="success"
            determinate
            size="sm"
            variant="soft"
            value={valueNum}
        />}
    </AccordionSummary>);
};

export default function Learn() {
    const [lessonProgress, setLessonProgress] = useState(null as string | null);

    useEffect(() => {
        setLessonProgress(window.localStorage.getItem("lesson-progress"));
    }, []);

    const lessonDoneIcon = (id: number, part: number) => {
        return getLessonCompleted(lessonProgress, id, part) ? <LessonDoneIcon color="success" /> : null;
    };

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
                        <LessonSummary progress={getLessonProgress(lessonProgress, 0)}>Introductory Tutorials</LessonSummary>
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
                                    <NextLink href="/lesson/1" passHref legacyBehavior><ListItemButton component="a"><Typography textColor="text.tertiary">1</Typography>How to use the puzzles page{lessonDoneIcon(0, 0)}</ListItemButton></NextLink>
                                </ListItem>
                                <ListItem>
                                    <NextLink href="/lesson/2" passHref legacyBehavior><ListItemButton component="a"><Typography textColor="text.tertiary">2</Typography>How to use the sandbox - Adding and removing nodes{lessonDoneIcon(0, 1)}</ListItemButton></NextLink>
                                </ListItem>
                                <ListItem>
                                    <NextLink href="/lesson/3" passHref legacyBehavior><ListItemButton component="a"><Typography textColor="text.tertiary">3</Typography>How to use the sandbox - Linking nodes{lessonDoneIcon(0, 2)}</ListItemButton></NextLink>
                                </ListItem>
                                <ListItem>
                                    <NextLink href="/lesson/4" passHref legacyBehavior><ListItemButton component="a"><Typography textColor="text.tertiary">4</Typography>How to use the sandbox - Interactive kinematics{lessonDoneIcon(0, 3)}</ListItemButton></NextLink>
                                </ListItem>
                                <ListItem>
                                    <NextLink href="/lesson/5" passHref legacyBehavior><ListItemButton component="a"><Typography textColor="text.tertiary">5</Typography>How to use the sandbox - Sharing{lessonDoneIcon(0, 4)}</ListItemButton></NextLink>
                                </ListItem>
                                <ListItem>
                                    <NextLink href="/lesson/6" passHref legacyBehavior><ListItemButton component="a"><Typography textColor="text.tertiary">6</Typography>How to use the sandbox - Labels and Comments{lessonDoneIcon(0, 5)}</ListItemButton></NextLink>
                                </ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion defaultExpanded>
                        <LessonSummary progress={getLessonProgress(lessonProgress, 1)}>Unit Circle Kinematics</LessonSummary>
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
                                    <NextLink href="/lesson/7" passHref legacyBehavior><ListItemButton component="a"><Typography textColor="text.tertiary">7</Typography>Sine and Cosine values on the unit circle{lessonDoneIcon(1, 0)}</ListItemButton></NextLink>
                                </ListItem>
                                <ListItem>
                                    <NextLink href="/lesson/8" passHref legacyBehavior><ListItemButton component="a"><Typography textColor="text.tertiary">8</Typography>Trigonometry - Right triangle vertex from an angle{lessonDoneIcon(1, 1)}</ListItemButton></NextLink>
                                </ListItem>
                                <ListItem>
                                    <NextLink href="/lesson/9" passHref legacyBehavior><ListItemButton component="a"><Typography textColor="text.tertiary">9</Typography>Trigonometry - Right triangle vertex from an angle and hypotenuse{lessonDoneIcon(1, 2)}</ListItemButton></NextLink>
                                </ListItem>
                                <ListItem>
                                    <NextLink href="/lesson/10" passHref legacyBehavior><ListItemButton component="a"><Typography textColor="text.tertiary">10</Typography>Trigonometry - Stacking triangles{lessonDoneIcon(1, 3)}</ListItemButton></NextLink>
                                </ListItem>
                                <ListItem>
                                    <NextLink href="/lesson/11" passHref legacyBehavior><ListItemButton component="a"><Typography textColor="text.tertiary">11</Typography>Solving kinematics problems using trigonometry{lessonDoneIcon(1, 4)}</ListItemButton></NextLink>
                                </ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion defaultExpanded>
                        <LessonSummary progress={getLessonProgress(lessonProgress, 2)}>Advanced Kinematics</LessonSummary>
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
                                    <NextLink href="/lesson/12" passHref legacyBehavior><ListItemButton component="a"><Typography textColor="text.tertiary">12</Typography>Advanced nodes - Translating node{lessonDoneIcon(2, 0)}</ListItemButton></NextLink>
                                </ListItem>
                                <ListItem>
                                    <NextLink href="/lesson/13" passHref legacyBehavior><ListItemButton component="a"><Typography textColor="text.tertiary">13</Typography>Advanced nodes - Arc translating node{lessonDoneIcon(2, 1)}</ListItemButton></NextLink>
                                </ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion defaultExpanded>
                        <LessonSummary progress={getLessonProgress(lessonProgress, 3)}>Inverse Kinematics</LessonSummary>
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
                                    <NextLink href="/lesson/14" passHref legacyBehavior><ListItemButton component="a"><Typography textColor="text.tertiary">14</Typography>Does not exist{lessonDoneIcon(3, 0)}</ListItemButton></NextLink>
                                </ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>
                </AccordionGroup>
            </Box>
        </>
    )
}