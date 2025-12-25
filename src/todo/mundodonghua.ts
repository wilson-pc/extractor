import { launch } from "puppeteer-core";
import * as cheerio from "cheerio";
import db from "../db";
import { eq } from "drizzle-orm";
import { chapter } from "../db/schema";
import axios from "axios";
import { Link } from "../types";
import { mundodonghua } from "../sites/mundodonghua";
import { Video } from "../types/video";

export async function mundodonghuaTodo(
  link: string,
  links: boolean,
  salt: number
) {
  let title = "";
  const { data } = await axios.get(link);
  const $ = cheerio.load(data);
  title = $("title").first().text().replace(/\\n/g, "").trim();
  const html = $(".donghua-list a");

  const capitulos: Link[] = [];
  let full: any[] = [];

  html.each((i, elem) => {
    const $$ = cheerio.load(elem);
    if (elem.attribs?.href?.includes("mundodonghua.com")) {
      capitulos.push({
        url: elem.attribs.href,
        title: $$("blockquote").first().text().replace(/\\n/g, "").trim(),
      });
    } else {
      if (elem.attribs.href.includes("https:")) {
        capitulos.push({
          url: elem.attribs.href,
          title: $$("blockquote").first().text().replace(/\\n/g, "").trim(),
        });
      } else {
        capitulos.push({
          url: "https://www.mundodonghua.com" + elem.attribs.href,
          title: $$("blockquote").first().text().replace(/\\n/g, "").trim(),
        });
      }
    }
  });
  if (!links) {
    console.log("No link", capitulos);
    for (const iterator of capitulos.reverse().slice(salt)) {
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
            videos: videos,
          });
        } else {
          const capt = await mundodonghua(iterator.url);

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
