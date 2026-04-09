const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: './.env.local' });
dotenv.config({ path: './.env' });

const apiKey = process.env.GEMINI_API_KEY;

const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

fetch(apiUrl)
.then(r => r.json())
.then(d => {
    if (d.models) {
        console.log("AVAILABLE MODELS:");
        d.models.forEach(m => console.log(m.name, m.supportedGenerationMethods?.join(',')));
    } else {
        console.log(d);
    }
})
.catch(console.error);
