/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const http = require('http');

http.get('http://localhost:3000/about', (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        fs.writeFileSync('temp_about_content.html', data);
        console.log('Content saved to temp_about_content.html');
    });
}).on('error', (err) => {
    console.error('Error: ' + err.message);
});
