import axios from 'axios'
import * as cheerio from 'cheerio'
import { prisma } from '../db/prisma'
import { Video } from '../types/video'
import { timeout } from '../utils/timeout'


export async function animexin(link: string) {
  let title = ''

  try {
    const before = await prisma.chapter.findFirst({ where: { link: link } })

    // if exist in db, retur
    if (before) {
      title = before.title

      return {
        data: {
          videos: before.videos
        },
        title: before.title
      }
    } else {
      const rp = await axios.get(link)
      console.log(rp.data)
      const $$ = cheerio.load(rp.data)
      title = $$('title').first().text().replace(/\\n/g, '').trim()

      const html2 = $$('.mobius option')
      const videos: Video[] = []
      html2.each((i, elem) => {
        console.log(elem.attribs)
        if (elem.attribs.value) {
          let buff = Buffer.from(elem.attribs.value, 'base64')
          let text = buff.toString('ascii')

          const $$$ = cheerio.load(text)

          try {
            const uri = $$$('iframe')?.first()?.attr()?.src

            if (uri) {
              if (uri.startsWith('//')) {
                videos.push({
                  link: 'https:' + uri,
                  label: elem.children[0].data
                })
              } else {
                videos.push({ link: uri, label: elem.children[0].data })
              }
            }
          } catch (error) {
            console.log(error)
          }
        } else {
        }
      })

      await prisma.chapter.create({
        data: {
          title: title,
          videos: videos as any,
          link: link,
          site: 'animexin.vip'
        }
      })
      await timeout(500)
      return { data: { videos: videos }, title: title }
    }
  } catch (error) {
    console.log(error)
  }
}
