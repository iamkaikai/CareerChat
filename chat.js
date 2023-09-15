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

function reminder(time, day){
    setTimeout(()=>{
        const sent_to_id = '120363171196259711@g.us';
        let message;
        if (day === 'morning'){
            message = `Rise and grind, squad! 💪Let's secure that bag! 🎒 Remember to slide through those job apps today. 🚀 #HustleModeOn`;
        }else if(day === 'Soo'){
            message = `Hey Soo! Time to rise, shine, and grind! 💪 Let's conquer those job apps today and move one step closer to our dreams. 🚀 Don't let the hustle fade. #SooGotThis 💼🎒`;
        }else{
            message = `Yo, evening check-in! 🌆 Still got that job search grind to hit or what? Don't let the dream job ghost ya. 💼 #SecureTheBag`;
        }
        client.sendMessage(sent_to_id, message);
        client.sendMessage(sent_to_id, getMeme());
        reminder(time)
    }, getTime(time))
}

// main function
client.on('ready', () => {
    console.log('Client is ready!');
    reminder(8, 'morning');
    reminder(10, 'Soo');
    reminder(19, 'evening');
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