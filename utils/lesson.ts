export interface Lesson {
    name: string;
    description: string;
    pages: number;
    cover: string;
    coverBlur: string;
    time: number;
    views: number;
}

export interface LessonPage {
    textBefore: string;
    textAfter?: string;
    imageType: LessonImageType;
    imageSrc: string;
}

export enum LessonImageType {
    Image,
    Svg,
    Widget
}