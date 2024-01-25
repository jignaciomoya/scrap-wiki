const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const app = express();

const baseUrl = 'https://es.wikipedia.org/wiki';

app.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${baseUrl}/Categor%C3%ADa:M%C3%BAsicos_de_rap`);
        let titlePage = '';
        let links = [];
        let imgs = [];

        if (response.status === 200) {
            const html = response.data;
            const $ = cheerio.load(html);

            titlePage = $('title').text();

            $('#mw-pages a').each(async (index, element) => {
                const link = $(element).attr('href');
                links.push(link);
                const url2 = `${baseUrl}${link}`;
                const secondResponse = await axios.get(url2);

                if (secondResponse.status === 200) {
                    const secondHtml = secondResponse.data;
                    const second$ = cheerio.load(secondHtml);

                    second$('mw-file-element').each((index, imgElement) => {
                        const img = second$(imgElement).attr('src');
                        imgs.push(img);
                    });
                }
            });
        }

        res.send(`
            <h1>${titlePage}</h1>
            <h2>Links</h2>
            <ul>
                ${links.map(link => `<li><a href=${baseUrl}${link}> ${link}</a></li>`).join('')}
            </ul>
            <h2>Imágenes</h2>
            <ul>
                ${imgs.map(img=> `<li><img src=${baseUrl}${link}${img} alt="Image">${img}</li>`).join('')}
            </ul>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(3000, () => {
    console.log('El servidor está escuchando en el puerto http://localhost:3000');
});
