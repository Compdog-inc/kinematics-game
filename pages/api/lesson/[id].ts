import { NextApiRequest, NextApiResponse } from "next";
import { Lesson } from "../../../utils/lesson";
import { LessonSave, lessonMap } from "../../../utils/lesson_saves";
import { kv } from "@vercel/kv";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const id = req.query.id;
    if (typeof (id) === 'string') {
        if (!lessonMap.has(id))
            return res.status(404).end();

        const save = lessonMap.get(id) as LessonSave;

        const viewCount = await kv.incr('lesson-views-' + id);

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
    }
};