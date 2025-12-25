import axios from "axios";
import * as cheerio from "cheerio";
import db from "../db";
import { eq } from "drizzle-orm";
import { chapter } from "../db/schema";
import { Video } from "../types/video";
import { timeout } from "../utils/timeout";
import { Link } from "../types";
import { animexin } from "../sites/animexin";

export async function animexinTodo(link: string, links: boolean, salt: number) {
  let title = "";
  const capitulos: Link[] = [];
  let full: any[] = [];
  const { data } = await axios.get(link);
  const $ = cheerio.load(data);

  const html = $(".eplister a");
  title = $("title").first().text().replace(/\\n/g, "").trim();

  html.each((i, elem) => {
    //  console.log(elem.children[0])
    const elem2 = cheerio.load(elem);
    const title = elem2(".epl-title").first().text().replace(/\\n/g, "").trim();
    capitulos.push({ url: elem.attribs.href, title: title });
  });
  if (!links) {
    for (const iterator of capitulos.slice(salt)) {
      try {
        let videos = [];
        const before = await db.query.chapter.findFirst({
          where: eq(chapter.link, iterator.url),
        });

        let cpTitle = "";
        if (before) {
          videos = before.videos;
          cpTitle = before.title;

          full.push({
            ...iterator,
            videos: videos.map((vid: any) => {
              return JSON.parse(vid) as Video; // TOD
            }),
          });
        } else {
          const capt = await animexin(iterator.url);

          if (capt) {
            full.push({ ...iterator, videos: capt.data.videos });
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  } else {
    full = capitulos.reverse();
  }
  return {
    data: full,
    title: title,
  };
}
