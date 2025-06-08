import axios from 'axios'
import * as cheerio from 'cheerio'
import { prisma } from '../db/prisma'
import { Video } from '../types/video'
import { timeout } from '../utils/timeout'

export async function donghualife(link: string) {
  let title = ''
  try {
    const before = await prisma.chapter.findFirst({ where: { link: link } })

    if (before) {
      title = before.title
      return {
        data: {
          videos: before.videos.map((vid: any) => {
            return JSON.parse(vid) as Video // TOD
          })
        },
        title: before.title
      }
    } else {
      
      const {data} = await axios.get(link)

      const $$ = cheerio.load(data)

      title = $$('title').first().text().replace(/\\n/g, '').trim()
      const html2 = $$('.embed-links li a')
      const videos:{link:string,label:string}[] = []
      html2.each((i, elem) => {
        if (elem.attribs['data-video']) {
          const rp = elem.attribs['data-video'].replace(/\\n/g, '').trim()
          const name = elem.attribs['title'].replace(/\\n/g, '').trim()

           videos.push({ link: rp, label:name})
        }
      })

      
      if (videos.length === 0) {
        return null
      }
      await prisma.chapter.create({
        data: {
          title: title,
          videos: videos,
          link: link,
          site: 'donghualife.com'
        }
      })
      await timeout(400)
      return { data: { videos: videos }, title: title }
    }
  } catch (error) {
    console.log(error)
  }
}
