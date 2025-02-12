// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true })
const { launch } = require('puppeteer');
const cheerio = require('cheerio');
const path = require("path")
const { PrismaClient } = require("@prisma/client")


const prisma = new PrismaClient()
const axios = require("axios");
const { link } = require('fs');

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

fastify.post('/chapter', async function handler(request, reply) {
    console.log(request.body)
    /*
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(request.body.link);

    const body = await page.content()
    const $ = cheerio.load(body)
    console.log(body)
    await browser.close();*/

    let full = {}
    let title = ""

    if (request.body.link.includes("animexin")) {




        try {
            const before = await prisma.chapter.findFirst({ where: { link: request.body.link } })

            if (before) {
                full = { videos: before.videos }
                title = before.title
            } else {
                const rp = await axios.get(request.body.link)

                const $$ = cheerio.load(rp.data)
                title = $$("title")
                    .first()
                    .text()
                    .replace(/\\n/g, "")
                    .trim()
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

                full = { videos: videos }
                await prisma.chapter.create({
                    data: {
                        title: title,
                        videos: videos,
                        link: request.body.link,
                        site: 'animexin.vip'
                    }
                })
                await timeout(500);
            }
        } catch (error) {
            console.log(error)
        }


    } else if (request.body.link.includes("luciferdonghua")) {




        try {
            const before = await prisma.chapter.findFirst({ where: { link: request.body.link } })

            if (before) {
                full = { videos: before.videos }
                title = before.title
            } else {
                const rp = await axios.get(request.body.link)

                const $$ = cheerio.load(rp.data)
                title = $$("title")
                    .first()
                    .text()
                    .replace(/\\n/g, "")
                    .trim()
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

                full = { videos: videos }
                await prisma.chapter.create({
                    data: {
                        title: title,
                        videos: videos,
                        link: request.body.link,
                        site: 'luciferdonghua.org'
                    }
                })
                await timeout(500);
            }
        } catch (error) {
            console.log(error)
        }


    } else if (request.body.link.includes("lmanime")) {




        try {
            const before = await prisma.chapter.findFirst({ where: { link: request.body.link } })

            if (before) {
                full = { videos: before.videos }
                title = before.title
            } else {
                const rp = await axios.get(request.body.link)

                const $$ = cheerio.load(rp.data)
                title = $$("title")
                    .first()
                    .text()
                    .replace(/\\n/g, "")
                    .trim()
                const html2 = $$(".mobius option")
                const videos = []
                const tempLinks = []
                html2.each((i, elem) => {

                    if (elem.attribs.value) {
                        tempLinks.push({ link: elem.attribs.value, label: elem.children[0].data })
                    } else {

                    }

                });

                for (const element of tempLinks) {
                    const rpp = await axios.get(element.link)

                    const $t = cheerio.load(rpp.data)
                    const linkf = $t("iframe").first().attr().src
                    if (linkf.startsWith("//")) {
                        videos.push({ link: "https:" + linkf, label: element.label })
                    } else {
                        videos.push({ link: linkf, label: element.label })
                    }
                }

                full = { videos: videos }
                await prisma.chapter.create({
                    data: {
                        title: title,
                        videos: videos,
                        link: request.body.link,
                        site: 'lmanime.com'
                    }
                })
                await timeout(500);
            }
        } catch (error) {
            console.log(error)
        }


    } else if (request.body.link.includes("donghualife")) {


        try {
            const before = await prisma.chapter.findFirst({ where: { link: request.body.link } })

            if (before) {
                full = { videos: before.videos }
                title = before.title
            } else {
                const rp = await axios.get(request.body.link)
                const $$ = cheerio.load(rp.data)
                title = $$("title")
                    .first()
                    .text()
                    .replace(/\\n/g, "")
                    .trim()
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

                full = { videos: videos }
                await prisma.chapter.create({
                    data: {
                        title: title,
                        videos: videos,
                        link: request.body.link,
                        site: 'donghualife.com'
                    }
                })
                await timeout(400);
            }
        } catch (error) {
            console.log(error)
        }


    } else if (request.body.link.includes("mundodonghua") || request.body.link.includes("nemonicplayer")) {

        try {
            const before = await prisma.chapter.findFirst({ where: { link: request.body.link } })

            if (before) {
                full = { videos: before.videos }
                title = before.title
            } else {
                const browser = await launch({
                    headless: true
                });
                const page = await browser.newPage();
                await page.setDefaultNavigationTimeout(0);
                await page.goto(request.body.link, {
                    waitUntil: "networkidle0",
                });

                browser.on('targetcreated', async (target) => {
                    if (target.type() === 'page') {
                      const newPage = await target.page();
                      if (newPage) {
                        console.log('Nueva pestaña abierta, cerrando...');
                        await newPage.close();
                      }
                    }
                  });
                await page.waitForSelector('#tamamoplay')
                const productType = await page.$('#creative_iframe');
                if (productType) {
                    // El elemento existe, puedes hacer algo con su contenido
                    await page.$eval('#creative_iframe', el => el.remove());
                }
                await page.click('#tamamoplay')
                await page.waitForSelector('#tamamo_player');

                await timeout(7000)
                const body = await page.content();
                const $$ = cheerio.load(body);
                const html2 = $$("ul[class='nav nav-tabs'] li")

                title = $$("title")
                    .first()
                    .text()
                    .replace(/\\n/g, "")
                    .trim()

                const videos = []

                let firstUrl = $$("#tamamo_player").first().attr().src
                let selector = "#tamamo_player"

                if (!firstUrl) {
                    firstUrl = $$("#tamamo_tab").first().attr().src
                    selector = "#tamamo_tab"
                }

                let frameHandle = await page.$(selector); // Selector del iframe

                let frame = await frameHandle.contentFrame(); // Acceder al frame

             

                if (!frame) {
                    try {
                        await page.click('#tamamoplay')
                        await timeout(2000)
                        frameHandle = await page.$(selector);
                        frame = await frameHandle.contentFrame();
                    } catch (error) {

                    }
                }

                if (!frame) {
                    try {
                        await page.click('#tamamoplay')
                        await timeout(2000)
                        frameHandle = await page.$(selector);
                        frame = await frameHandle.contentFrame();
                    } catch (error) {

                    }
                }

                if (!frame) {
                    try {
                        await page.click('#tamamoplay')
                        await timeout(2000)
                        frameHandle = await page.$(selector);
                        frame = await frameHandle.contentFrame();
                    } catch (error) {

                    }
                }

                if (!frame) {
                    try {
                        await page.click('#tamamoplay')
                        await timeout(2000)
                        frameHandle = await page.$(selector);
                        frame = await frameHandle.contentFrame();
                    } catch (error) {

                    }
                }

                if (!frame) {
                    try {
                        await page.click('#tamamoplay')
                        await timeout(2000)
                        frameHandle = await page.$(selector);
                        frame = await frameHandle.contentFrame();
                    } catch (error) {

                    }
                }

                if (!frame) {
                    try {
                        await page.click('#tamamoplay')
                        await timeout(2000)
                        frameHandle = await page.$(selector);
                        frame = await frameHandle.contentFrame();
                    } catch (error) {

                    }
                }
                const dewe =cheerio.load(await page.content())
                let framesss= dewe("#tamamo_player").attr()
                
                    if(framesss?.src.includes("mdnemonicplayer")){
                        await page.goto(framesss.src, {
                            waitUntil: "networkidle0",
                        });
                     await page.waitForSelector('#player')
                     const dfs= await page.content()
                        const $t = cheerio.load(dfs)
                        framesss=$t("iframe").first().attr()

                      
                    }
                const firstUrl2 = framesss.src


                videos[0] = { link: firstUrl2, label: "tamamo_player" }
                html2.each((i, elem) => {
                    console.log(elem.attribs)
                    videos.push({ link: request.body.link, label: elem.attribs.id })
                });
                full = { videos: videos }
                await page.close()




                await browser.close();
                await prisma.chapter.create({
                    data: {
                        title: title,
                        videos: videos,
                        link: request.body.link,
                        site: 'www.mundodonghua.com'
                    }
                })
            }
        } catch (error) {
            console.log(error)
        }
    } else {
        try {
            const before = await prisma.chapter.findFirst({ where: { link: request.body.link } })

            if (before) {
                full = { videos: before.videos }
                title = before.title
            } else {
                const rp = await axios.get(request.body.link)
                const $$ = cheerio.load(rp.data)
                const videos = []

                title = $$("title")
                    .first()
                    .text()
                    .replace(/\\n/g, "")
                    .trim()
                const html2 = $$("iframe")
                html2.each((i, elem) => {
                    videos.push({ link: elem.attribs.src, label: elem.attribs.src })
                });
                full = { videos: videos }
                await prisma.chapter.create({
                    data: {
                        title: title,
                        videos: videos,
                        link: request.body.link,
                        site: new URL(request.body.link).origin
                    }
                })

            }
        } catch (error) {

        }

    }

    reply.send({ data: full, title })
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
    const salt = request.body.salt ?? 0
    const links = request.body.links ?? false
    let full = []
    let title = ""
    if (request.body.link.includes("animexin")) {
        const { data } = await axios.get(request.body.link)
        const $ = cheerio.load(data)

        const html = $(".eplister a")
        title = $("title")
            .first()
            .text()
            .replace(/\\n/g, "")
            .trim()

        const capitulos = []

        html.each((i, elem) => {
            //  console.log(elem.children[0])
            const elem2 = cheerio.load(elem)
            const title = elem2(".epl-title").first().text()
            capitulos.push({ url: elem.attribs.href, title: title })
        });
        if (!links) {
            for (const iterator of capitulos.slice(salt)) {
                try {
                    let videos = []
                    const before = await prisma.chapter.findFirst({ where: { link: iterator.url } })

                    let cpTitle = ""
                    if (before) {
                        videos = before.videos
                        cpTitle = before.title

                        full.push({ ...iterator, videos: videos })
                    } else {


                        const rp = await axios.get(iterator.url)
                        const $$ = cheerio.load(rp.data)
                        const html2 = $$(".mobius option")
                        cpTitle = $$("title")
                            .first()
                            .text()
                            .replace(/\\n/g, "")
                            .trim()
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
                        await prisma.chapter.create({
                            data: {
                                title: cpTitle,
                                videos: videos,
                                link: iterator.url,
                                site: 'animexin.vip'
                            }
                        })
                        await timeout(500);
                    }
                } catch (error) {
                    console.log(error)
                }

            }
        } else {
            full = capitulos.reverse()
        }
    } else if (request.body.link.includes("donghualife")) {

        const { data } = await axios.get(request.body.link)
        const $ = cheerio.load(data)
        title = $("title")
            .first()
            .text()
            .replace(/\\n/g, "")
            .trim()
        const html = $(".Viewed .MvTbTtl a")

        const capitulos = []

        html.each((i, elem) => {

            capitulos.push({ url: elem.attribs.href, title: elem.children[0].data })
        });
        if (!links) {
            for (const iterator of capitulos.slice(salt)) {
                try {
                    let videos = []
                    const before = await prisma.chapter.findFirst({ where: { link: iterator.url } })
                    let cpTitle = ""
                    if (before) {
                        videos = before.videos
                        cpTitle = before.title

                        full.push({ ...iterator, videos: videos })
                    } else {


                        const rp = await axios.get(iterator.url)
                        const $$ = cheerio.load(rp.data)
                        const html2 = $$(".ListOptions li")
                        cpTitle = $$("title")
                            .first()
                            .text()
                            .replace(/\\n/g, "")
                            .trim()
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
                        await prisma.chapter.create({
                            data: {
                                title: cpTitle,
                                videos: videos,
                                link: iterator.url,
                                site: 'donghualife.com'
                            }
                        })
                        await timeout(400);
                    }
                } catch (error) {
                    console.log(error)
                }

            }
        } else {
            full = capitulos
        }
    } else if (request.body.link.includes("mundodonghua")) {
        const { data } = await axios.get(request.body.link)
        const $ = cheerio.load(data)
        title = $("title")
            .first()
            .text()
            .replace(/\\n/g, "")
            .trim()
        const html = $(".donghua-list a")

        const capitulos = []

        html.each((i, elem) => {
            const $$ = cheerio.load(elem)
            if (elem.attribs?.href?.includes("mundodonghua.com")) {
                capitulos.push({
                    url:
                        elem.attribs.href, title: $$('blockquote').first().text()
                })
            } else {

                if (elem.attribs.href.includes('https:')) {
                    capitulos.push({ url: elem.attribs.href, title: $$('blockquote').first().text() })
                } else {
                    capitulos.push({ url: "https://www.mundodonghua.com" + elem.attribs.href, title: $$('blockquote').first().text() })
                }
            }
        });
        if (!links) {
            const browser = await launch({
                headless: true
            });
            for (const iterator of capitulos.reverse().slice(salt)) {
                try {
                    let videos = []
                    const before = await prisma.chapter.findFirst({ where: { link: iterator.url } })
                    let cpTitle = ""
                    if (before) {
                        videos = before.videos
                        cpTitle = before.title

                        full.push({ ...iterator, videos: videos })
                    } else {


                        const page = await browser.newPage();
                        await page.setDefaultNavigationTimeout(0);
                        console.log(iterator.url)
                        await page.goto(iterator.url, {
                            waitUntil: "networkidle2",
                        });
                        console.log(iterator.url)
                        if (iterator.url.includes("mundodonghua")) {
                            try {
                                await page.waitForSelector('#tamamoplay')
                                const productType = await page.$('#creative_iframe');
                                if (productType) {
                                    // El elemento existe, puedes hacer algo con su contenido
                                    await page.$eval('#creative_iframe', el => el.remove());
                                }
                                await page.click('#tamamoplay')
                                await page.waitForSelector('#tamamo_player');
                            } catch (error) {
                                console.log(iterator.url,)
                            }
                        }
                        await timeout(7000)

                        const body = await page.content();

                        const $$ = cheerio.load(body);
                        const html2 = $$("ul[class='nav nav-tabs'] li")
                        cpTitle = $$("title")
                            .first()
                            .text()
                            .replace(/\\n/g, "")
                            .trim()
                        let firstUrl = $$("#tamamo_player").first().attr().src
                        let selector = "#tamamo_player"

                        if (!firstUrl) {
                            firstUrl = $$("#tamamo_tab").first().attr().src
                            selector = "#tamamo_tab"
                        }

                        let frameHandle = await page.$(selector); // Selector del iframe

                        let frame = await frameHandle.contentFrame(); // Acceder al frame
        
                     
        
                        if (!frame) {
                            try {
                                await page.click('#tamamoplay')
                                await timeout(2000)
                                frameHandle = await page.$(selector);
                                frame = await frameHandle.contentFrame();
                            } catch (error) {
        
                            }
                        }
        
                        if (!frame) {
                            try {
                                await page.click('#tamamoplay')
                                await timeout(2000)
                                frameHandle = await page.$(selector);
                                frame = await frameHandle.contentFrame();
                            } catch (error) {
        
                            }
                        }
        
                        if (!frame) {
                            try {
                                await page.click('#tamamoplay')
                                await timeout(2000)
                                frameHandle = await page.$(selector);
                                frame = await frameHandle.contentFrame();
                            } catch (error) {
        
                            }
                        }
        
                        if (!frame) {
                            try {
                                await page.click('#tamamoplay')
                                await timeout(2000)
                                frameHandle = await page.$(selector);
                                frame = await frameHandle.contentFrame();
                            } catch (error) {
        
                            }
                        }
        
                        if (!frame) {
                            try {
                                await page.click('#tamamoplay')
                                await timeout(2000)
                                frameHandle = await page.$(selector);
                                frame = await frameHandle.contentFrame();
                            } catch (error) {
        
                            }
                        }
        
                        if (!frame) {
                            try {
                                await page.click('#tamamoplay')
                                await timeout(2000)
                                frameHandle = await page.$(selector);
                                frame = await frameHandle.contentFrame();
                            } catch (error) {
        
                            }
                        }
                        const dewe =cheerio.load(await page.content())
                        let framesss= dewe("#tamamo_player").attr()
                        
                            if(framesss?.src.includes("mdnemonicplayer")){
                                await page.goto(framesss.src, {
                                    waitUntil: "networkidle0",
                                });
                             await page.waitForSelector('#player')
                             const dfs= await page.content()
                                const $t = cheerio.load(dfs)
                                framesss=$t("iframe").first().attr()
        
                              
                            }
                        const firstUrl2 = framesss.src
        

                        videos[0] = { link: firstUrl2, label: "tamamo_player" }
                        html2.each((i, elem) => {
                            console.log(elem.attribs)
                            videos.push({ link: iterator.url, label: elem.attribs.id })
                        });
                        full.push({ ...iterator, videos: videos })
                        await prisma.chapter.create({
                            data: {
                                title: cpTitle,
                                videos: videos,
                                link: iterator.url,
                                site: 'www.mundodonghua.com'
                            }
                        })
                        await page.close()
                    }
                } catch (error) {
                    console.log(error)
                }

            }
            await browser.close();
        } else {
            full = capitulos.reverse()
        }
    } else if (request.body.link.includes("doramedplay")) {

        const { data } = await axios.get(request.body.link)
        const $ = cheerio.load(data)
        title = $("title")
            .first()
            .text()
            .replace(/\\n/g, "")
            .trim()
        const html = $("#serie_contenido .episodiotitle a")

        const capitulos = []

        html.each((i, elem) => {

            capitulos.push({ url: elem.attribs.href, title: elem.children[0].data })
        });
        if (!links) {
            for (const iterator of capitulos.slice(salt)) {
                try {
                    let videos = []
                    const before = await prisma.chapter.findFirst({ where: { link: iterator.url } })
                    let cpTitle = ""
                    if (before) {
                        videos = before.videos
                        cpTitle = before.title

                        full.push({ ...iterator, videos: videos })
                    } else {


                        const rp = await axios.get(iterator.url)
                        const $$ = cheerio.load(rp.data)
                        const videos = []

                        title = $$("title")
                            .first()
                            .text()
                            .replace(/\\n/g, "")
                            .trim()
                        const html2 = $$("iframe")
                        html2.each((i, elem) => {
                            videos.push({ link: elem.attribs.src, label: elem.attribs.src })
                        });
                        full.push({ ...iterator, videos: videos })
                        await prisma.chapter.create({
                            data: {
                                title: title,
                                videos: videos,
                                link: request.body.link,
                                site: new URL(request.body.link).origin
                            }
                        })
                        await timeout(400);
                    }
                } catch (error) {
                    console.log(error)
                }

            }
        } else {
            full = capitulos
        }
    }
    reply.send({ data: full, title })
})
// Run the server!
fastify.listen({ port: 3333, host: "0.0.0.0" }, (err) => {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
})

