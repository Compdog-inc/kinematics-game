import { NextApiRequest, NextApiResponse } from "next";
import { Lesson } from "../../../utils/lesson";
import { LessonSave, lessonMap } from "../../../utils/lesson_saves";
import { kv } from "@vercel/kv";

const toInt = (s: unknown) => {
    if (typeof (s) === 'number')
        return s;
    else
        return Number(s);
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const id = req.query.id;
    const incrView = typeof (req.query.incrview) !== 'undefined';
    if (typeof (id) === 'string') {
        if (!lessonMap.has(id)) {
            res.status(404).end();
            return;
        }

        const save = lessonMap.get(id) as LessonSave;

        let viewCount;
        try {
            const key = 'lesson-views-' + id;
            viewCount = incrView ? (await kv.incr(key)) : toInt(await kv.get(key));
        } catch {
            viewCount = 0;
        }

        const lesson: Lesson = {
            name: save.name,
            description: save.description,
            pages: save.pages.length,
            cover: save.cover,
            coverBlur: save.coverBlur,
            time: save.time,
            views: viewCount
        };
        res.status(200).json(lesson);
    } else {
        res.status(400).end();
        return;
    }
};