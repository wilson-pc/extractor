import axios from "axios";
import * as cheerio from "cheerio";
import { Video } from "../types/video";
import { timeout } from "../utils/timeout";
import db from "../db";
import { eq } from "drizzle-orm";
import { chapter } from "../db/schema";

export async function lmanime(link: string) {
  let title = "";
  try {
    const before = await db.query.chapter.findFirst({
      where: eq(chapter.link, link),
    });

    if (before) {
      return {
        data: {
          videos: before.videos,
        },
        title: before.title,
      };
    } else {
      const rp = await axios.get(link);

      const $$ = cheerio.load(rp.data);
      title = $$("title").first().text().replace(/\\n/g, "").trim();
      const html2 = $$(".mobius option");
      const videos = [];
      const tempLinks: Video[] = [];
      html2.each((i, elem) => {
        if (elem.attribs.value) {
          tempLinks.push({
            link: elem.attribs.value,
            label: elem.children[0].data,
          });
        } else {
        }
      });

      for (const element of tempLinks) {
        const rpp = await axios.get(element.link);

        const $t = cheerio.load(rpp.data);
        const linkf = $t("iframe")?.first()?.attr()?.src;
        if (linkf) {
          if (linkf.startsWith("//")) {
            videos.push({ link: "https:" + linkf, label: element.label });
          } else {
            videos.push({ link: linkf, label: element.label });
          }
        }
      }

      if (videos.length === 0) {
        return null;
      }
      await db.insert(chapter).values({
        title: title,
        videos: videos,
        link: link,
        site: "lmanime.com",
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
