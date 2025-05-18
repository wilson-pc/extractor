import { launch } from 'puppeteer-core'
import * as cheerio from 'cheerio'
import { prisma } from '../db/prisma'
import { Video } from '../types/video'
import { timeout } from '../utils/timeout'
const browserPath =
  process.platform === 'win32'
    ? 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe'
    : process.platform === 'darwin'
    ? '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'
    : '/usr/bin/brave-browser'

export async function mundodonghua(link: string) {
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
      const browser = await launch({
        headless: true,
        args: ['--no-sandbox'],
        executablePath: browserPath
      })
      const page = await browser.newPage()
      browser.on('targetcreated', async (target) => {
        try {
          const newPage = await target.page()
          if (newPage) {
            const url = newPage.url()
            if (url === 'about:blank' || target.type() === 'page') {
              console.log('Nueva pestaña detectada (about:blank), cerrando...')
              await timeout(100) // Pequeño retraso para asegurar que la pestaña esté lista
              await newPage.close()
            }
          }
        } catch (error) {
          console.error('Error al cerrar pestaña:', error)
        }
      })
      await page.evaluateOnNewDocument(() => {
        window.open = (...args) => {
          console.log('Bloqueado window.open con args:', args);
          return window;  // devuelve la misma ventana
        };
      });
      await page.setDefaultNavigationTimeout(0)
      await page.goto(link, {
        waitUntil: 'networkidle0'
      })


      await page.waitForSelector('#tamamoplay')
      const productType = await page.$('#creative_iframe')
      if (productType) {
        // El elemento existe, puedes hacer algo con su contenido
        await page.$eval('#creative_iframe', (el) => el.remove())
      }
      await page.click('#tamamoplay')
      await page.waitForSelector('#tamamo_player')

      await timeout(7000)
      const body = await page.content()
      const $$ = cheerio.load(body)
      const html2 = $$("ul[class='nav nav-tabs'] li")

      title = $$('title').first().text().replace(/\\n/g, '').trim()

      const videos = []

      let firstUrl = $$('#tamamo_player')?.first()?.attr()?.src
      let selector = '#tamamo_player'

      if (!firstUrl) {
        firstUrl = $$('#tamamo_tab')?.first()?.attr()?.src
        selector = '#tamamo_tab'
      }

      let frameHandle = await page.$(selector) // Selector del iframe

      let frame = await frameHandle?.contentFrame() // Acceder al frame

      if (!frame) {
        try {
          await page.click('#tamamoplay')
          await timeout(2000)
          frameHandle = await page.$(selector)
          frame = await frameHandle?.contentFrame()
        } catch (error) {}
      }

      if (!frame) {
        try {
          await page.click('#tamamoplay')
          await timeout(2000)
          frameHandle = await page.$(selector)
          frame = await frameHandle?.contentFrame()
        } catch (error) {}
      }

      if (!frame) {
        try {
          await page.click('#tamamoplay')
          await timeout(2000)
          frameHandle = await page.$(selector)
          frame = await frameHandle?.contentFrame()
        } catch (error) {}
      }

      if (!frame) {
        try {
          await page.click('#tamamoplay')
          await timeout(2000)
          frameHandle = await page.$(selector)
          frame = await frameHandle?.contentFrame()
        } catch (error) {}
      }

      if (!frame) {
        try {
          await page.click('#tamamoplay')
          await timeout(2000)
          frameHandle = await page.$(selector)
          frame = await frameHandle?.contentFrame()
        } catch (error) {}
      }

      if (!frame) {
        try {
          await page.click('#tamamoplay')
          await timeout(2000)
          frameHandle = await page.$(selector)
          frame = await frameHandle?.contentFrame()
        } catch (error) {}
      }
      const dewe = cheerio.load(await page.content())
      let framesss = dewe('#tamamo_player').attr()

      if (framesss?.src.includes('mdnemonicplayer')) {
        await page.goto(framesss.src, {
          waitUntil: 'networkidle0'
        })
        await page.waitForSelector('#player')
        const dfs = await page.content()
        const $t = cheerio.load(dfs)
        framesss = $t('iframe').first().attr()
      }
      const firstUrl2 = framesss?.src

      videos[0] = { link: firstUrl2, label: 'tamamo_player' }
      html2.each((i, elem) => {
        console.log(elem.attribs)
        videos.push({ link: link, label: elem.attribs.id })
      })

      await page.close()

      await browser.close()
      if (videos.length > 0) {
        await prisma.chapter.create({
          data: {
            title: title,
            videos: videos,
            link: link,
            site: 'www.mundodonghua.com'
          }
        })
      }
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
