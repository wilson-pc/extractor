import axios from 'axios'
import * as cheerio from 'cheerio'
import { prisma } from '../db/prisma'
import { Video } from '../types/video'
import { timeout } from '../utils/timeout'
import { Link } from '../types'
import { animexin } from '../sites/animexin'
import { donghualife } from '../sites/donghualife'

export async function donghualifeTodo(
  link: string,
  links: boolean,
  salt: number
) {
  let title = ''
  const capitulos: Link[] = []
  let full: any[] = []
  const { data } = await axios.get(link)
  const $ = cheerio.load(data)

  const html = $('.view-content tbody a')
  title = $('.titulo h2 a').first().text().replace(/\\n/g, '').trim()

  html.each((i, elem) => {
    //  console.log(elem.children[0])
    const urld= elem.attribs.href
    const tittle=elem.children[0].data
    capitulos.push({ url:"https://donghualife.com"+urld, title: tittle })
  })
  if (!links) {
    for (const iterator of capitulos.reverse().slice(salt)) {
      try {
        let videos = []
        const before = await prisma.chapter.findFirst({
          where: { link: iterator.url }
        })

        if (before) {
          videos = before.videos

          full.push({
            ...iterator,
            videos: videos
          })
        } else {
          const capt = await donghualife(iterator.url)

          if (capt) {
            full.push({ ...iterator, videos: capt.data.videos })
          }
        }
      } catch (error) {
        console.log(error)
      }
    }
  } else {
    full = capitulos.reverse()
  }
  return {
    data: full,
    title: title
  }
}
