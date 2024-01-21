import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import Typography from "@mui/joy/Typography";
import Head from "next/head";
import React, { useEffect } from "react";
import { Lesson, LessonImageType, LessonPage } from "../utils/lesson";
import Skeleton from "@mui/joy/Skeleton";
import AspectRatio from "@mui/joy/AspectRatio";
import Image from "next/image";
import CardOverflow from "@mui/joy/CardOverflow";
import CardContent from "@mui/joy/CardContent";
import humanizeDuration from "humanize-duration";
import Button from "@mui/joy/Button";
import Gamewidget from "../components/gamewidget";
import { useRouter } from "next/router";

export default function Lesson() {
    const [lesson, setLesson] = React.useState(null as Lesson | null);
    const [page, setPage] = React.useState(-1);
    const [jsPage, setJsPage] = React.useState(null as LessonPage | null);
    const router = useRouter();

    const lessonId = React.useRef(null as string | null);
    const pageCache = React.useRef(new Map<number, LessonPage>());

    useEffect(() => {
        const url = new URL(location.href);
        const path = url.pathname.split('/');
        const indexOfLesson = path.indexOf('lesson');
        if (indexOfLesson >= 0 && path.length > indexOfLesson + 1) {
            const id = path[indexOfLesson + 1];
            lessonId.current = id;
            (async () => {
                const resp = await fetch("/api/lesson/" + id);
                if (resp.ok) {
                    const json = await resp.json();
                    setLesson(json);
                }
            })();
        }
    }, []);

    useEffect(() => {
        if (lessonId.current && page > -1) {
            (async () => {
                const resp = await fetch("/api/lesson/" + lessonId.current + "/page/" + page);
                if (resp.ok) {
                    const json = await resp.json();
                    pageCache.current.set(page, json);
                    setJsPage(json);
                }
            })();
        }
    }, [page]);

    let cachedPage = jsPage;
    if (pageCache.current.has(page)) {
        cachedPage = pageCache.current.get(page) as LessonPage;
    }

    return (
        <>
            <Head>
                <title>Pixel Perfect Kinematics | Lesson</title>
            </Head>
            <Box display="flex" justifyContent="center" height="calc(100vh - 60px)" sx={{
                pt: {
                    xs: 0,
                    md: 4
                },
                pb: {
                    xs: 0,
                    md: 4
                }
            }}>
                <Card variant="outlined" size="lg" orientation="horizontal" sx={{
                    width: {
                        xs: '100%',
                        md: '70%',
                        lg: '1000px'
                    },
                    minHeight: {
                        xs: '100%',
                        md: '700px'
                    },
                    borderRadius: {
                        xs: '0',
                        md: 'lg'
                    },
                    borderWidth: {
                        xs: 0,
                        md: '1px'
                    },
                    margin: 'auto 0'
                }}>
                    {page === -1 ?
                        <CardOverflow>
                            <AspectRatio variant="plain" flex sx={{
                                width: {
                                    md: '200px',
                                    lg: '300px'
                                },
                                display: {
                                    xs: 'none',
                                    md: 'flex'
                                },
                                backgroundColor: 'background.body'
                            }}>
                                <Skeleton loading={lesson == null}>
                                    {lesson != null ?
                                        <Image alt="" src={lesson.cover} placeholder="blur" blurDataURL={lesson.coverBlur} fill /> :
                                        null}
                                </Skeleton>
                            </AspectRatio>
                        </CardOverflow> : null}
                    <CardContent>
                        {page === -1 ? <>
                            <Typography level="h3" mb={4}>
                                <Skeleton loading={lesson == null}>
                                    {lesson == null ? "tristique magna sit amet purus gravida quis blandit" : lesson.name}
                                </Skeleton>
                            </Typography>
                            <Typography level="body-md" mb={1}>
                                <Skeleton loading={lesson == null}>
                                    {lesson == null ? "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Eget felis eget nunc lobortis." : lesson.description}
                                </Skeleton>
                            </Typography>
                            <Typography level="body-sm" textColor="text.secondary">
                                Time to complete:&nbsp;
                                <Typography component="span" level="body-sm" textColor="text.tertiary">
                                    <Skeleton loading={lesson == null}>
                                        {lesson == null ? "1 minute" : humanizeDuration(lesson.time, {
                                            round: true
                                        })}
                                    </Skeleton>
                                </Typography>
                            </Typography>
                            <Typography level="body-sm" textColor="text.tertiary">
                                <Typography component="span" level="body-sm" textColor="text.tertiary">
                                    <Skeleton loading={lesson == null}>
                                        {lesson == null ? "69" : lesson.views}
                                    </Skeleton>
                                </Typography>&nbsp;views
                            </Typography>
                        </> : <>
                            <Typography level="body-lg" mb={1}>
                                <Skeleton loading={cachedPage == null}>
                                    {cachedPage == null ? "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Eget felis eget nunc lobortis." : cachedPage.textBefore}
                                </Skeleton>
                            </Typography>
                            <AspectRatio ratio="1" sx={{
                                width: '200px',
                                m: 3
                            }}>
                                <Skeleton loading={cachedPage == null}>
                                    {(cachedPage != null && cachedPage.imageType === LessonImageType.Image) ?
                                        <Image alt="" src={cachedPage.imageSrc} placeholder="empty" fill /> :
                                        (cachedPage != null && cachedPage.imageType === LessonImageType.Svg) ?
                                            <Image alt="" src={cachedPage.imageSrc} placeholder="empty" fill /> :
                                            <Gamewidget />
                                    }
                                </Skeleton>
                            </AspectRatio>
                            {(cachedPage == null || cachedPage?.textAfter) ?
                                <Typography level="body-lg" mb={1}>
                                    <Skeleton loading={cachedPage == null}>
                                        {cachedPage == null ? "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Eget felis eget nunc lobortis." : cachedPage.textAfter}
                                    </Skeleton>
                                </Typography> : null}
                        </>}
                        <Box display="flex" flexDirection="row" justifyContent="flex-end" flex="1" gap={2} sx={{
                            alignItems: {
                                xs: 'flex-start',
                                md: 'flex-end'
                            },
                            mt: {
                                xs: 4,
                                md: 0
                            }
                        }}>
                            {page > -1 ?
                                <Button size="md" variant="soft" color="neutral" aria-label="Start the lesson" onClick={() => {
                                    setPage(page - 1);
                                    setJsPage(null);
                                }}>
                                    Back
                                </Button> : null}
                            <Button size="md" variant="solid" color="primary" aria-label="Start the lesson" onClick={() => {
                                if (lesson != null && page < lesson.pages - 1) {
                                    setPage(page + 1);
                                    setJsPage(null);
                                } else {
                                    router.push("/learn");
                                }
                            }}>
                                {(page === -1 || lesson == null) ? 'Start' : (page < lesson.pages - 1) ? 'Next' : 'Finish'}
                                <Skeleton loading={lesson == null} sx={{
                                    borderRadius: 'sm'
                                }} />
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </>
    )
}