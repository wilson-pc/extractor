import axios from "axios";
import * as cheerio from "cheerio";
import db from "../db";
import { eq } from "drizzle-orm";
import { chapter } from "../db/schema";
import { Video } from "../types/video";
import { Link } from "../types";
import { timeout } from "../utils/timeout";
import { others } from "../sites/others";

export async function doramedplayTodo(
  link: string,
  links: boolean,
  salt: number
) {
  const capitulos: Link[] = [];
  let full: any[] = [];
  let title = "";
  const { data } = await axios.get(link);
  const $ = cheerio.load(data);
  title = $("title").first().text().replace(/\\n/g, "").trim();
  const html = $("#serie_contenido .episodiotitle a");

  html.each((i, elem) => {
    capitulos.push({ url: elem.attribs.href, title: elem.children[0].data });
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
          const capt = await others(iterator.url);

          if (capt) {
            full.push({ ...iterator, videos: capt.data.videos });
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  } else {
    full = capitulos;
  }
  return {
    data: full,
    title: title,
  };
}
