import axios from "axios";
import * as cheerio from "cheerio";
import { Video } from "../types/video";
import { timeout } from "../utils/timeout";
import db from "../db";
import { eq } from "drizzle-orm";
import { chapter } from "../db/schema";

export async function donghualife(link: string) {
  console.log(link);
  let title = "";
  try {
    const before = await db.query.chapter.findFirst({
      where: eq(chapter.link, link),
    });

    if (before) {
      title = before.title;
      return {
        data: {
          videos: before.videos,
        },
        title: before.title,
      };
    } else {
      const { data } = await axios.get(link);
      const dee = data.split(`\\"sources\\":`)[1].split(`],`)[0] + `]`;

      const json = JSON.parse(dee.replace(/\\"/g, '"'));

      const $$ = cheerio.load(data);
      const decd = data.split(`\\"title\\":\\"`)[1].split(`\\"`)[0];

      title = decd.trim();
      const html2 = $$(".embed-links li a");
      const videos: { link: string; label: string }[] = [];
      html2.each((i, elem) => {
        if (elem.attribs["data-video"]) {
          const rp = elem.attribs["data-video"].replace(/\\n/g, "").trim();
          const name = elem.attribs["title"].replace(/\\n/g, "").trim();

          videos.push({ link: rp, label: name });
        }
      });

      for (const element of json) {
        const rs = await axios.post(
          "https://donghualife.com/api/player/source",
          {
            token: element.token,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Referer: "link",
            },
          },
        );
        const url = rs.data?.url;
        videos.push({ link: url, label: element.label });
      }

      if (videos.length === 0) {
        return null;
      }

      await db.insert(chapter).values({
        title: title,
        videos: videos,
        link: link,
        site: "donghualife.com",
      });

      await timeout(400);
      return { data: { videos: videos }, title: title };
    }
  } catch (error) {
    return null;
  }
}
