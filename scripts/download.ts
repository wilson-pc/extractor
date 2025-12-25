import { createId } from "@paralleldrive/cuid2";
import db from "../src/db";
import { prisma } from "../src/db/prisma";
import { chapter } from "../src/db/schema";
import { Chapter } from "../src/generated/prisma";
function chunk(arr: any[], size: number) {
  const chunks: any[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
async function download() {
  const donahuas = await prisma.donghua.findMany();
  console.log(donahuas);
  const chapters = await prisma.chapter.findMany();
  console.log(chapters);
  const chunks: Chapter[][] = chunk(chapters, 2000);
  for (const element of chunks) {
    const values = element.map((chapter) => {
      return {
        id: createId(),
        title: chapter.title,
        link: chapter.link,
        site: chapter.site,
        videos: chapter.videos as any,
      };
    });
    await db.insert(chapter).values(values);
  }
  console.log("Done");
}

download().then((file) => {
  console.log("Downloaded file:", file);
});
