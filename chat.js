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
if (files.length <= 0){
    console.log('no imgs in meme folder')
    return;
}

function getTime(targetHour){
    const now = new Date();
    const then = new Date(now);
    then.setHours(targetHour, 0, 0, 0);
    if (now.getTime() > then.getTime()){
        then.setDate(now.getDate()+1);
    }
    return then.getTime() - now.getTime();
}

function getMeme(){
    const randomFile = files[Math.floor(Math.random()*files.length)];
    const meme_path = path.join(meme_dir, randomFile);
    const img = MessageMedia.fromFilePath(meme_path);
    return img;
}

function reminder(time){
    setTimeout(()=>{
        const sent_to_id = '120363171196259711@g.us';
        const message = `Don't forget to complete today's job search routine!`;
        client.sendMessage(sent_to_id, message);
        client.sendMessage(sent_to_id, getMeme());
        reminder(time)
    }, getTime(time))
}





client.on('ready', () => {
    console.log('Client is ready!');
    reminder(9);
});

client.initialize();

client.on('message', message => {
    
    console.log('------------------')
    console.log(message.from);
    console.log(message.body);
    console.log('------------------')

    if(message.body.toLowerCase() === 'ping') {
		message.reply('pong');
	}

    if(message.body.toLowerCase() === 'meme'){
        message.reply(getMeme());
    }
    
});

// client.on('message_create', async (msg) => {
//     console.log(msg);
// })
// grace: '886979928343@c.us'