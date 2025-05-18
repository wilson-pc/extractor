import axios from "axios"
import * as cheerio from 'cheerio'
import { prisma } from "../db/prisma"
import { Video } from "../types/video"

export async function others(link: string) {
    let title = ""
  
    try {
        const before = await prisma.chapter.findFirst({ where: { link: link } })

        if (before) {
           
            title = before.title
        } else {
            const rp = await axios.get(link)
            const $$ = cheerio.load(rp.data)
            const videos:Video[] = []

            title = $$("title")
                .first()
                .text()
                .replace(/\\n/g, "")
                .trim()
            const html2 = $$("iframe")
            html2.each((i, elem) => {
                videos.push({ link: elem.attribs.src, label: elem.attribs.src })
            });
            if(videos.length === 0){
                return null
            }
            await prisma.chapter.create({
                data: {
                    title: title,
                    videos: videos as any,
                    link: link,
                    site: new URL(link).origin
                }
            })
        return {
            data: {
                videos: videos
            },
            title: title
        }
    }
    } catch (error) {
        console.log(error)
        return null
    }

}