import puzzles_tutorial from "../lessons/puzzles_tutorial.json";
import adding_removing_nodes from "../lessons/adding_removing_nodes.json";
import linking_nodes from "../lessons/linking_nodes.json";
import interactive_kinematics from "../lessons/interactive_kinematics.json";
import sharing from "../lessons/sharing.json";
import sincos from "../lessons/sincos.json";
import vertex from "../lessons/vertex.json";
import hypo from "../lessons/hypo.json";

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
    ["2", adding_removing_nodes as LessonSave],
    ["3", linking_nodes as LessonSave],
    ["4", interactive_kinematics as LessonSave],
    ["5", sharing as LessonSave],
    ["7", sincos as LessonSave],
    ["8", vertex as LessonSave],
    ["9", hypo as LessonSave]
]);
