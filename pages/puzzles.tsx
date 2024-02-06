import AspectRatio from "@mui/joy/AspectRatio";
import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import CardOverflow from "@mui/joy/CardOverflow";
import Link from "@mui/joy/Link";
import Typography from "@mui/joy/Typography";
import Head from "next/head";
import NextLink from "next/link";
import Image from "next/image";
import cardPlaceholderImg from "../images/placeholder_360x360.webp";
import LinearProgress from "@mui/joy/LinearProgress";
import { useCountUp } from "use-count-up";

const PuzzleCard = (props: { title: string, description: string, progress?: number }) => {
    const { value } = useCountUp({
        isCounting: true,
        duration: 1,
        start: 0,
        end: props.progress || 0,
    });

    const valueNum = typeof (value) === 'number' ? value : Number(value);

    return (<Card orientation="vertical" size="lg" variant="outlined" sx={{
        width: {
            sm: 150,
            lg: 300
        },
        transition: 'transform .1s',
        '&:hover': { boxShadow: (t) => t.shadow.md, transform: 'scale(1.06)' },
    }}>
        <CardOverflow sx={{ transform: 'translate(0,0)' }}>
            <AspectRatio ratio="1">
                <Image alt="" src={cardPlaceholderImg} fill sizes="300px" />
            </AspectRatio>
            <LinearProgress determinate variant="soft" color="success" value={valueNum} sx={{
                position: 'fixed',
                zIndex: 2,
                left: '0',
                bottom: '0',
                right: '0',
                "--LinearProgress-radius": "0px"
            }} />
        </CardOverflow>
        <CardContent>
            <Typography fontWeight="md">
                <NextLink href="#" passHref legacyBehavior>
                    <Link
                        overlay
                        underline="none"
                        sx={{ color: 'text.primary' }}
                    >
                        {props.title}
                    </Link>
                </NextLink>
            </Typography>
            <Typography level="body-xs">{props.description}</Typography>
        </CardContent>
    </Card>);
};

export default function Puzzles() {
    return (
        <>
            <Head>
                <title>Pixel Perfect Kinematics | Puzzles</title>
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
                    PUZZLE TOPICS
                </Typography>
                <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="center" gap={5}>
                    <PuzzleCard title="Simple Kinematics" description="Description" progress={70} />
                    <PuzzleCard title="Multi-node Kinematics" description="Description" progress={30} />
                    <PuzzleCard title="Translating Kinematics" description="Description" progress={50} />
                    <PuzzleCard title="Inverse Kinematics" description="Description" progress={15} />
                </Box>
            </Box>
        </>
    )
}