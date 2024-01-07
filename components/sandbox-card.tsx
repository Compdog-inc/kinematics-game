import Card from "@mui/joy/Card";
import CardOverflow from "@mui/joy/CardOverflow";
import AspectRatio from "@mui/joy/AspectRatio";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import Image from "next/image";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { MouseEventHandler, ReactNode, useCallback, useRef, PointerEvent } from "react";
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
    const rootRef = useRef(null as HTMLDivElement | null);
    const popupRef = useRef(null as HTMLDivElement | null);

    const pointerDown = useCallback((e: PointerEvent<HTMLDivElement>) => {
        if (rootRef.current) {
            e.preventDefault();
            const bounds = rootRef.current.getBoundingClientRect();

            const blur = document.createElement("div");
            blur.style.position = "fixed";
            blur.style.left = "0";
            blur.style.top = "0";
            blur.style.right = "0";
            blur.style.bottom = "0";
            blur.style.pointerEvents = "none";
            if (window.visualViewport) {
                blur.style.backdropFilter = "blur(8px)";
                blur.style.opacity = "0";
                blur.style.transition = "opacity 300ms cubic-bezier(0.76, 0, 1, 0.76) 100ms";
                blur.style.mask = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${window.visualViewport.width} ${window.visualViewport.height}" preserveAspectRatio="none"><rect x="0" y="0" width="100%" height="100%" fill="white"/><rect x="${bounds.x}" y="${bounds.y}" width="${bounds.width}" height="${bounds.height}" fill="black" rx="8"/></svg>') luminance 0/100% 100%`;
            }
            requestAnimationFrame(() => blur.style.opacity = "1");
            document.body.appendChild(blur);

            const removeBlur = () => {
                if (blur.style.opacity === "1") {
                    blur.style.transition = "opacity 150ms cubic-bezier(0.03, 0.79, 0.78, 1) 0s";
                    blur.style.opacity = "0";
                    setTimeout(() => {
                        blur.remove();
                    }, 150);
                }
            };

            let timeout: NodeJS.Timeout;

            const scrolls = Array.from(document.querySelectorAll("div")).filter(m => {
                const v = m.computedStyleMap().get("overflow-y");
                if (typeof (v) !== 'undefined')
                    return v.toString() === "auto";
                return false;
            });

            const scroll = () => {
                clearTimeout(timeout);
                removeBlur();
                window.removeEventListener('pointermove', tm1);
            };

            scrolls.forEach(v => v.addEventListener('scroll', scroll));

            const startMX = e.clientX;
            const startMY = e.clientY;
            const tm1 = (e1: globalThis.PointerEvent) => {
                const dx = e1.clientX - startMX;
                const dy = e1.clientY - startMY;
                const delta = Math.max(dx, dy);
                if (delta > 5) {
                    clearTimeout(timeout);
                    removeBlur();
                    window.removeEventListener('pointermove', tm1);
                    scrolls.forEach(v => v.removeEventListener('scroll', scroll));
                }
            };

            const tm2 = (_: globalThis.PointerEvent) => {
                clearTimeout(timeout);
                removeBlur();
            };

            window.addEventListener('pointermove', tm1, {
                once: false,
                passive: true
            });

            window.addEventListener('pointerup', tm2, {
                once: true,
                passive: true
            });

            timeout = setTimeout(() => {
                if (rootRef.current) {
                    window.removeEventListener('pointermove', tm1);
                    window.removeEventListener('pointerup', tm2);
                    const offsetX = e.clientX - bounds.x;
                    const offsetY = e.clientY - bounds.y;
                    const elem = document.createElement("div");
                    elem.style.position = "fixed";
                    elem.style.touchAction = "none";
                    elem.style.pointerEvents = "none";
                    elem.style.left = (e.clientX - offsetX) + "px";
                    elem.style.top = (e.clientY - offsetY) + "px";
                    elem.style.width = bounds.width + "px";
                    elem.style.height = bounds.height + "px";
                    elem.innerHTML = rootRef.current.outerHTML;
                    document.body.appendChild(elem);
                    popupRef.current = elem;

                    const move = (e: globalThis.PointerEvent) => {
                        if (popupRef.current) {
                            e.preventDefault();
                            removeBlur();
                            popupRef.current.style.left = (e.clientX - offsetX) + "px";
                            popupRef.current.style.top = (e.clientY - offsetY) + "px";
                        }
                    };

                    window.addEventListener('pointermove', move, {
                        passive: false
                    });

                    window.addEventListener('pointerup', () => {
                        popupRef.current?.remove();
                        removeBlur();
                        window.removeEventListener('pointermove', move);
                    }, {
                        once: true,
                        passive: true
                    });
                }
            }, e.pointerType === "mouse" ? 0 : 300);
        }
    }, []);

    return (<HoverCard orientation="horizontal" variant="outlined" className={styles.card} ref={rootRef} onContextMenu={e => e.preventDefault()} onPointerDown={pointerDown}>
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
