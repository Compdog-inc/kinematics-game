import Card from "@mui/joy/Card";
import CardOverflow from "@mui/joy/CardOverflow";
import AspectRatio from "@mui/joy/AspectRatio";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import Image from "next/image";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { MouseEventHandler, ReactNode } from "react";
import styles from "../styles/sandboxcard.module.css";
import { styled } from '@mui/joy/styles';
import IconButton from "@mui/joy/IconButton";
import AddRounded from '@mui/icons-material/AddRounded';

const ThumbnailAspectRatio = styled(AspectRatio)({
    width: 100
});

const AddIcon = styled(IconButton)({
    position: 'fixed',
    zIndex: 2,
    borderRadius: '12px',
    right: '5px',
    top: '5px'
});

const HoverCard = styled(Card)(({ theme }) => ({
    '&:hover': {
        backgroundColor: theme.vars.palette.background.level1
    }
}));

export default function SandboxCard(props: {
    thumbnail: string | StaticImport,
    name: ReactNode,
    description: ReactNode,
    addToggled?: boolean,
    onAddClick?: MouseEventHandler<HTMLButtonElement>,
    drop?: (s: string) => void,
    id: string
}) {
    return (<HoverCard orientation="horizontal" variant="outlined" className={styles.card} draggable onDragStart={(e) => {
        e.dataTransfer.setData("sandbox/node", props.id);
        if (props.drop) {
            props.drop(props.id);
        }
        e.dataTransfer.dropEffect = "copy";
    }}>
        <CardOverflow>
            <ThumbnailAspectRatio ratio="1" flex>
                <Image alt="" aria-hidden src={props.thumbnail} placeholder="blur" />
            </ThumbnailAspectRatio>
            <AddIcon
                aria-label="Toggle add on click"
                size="md"
                variant={props.addToggled ? "solid" : "plain"}
                color="primary" onClick={props.onAddClick}>
                <AddRounded />
            </AddIcon>
        </CardOverflow>
        <CardContent>
            <Typography fontWeight="md">{props.name}</Typography>
            <Typography level="body-xs">{props.description}</Typography>
        </CardContent>
    </HoverCard>);
}