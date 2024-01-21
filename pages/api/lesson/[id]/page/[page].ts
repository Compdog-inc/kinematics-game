import { NextApiRequest, NextApiResponse } from "next";
import { LessonImageType, LessonPage } from "../../../../../utils/lesson";
import { LessonSave, lessonMap } from "../../../../../utils/lesson_saves";

const toInt = (s: string): number => {
    return isNaN(parseInt(s)) ? NaN : Number(s);
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const id = req.query.id;
    const page = req.query.page;
    if (typeof (id) === 'string' && typeof (page) === 'string') {
        if (!lessonMap.has(id))
            res.status(404).end();

        const save = lessonMap.get(id) as LessonSave;
        const pagenum = toInt(page);
        if (!isNaN(pagenum) && pagenum >= 0 && pagenum < save.pages.length) {
            const lesson: LessonPage = {
                textBefore: save.pages[pagenum].textBefore,
                textAfter: save.pages[pagenum].textAfter,
                imageType: save.pages[pagenum].imageType === 'image' ? LessonImageType.Image : save.pages[pagenum].imageType === 'svg' ? LessonImageType.Svg : LessonImageType.Widget,
                imageSrc: save.pages[pagenum].imageSrc
            };
            res.status(200).json(lesson);
        } else {
            res.status(400).end();
        }
    } else {
        res.status(400).end();
    }
};