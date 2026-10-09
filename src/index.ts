import { Hono } from 'hono'
import { animexin } from './sites/animexin'
import { mundodonghua } from './sites/mundodonghua'
import { luciferdonghua } from './sites/luciferdonghua'
import { lmanime } from './sites/lmanime'
import { others } from './sites/others'
import { mundodonghuaTodo } from './todo/mundodonghua'
import { doramedplayTodo } from './todo/doramedplay'
import { lmanimeTodo } from './todo/lmanime'
import { donghualife } from './sites/donghualife'
import { donghualifeTodo } from './todo/donghualife'
import type { Video } from './types/video'

const app = new Hono()

type LinkResult = {
  data: Array<{
    url: string
    title: string
    videos?: Video[]
  }>
  title: string
}

async function getLinkResult(
  link: string,
  links: boolean,
  salt: number
): Promise<LinkResult | undefined> {
  if (link.includes('mundodonghua') || link.includes('nemonicplayer')) {
    return mundodonghuaTodo(link, links, salt)
  } else if (link.includes('doramedplay')) {
    return doramedplayTodo(link, links, salt)
  } else if (link.includes('lmanime')) {
    return lmanimeTodo(link, links, salt)
  } else if (link.includes('donghualife')) {
    return donghualifeTodo(link, links, salt)
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }
    return entities[character]
  })
}

function escapeHref(value: string) {
  try {
    const parsedUrl = new URL(value, 'https://placeholder.invalid')
    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
      return escapeHtml(value)
    }
  } catch {
    return '#'
  }
  return '#'
}

function renderLinkResult({ data, title }: LinkResult) {
  const chapters = data.map((chapter) => {
    const chapterTitle = escapeHtml(chapter.title)
    const chapterUrl = escapeHref(chapter.url)
    const videos = (chapter.videos ?? [])
      .map(
        (video) =>
          `<li><a href="${escapeHref(video.link)}" rel="noopener noreferrer">${escapeHtml(video.label)}</a></li>`
      )
      .join('')

    return `<article><h2><a href="${chapterUrl}" rel="noopener noreferrer">${chapterTitle}</a></h2><ul>${videos}</ul></article>`
  }).join('\n')

  const safeTitle = escapeHtml(title)
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${safeTitle}</title>
    <style>
      body { font-family: sans-serif; line-height: 1.5; margin: 2rem auto; max-width: 50rem; padding: 0 1rem; }
      article { border-bottom: 1px solid #ccc; padding: 1rem 0; }
      ul { display: flex; flex-wrap: wrap; gap: 1rem; list-style: none; padding: 0; }
    </style>
  </head>
  <body>
    <h1>${safeTitle}</h1>
    ${chapters}
  </body>
</html>`
}

app.get('/', async (c) => {
  const file = Bun.file('./public/index.html')
  const html = await file.text()

  return c.html(html)
})

app.get('/link', async (c) => {
  const link = c.req.query('url') ?? c.req.query('link')
  if (!link) {
    return c.text('Query parameter "url" is required', 400)
  }

  let parsedLink: URL
  try {
    parsedLink = new URL(link)
  } catch {
    return c.text('Query parameter "url" must be a valid URL', 400)
  }

  if (parsedLink.protocol !== 'http:' && parsedLink.protocol !== 'https:') {
    return c.text('URL must use HTTP or HTTPS', 400)
  }

  const result = await getLinkResult(link, false, 0)
  if (!result) {
    return c.text('Unsupported link', 400)
  }

  return c.html(renderLinkResult(result))
})

app.post('/chapter', async (c) => {
  const body = await c.req.json()
  if (body.link.includes('animexin')) {
    const rs = await animexin(body.link)
    console.log(rs)
    if (rs) {
      return c.json(rs)
    } else {
      return c.json({ error: 'Not found' }, 500)
    }
  } else if (
    body.link.includes('mundodonghua') ||
    body.link.includes('nemonicplayer')
  ) {
    const rs = await mundodonghua(body.link)
    if (rs) {
      return c.json(rs)
    } else {
      return c.json({ error: 'Not found' }, 500)
    }
  } else if (body.link.includes('luciferdonghua')) {
    const rs = await luciferdonghua(body.link)
    if (rs) {
      return c.json(rs)
    } else {
      return c.json({ error: 'Not found' }, 500)
    }
  } else if (body.link.includes('lmanime')) {
    const rs = await lmanime(body.link)
    if (rs) {
      return c.json(rs)
    } else {
      return c.json({ error: 'Not found' }, 500)
    }
  } else if (body.link.includes('donghualife')) {
    const rs = await donghualife(body.link)
    if (rs) {
      return c.json(rs)
    } else {
      return c.json({ error: 'Not found' }, 500)
    }
  } else {
    const rs = await others(body.link)
    if (rs) {
      return c.json(rs)
    } else {
      return c.json({ error: 'Not found' }, 500)
    }
  }
})
app.post('/link', async (c) => {
  const body = await c.req.json()
  console.log(body)
  const salt = body.salt ?? 0
  const link = body.link

  const links = body.links ?? false
  const rs = await getLinkResult(link, links, salt)
  if (rs) {
    return c.json(rs)
  } else {
    return c.json({ error: 'Not found' }, 500)
  }
})
export default {
  fetch: app.fetch,
  port: process.env.PORT || 3000
}
