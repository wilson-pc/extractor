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

const app = new Hono()

app.get('/', async (c) => {
  const file = Bun.file('./public/index.html')
  const html = await file.text()

  return c.html(html)
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

  if (link.includes('mundodonghua') || link.includes('nemonicplayer')) {
    const rs = await mundodonghuaTodo(link, links, salt)
    if (rs) {
      return c.json(rs)
    } else {
      return c.json({ error: 'Not found' }, 500)
    }
  } else if (link.includes('doramedplay')) {
    const rs = await doramedplayTodo(link, links, salt)
    if (rs) {
      return c.json(rs)
    } else {
      return c.json({ error: 'Not found' }, 500)
    }
  } else if (link.includes('lmanime')) {
    const rs = await lmanimeTodo(link, links, salt)
    if (rs) {
      return c.json(rs)
    } else {
      return c.json({ error: 'Not found' }, 500)
    }
  }
})
export default {
  fetch: app.fetch,
  port: process.env.PORT || 3000,
 
}
