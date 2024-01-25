import puzzles_tutorial from "../lessons/puzzles_tutorial.json";
import adding_removing_nodes from "../lessons/adding_removing_nodes.json";

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
    ["1", puzzles_tutorial as LessonSave],
    ["2", adding_removing_nodes as LessonSave]
]);
