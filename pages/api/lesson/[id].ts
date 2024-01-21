import { NextApiRequest, NextApiResponse } from "next";
import { Lesson } from "../../../utils/lesson";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const id = req.query.id;
    const lesson: Lesson = {
        name: "Tristique magna sit amet purus gravida quis blandit #" + id,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Eget felis eget nunc lobortis.",
        pages: 1,
        cover: "/images/lesson/1/cover.webp",
        coverBlur: "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=",
        time: 60000,
        views: 15
    };
    res.status(200).json(lesson);
};