import puzzles_tutorial from "../lessons/puzzles_tutorial.json";
import adding_removing_nodes from "../lessons/adding_removing_nodes.json";
import linking_nodes from "../lessons/linking_nodes.json";
import interactive_kinematics from "../lessons/interactive_kinematics.json";
import sharing from "../lessons/sharing.json";
import sincos from "../lessons/sincos.json";
import vertex from "../lessons/vertex.json";
import hypo from "../lessons/hypo.json";
import stacking from "../lessons/stacking.json";
import solvingkinematics from "../lessons/solvingkinematics.json";
import translatingnode from "../lessons/translatingnode.json";
import arcnode from "../lessons/arcnode.json";

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
    ["9", hypo as LessonSave],
    ["10", stacking as LessonSave],
    ["11", solvingkinematics as LessonSave],
    ["12", translatingnode as LessonSave],
    ["13", arcnode as LessonSave]
]);

export const lessonTopicSizes = [6, 5, 2, 1];

export const lessonTopicStarts = new Map<number, { ref: number, id: number }>([
    [0, { ref: 0, id: 0 }],
    [1, { ref: 0, id: 0 }],
    [2, { ref: 0, id: 0 }],
    [3, { ref: 0, id: 0 }],
    [4, { ref: 0, id: 0 }],
    [5, { ref: 0, id: 0 }],
    [6, { ref: 6, id: 1 }],
    [7, { ref: 6, id: 1 }],
    [8, { ref: 6, id: 1 }],
    [9, { ref: 6, id: 1 }],
    [10, { ref: 6, id: 1 }],
    [11, { ref: 11, id: 2 }],
    [12, { ref: 11, id: 2 }],
    [13, { ref: 12, id: 3 }]
]);