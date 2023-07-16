// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true })
const { launch } = require('puppeteer');
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

    const full = []

    if (request.body.link.includes("animexin")) {
        const { data } = await axios.get(request.body.link)
        const $ = cheerio.load(data)

        const html = $(".eplister a")

        const capitulos = []

        html.each((i, elem) => {
            const elem2 = elem.children[0]
            capitulos.push({ url: elem.attribs.href, title: elem2.children[0].data })
        });
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

                        try {
                            const uri = $$$("iframe").first().attr().src


                            if (uri.startsWith("//")) {
                                videos.push({ link: "https:" + uri, label: elem.children[0].data })
                            } else {
                                videos.push({ link: uri, label: elem.children[0].data })
                            }

                        } catch (error) {
                            console.log(error)
                        }
                    } else {

                    }

                });

                full.push({ ...iterator, videos: videos })

                await timeout(500);
            } catch (error) {
                console.log(error)
            }

        }
    } else if (request.body.link.includes("donghualife")) {
        const { data } = await axios.get(request.body.link)
        const $ = cheerio.load(data)

        const html = $(".Viewed .MvTbTtl a")

        const capitulos = []

        html.each((i, elem) => {

            capitulos.push({ url: elem.attribs.href, title: elem.children[0].data })
        });

        for (const iterator of capitulos) {
            try {
                const rp = await axios.get(iterator.url)
                const $$ = cheerio.load(rp.data)
                const html2 = $$(".ListOptions li")
                const videos = []
                const meta = []
                html2.each((i, elem) => {

                    if (elem.attribs['data-id']) {

                        const rp = elem.children.find((el) => el.name === "p").children[0].data


                        meta.push({ key: elem.attribs['data-key'], id: elem.attribs['data-id'], name: rp })


                    }

                });
                for (const met of meta) {
                    const rp1 = await axios.get(`https://donghualife.com/?trembed=${met.key}&trid=${met.id}&trtype=2`)


                    const $$$ = cheerio.load(rp1.data)

                    const uri = $$$("iframe").first().attr().src

                    videos.push({ link: uri, label: met.name })
                }

                full.push({ ...iterator, videos: videos })

                await timeout(400);
            } catch (error) {
                console.log(error)
            }

        }
    } else if (request.body.link.includes("mundodonghua")) {
        const { data } = await axios.get(request.body.link)
        const $ = cheerio.load(data)

        const html = $(".donghua-list a")

        const capitulos = []

        html.each((i, elem) => {
            const $$ = cheerio.load(elem)
            capitulos.push({ url: "https://www.mundodonghua.com" + elem.attribs.href, title: $$('blockquote').first().text() })
        });
        const browser = await launch({

        });
        for (const iterator of capitulos.reverse()) {
            try {

                const page = await browser.newPage();
                await page.setDefaultNavigationTimeout(0);
                await page.goto(iterator.url, {
                    waitUntil: "load",
                });
                const body = await page.content();

                const $$ = cheerio.load(body);
                const html2 = $$("ul[class='nav nav-tabs'] li")

                const videos = []

                const firstUrl = $$("#tamamo_player").first().attr().src
                console.log(firstUrl)

                await page.goto(firstUrl, {
                    waitUntil: "domcontentloaded",
                });
                const body2 = await page.content();

                const $$2 = cheerio.load(body2);
                const firstUrl2 = $$2("#player").first().attr().src
                console.log(firstUrl2)

                videos[0] = { link: firstUrl2, label: "tamamo_player" }
                html2.each((i, elem) => {
                    console.log(elem.attribs)
                    videos.push({ link: iterator.url, label: elem.attribs.id })
                });
                full.push({ ...iterator, videos: videos })
                await page.close()

            } catch (error) {
                console.log(error)
            }

        }
        await browser.close();
    }
    reply.send({ data: full })
})
// Run the server!
fastify.listen({ port: 3333, host: "0.0.0.0" }, (err) => {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
})

