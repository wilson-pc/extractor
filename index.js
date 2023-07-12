// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true })
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const path = require("path")

const axios = require("axios")

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, 'public'),
    constraints: { host: 'example.com' } // optional: default {}
})

// Declare a route
fastify.get('/', function handler(request, reply) {
    return reply.sendFile('index.html')
})
fastify.post('/link', async function handler(request, reply) {
    console.log(request.body)
    /*
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(request.body.link);

    const body = await page.content()
    const $ = cheerio.load(body)
    console.log(body)
    await browser.close();*/

    const { data } = await axios.get(request.body.link)
    const $ = cheerio.load(data)

    const html = $(".eplister a")

    const capitulos = []

    html.each((i, elem) => {
        const elem2 = elem.children[0]
        capitulos.push({ url: elem.attribs.href, title: elem2.children[0].data })
    });
    const full = []
    for (const iterator of capitulos) {
        try {
            const rp = await axios.get(iterator.url)
            const $$ = cheerio.load(rp.data)
            const html2 = $$(".mobius option")
            const videos = []
            html2.each((i, elem) => {

                if (elem.attribs.value) {
                    let buff = new Buffer(elem.attribs.value, 'base64');
                    let text = buff.toString('ascii');

                    const $$$ = cheerio.load(text)

                    const uri = $$$("iframe").first().attr().src


                    if (uri.startsWith("//")) {
                        videos.push({ link: "https:" + uri, label: elem.children[0].data })
                    } else {
                        videos.push({ link: uri, label: elem.children[0].data })
                    }

                } else {

                }

            });

            full.push({ ...iterator, videos: videos })

            await timeout(800);
        } catch (error) {
            console.log(error)
        }

    }

    reply.send({ data: full.reverse() })
})
// Run the server!
fastify.listen({ port: 3333, host: "0.0.0.0" }, (err) => {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
})

