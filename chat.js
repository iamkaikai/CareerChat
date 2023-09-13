const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const { dir } = require('console');
const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});


const meme_dir = './meme'
const files = fs.readdirSync(meme_dir).filter(f => f !== '.DS_Store');
console.log(files)
if (files.length <= 0){
    console.log('no imgs in meme folder')
    return;
}

client.on('ready', () => {
    console.log('Client is ready!');
    const sent_to_id = '19193570536@c.us';
    const message = 'test message from bot!!';
    client.sendMessage(sent_to_id, message);
});

client.initialize();

client.on('message', message => {
    
    console.log('------------------')
    console.log(message.from);
    console.log(message.body);
    console.log('------------------')

    if(message.body === 'ping') {
        console.log('receive ping')
		message.reply('pong');
	}

    if(message.body.toLowerCase() === 'meme'){
        const randomFile = files[Math.floor(Math.random()*files.length)];
        const meme_path = path.join(meme_dir, randomFile);
        const img = MessageMedia.fromFilePath(meme_path)
        message.reply(img);
    }
    
});

// client.on('message_create', async (msg) => {
//     console.log(msg);
// })

// author: '19193570536@c.us'
// grace: '886979928343@c.us'