import { NextApiRequest, NextApiResponse } from "next";
import { LessonImageType, LessonPage } from "../../../../../utils/lesson";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const id = req.query.id;
    const page = req.query.page;
    const lesson: LessonPage = {
        textBefore: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Arcu odio ut sem nulla. Sit amet consectetur adipiscing elit duis.",
        textAfter: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Neque vitae tempus quam pellentesque. Turpis egestas maecenas pharetra convallis posuere. (" + id + ":" + page + ")",
        imageType: LessonImageType.Image,
        imageSrc: "/images/lesson/1/img0.webp"
    };
    res.status(200).json(lesson);
};