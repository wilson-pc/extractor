import axios from "axios";
import * as cheerio from "cheerio";
import db from "../db";
import { eq } from "drizzle-orm";
import { chapter } from "../db/schema";
import { Video } from "../types/video";
import { timeout } from "../utils/timeout";
import { Link } from "../types";
import { animexin } from "../sites/animexin";
import { donghualife } from "../sites/donghualife";

export async function donghualifeTodo(
  link: string,
  links: boolean,
  salt: number
) {
  let title = "";
  const capitulos: Link[] = [];
  let full: any[] = [];
  const loops = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  ];
  const link2 = link.split("?page")[0];
  for (const page of loops) {
    const { data } = await axios.get(`${link2}?page=${page}`);
    const $ = cheerio.load(data);

    const html = $(".view-content tbody a");
    title = $(".titulo h2 a").first().text().replace(/\\n/g, "").trim();

    html.each((i, elem) => {
      //  console.log(elem.children[0])
      const urld = elem.attribs.href;
      const tittle = elem.children[0].data;
      capitulos.push({ url: "https://donghualife.com" + urld, title: tittle });
    });
    if (html.length === 0) {
      break;
    }
  }
  if (!links) {
    for (const iterator of capitulos.reverse().slice(salt)) {
      try {
        let videos = [];
        const before = await db.query.chapter.findFirst({
          where: eq(chapter.link, iterator.url),
        });

        if (before) {
          videos = before.videos;

          full.push({
            ...iterator,
            videos: videos,
          });
        } else {
          const capt = await donghualife(iterator.url);

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
