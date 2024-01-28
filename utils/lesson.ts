import { lessonTopicSizes } from "./lesson_saves";

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
    None,
    Image,
    Svg,
    Widget
}

export interface Lessons {
    progress: number;
    lessons: boolean[];
}

export const getLessonProgress = (ls: string | null, id: number): number | undefined => {
    if (typeof (window) === 'undefined' || typeof (window.localStorage) === 'undefined')
        return;
    if (!ls)
        return;
    try {
        const obj = JSON.parse(ls);
        if (typeof (obj) !== 'object' || typeof (obj.length) !== 'number')
            return;
        if (id < obj.length) {
            const lsn = obj[id] as Lessons;
            if (typeof (lsn) !== 'object' || typeof (lsn.progress) !== 'number')
                return;
            return lsn.progress;
        } else {
            return;
        }
    } catch {
        return;
    }
};

export const getLessonCompleted = (ls: string | null, id: number, part: number): boolean => {
    if (typeof (window) === 'undefined' || typeof (window.localStorage) === 'undefined')
        return false;
    if (!ls)
        return false;
    try {
        const obj = JSON.parse(ls);
        if (typeof (obj) !== 'object' || typeof (obj.length) !== 'number')
            return false;
        if (id < obj.length) {
            const lsn = obj[id] as Lessons;
            if (typeof (lsn) !== 'object' || typeof (lsn.progress) !== 'number' || typeof (lsn.lessons) !== 'object' || typeof (lsn.lessons.length) !== 'number')
                return false;
            if (part < lsn.lessons.length) {
                const completed = lsn.lessons[part];
                if (typeof (completed) !== 'boolean')
                    return false;
                return completed;
            } else {
                return false;
            }
        } else {
            return false;
        }
    } catch {
        return false;
    }
};

export const getLessonsCompletedFlag = (id: number): boolean[] | undefined => {
    if (typeof (window) === 'undefined' || typeof (window.localStorage) === 'undefined')
        return;
    const ls = window.localStorage.getItem("lesson-progress");
    if (!ls)
        return;
    try {
        const obj = JSON.parse(ls);
        if (typeof (obj) !== 'object' || typeof (obj.length) !== 'number')
            return;
        if (id < obj.length) {
            const lsn = obj[id] as Lessons;
            if (typeof (lsn) !== 'object' || typeof (lsn.progress) !== 'number' || typeof (lsn.lessons) !== 'object' || typeof (lsn.lessons.length) !== 'number')
                return;
            return lsn.lessons;
        } else {
            return;
        }
    } catch {
        return;
    }
};

export const setLessonProgress = (id: number, progress: number) => {
    if (typeof (window) === 'undefined' || typeof (window.localStorage) === 'undefined')
        return;
    const ls = window.localStorage.getItem("lesson-progress");
    if (!ls)
        return;
    try {
        const obj = JSON.parse(ls);
        if (typeof (obj) !== 'object' || typeof (obj.length) !== 'number')
            return;
        if (id < obj.length) {
            const lsn = obj[id] as Lessons;
            if (typeof (lsn) !== 'object' || typeof (lsn.progress) !== 'number')
                return;
            lsn.progress = progress;
            obj[id] = lsn;
            window.localStorage.setItem("lesson-progress", JSON.stringify(obj));
        } else {
            return;
        }
    } catch {
        return;
    }
};

export const setLessonCompleted = (id: number, part: number, completed: boolean) => {
    if (typeof (window) === 'undefined' || typeof (window.localStorage) === 'undefined')
        return;
    const ls = window.localStorage.getItem("lesson-progress");
    if (!ls) {
        const arr: Lessons[] = [];
        const prts: boolean[] = [];

        for (let i = 0; i < lessonTopicSizes[id]; ++i) {
            if (i !== part)
                prts.push(false);
            else
                prts.push(completed);
        }
        for (let i = 0; i < lessonTopicSizes.length; ++i) {
            if (i !== id) {
                const tmp = [];
                for (let j = 0; j < lessonTopicSizes[i]; ++j) {
                    tmp.push(false);
                }
                arr.push({
                    progress: 0,
                    lessons: tmp
                });
            } else {
                arr.push({
                    progress: 0,
                    lessons: prts
                });
            }
        }
        window.localStorage.setItem("lesson-progress", JSON.stringify(arr));
        return;
    }
    try {
        const obj = JSON.parse(ls);
        if (typeof (obj) !== 'object' || typeof (obj.length) !== 'number')
            return;
        if (id < obj.length) {
            const lsn = obj[id] as Lessons;
            if (typeof (lsn) !== 'object' || typeof (lsn.progress) !== 'number' || typeof (lsn.lessons) !== 'object' || typeof (lsn.lessons.length) !== 'number')
                return;
            if (part < lsn.lessons.length) {
                if (typeof (lsn.lessons[part]) !== 'boolean')
                    return;
                lsn.lessons[part] = completed;
                obj[id] = lsn;
                window.localStorage.setItem("lesson-progress", JSON.stringify(obj));
            } else {
                return;
            }
        } else {
            return;
        }
    } catch {
        return;
    }
};