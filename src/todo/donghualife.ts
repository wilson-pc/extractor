import axios from "axios";
import * as cheerio from "cheerio";
import db from "../db";
import { inArray } from "drizzle-orm";
import { chapter } from "../db/schema";
import { Video } from "../types/video";
import { timeout } from "../utils/timeout";
import { Link } from "../types";
import { animexin } from "../sites/animexin";
import { donghualife } from "../sites/donghualife";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function donghualifeTodo(
  link: string,
  links: boolean,
  salt: number,
) {
  let title = "";
  const capitulos: Link[] = [];
  let full: any[] = [];
  const { data } = await axios.get(link);
  const ss = data.split(`\\"seasons\\":`)[1].split(`],`)[0] + `]`;

  const json = JSON.parse(ss.replace(/\\"/g, '"'));

  const slug = data.split(`seriesSlug\\":\\"`)[1].split(`\\"`)[0];
  const cdfdfe = data
    .split(`TVSeries\\\",\\\"name\\\":\\\"`)[1]
    .split(`\\\"`)[0];
  title = cdfdfe.trim();

  for (const element of json) {
    const rp = await axios.get(
      `https://donghualife.com/api/series/${slug}/seasons/${element.slug}/episodes`,

      {
        headers: {
          "Content-Type": "application/json",
          Referer: "link",
        },
      },
    );

    const episodios = rp.data.episodes;
    for (const episodio of episodios) {
      capitulos.push({
        url: `https://donghualife.com/watch/${element.slug}-${episodio.number}`,
        title: `${title} - ${element.label} - ${episodio.title}`,
      });
    }
  }

  if (!links) {
    const capitulosToProcess = capitulos.slice(salt);
    const existingChapters = capitulosToProcess.length
      ? await db.query.chapter.findMany({
          where: inArray(
            chapter.link,
            capitulosToProcess.map((iterator) => iterator.url),
          ),
        })
      : [];
    const chaptersByUrl = new Map(
      existingChapters.map((existingChapter) => [
        existingChapter.link,
        existingChapter,
      ]),
    );

    for (const iterator of capitulosToProcess) {
      try {
        let videos = [];
        const before = chaptersByUrl.get(iterator.url);

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
            await sleep(3000);
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
