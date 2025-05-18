import axios from 'axios'
import * as cheerio from 'cheerio'
import { prisma } from '../db/prisma'
import { Video } from '../types/video'
import { timeout } from '../utils/timeout'
import { connect } from 'puppeteer-real-browser'

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
      const { page, browser } = await connect({
        headless: false,

        args: [],

        customConfig: {},

        turnstile: true,

        connectOption: {},

        disableXvfb: false,
        ignoreAllFlags: false
      })
      try {
        await page.evaluateOnNewDocument(() => {
          window.open = (...args) => {
            console.log('Bloqueado window.open con args:', args)
            return window // devuelve la misma ventana
          }
        })
        await page.goto(link, {
          waitUntil: 'networkidle2'
        })

        await timeout(18000)
      } catch (error) {
        await browser.close()
      }
      const body = await page.content()
      const $$ = cheerio.load(body)

      title = $$('title').first().text().replace(/\\n/g, '').trim()
      const html2 = $$('.ListOptions li')
      const videos = []
      const meta: any[] = []
      html2.each((i, elem) => {
        if (elem.attribs['data-id']) {
          const rp = elem?.children?.find((el) => el.name === 'p').children[0]
            .data

          meta.push({
            key: elem.attribs['data-key'],
            id: elem.attribs['data-id'],
            name: rp
          })
        }
      })
      for (const met of meta) {
        const rp1 = await axios.get(
          `https://donghualife.com/?trembed=${met.key}&trid=${met.id}&trtype=2`
        )

        const $$$ = cheerio.load(rp1.data)

        const uri = $$$('iframe').first()?.attr()?.src

        videos.push({ link: uri, label: met.name })
      }
      await browser.close()
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
