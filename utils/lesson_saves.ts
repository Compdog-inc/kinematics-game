import puzzles_tutorial from "../lessons/puzzles_tutorial.json";

export interface LessonSave {
    name: string;
    description: string;
    cover: string;
    coverBlur: string;
    time: number;
    pages: LessonSavePage[];
}

export interface LessonSavePage {
    textBefore: string;
    textAfter: string;
    imageType: "image" | "svg" | "widget";
    imageSrc: string;
}

export const lessonMap = new Map<string, LessonSave>([
    ["1", puzzles_tutorial as LessonSave]
]);
