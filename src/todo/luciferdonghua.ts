import axios from "axios";
import * as cheerio from "cheerio";
import db from "../db";
import { eq } from "drizzle-orm";
import { chapter } from "../db/schema";
import { Video } from "../types/video";
import { timeout } from "../utils/timeout";

export async function luciferdonghua(link: string) {
  let title = "";
  try {
    const before = await db.query.chapter.findFirst({
      where: eq(chapter.link, link),
    });

    if (before) {
      title = before.title;
    } else {
      const rp = await axios.get(link);

      const $$ = cheerio.load(rp.data);
      title = $$("title").first().text().replace(/\\n/g, "").trim();
      const html2 = $$(".mobius option");
      const videos: Video[] = [];
      html2.each((i, elem) => {
        if (elem.attribs.value) {
          let buff = new Buffer(elem.attribs.value, "base64");
          let text = buff.toString("ascii");

          const $$$ = cheerio.load(text);

          try {
            const uri = $$$("iframe")?.first()?.attr()?.src;

            if (uri) {
              if (uri.startsWith("//")) {
                videos.push({
                  link: "https:" + uri,
                  label: elem.children[0].data,
                });
              } else {
                videos.push({ link: uri, label: elem.children[0].data });
              }
            }
          } catch (error) {
            console.log(error);
          }
        } else {
        }
      });

      if (videos.length === 0) {
        return null;
      }
      await db.insert(chapter).values({
        title: title,
        videos: videos as any,
        link: link,
        site: "luciferdonghua.org",
      });

      await timeout(500);
      return {
        data: {
          videos: videos,
        },
        title: title,
      };
    }
  } catch (error) {
    console.log(error);
    return null;
  }
}
