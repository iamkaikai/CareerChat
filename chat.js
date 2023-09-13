const qrcode = require('qrcode-terminal');


const { Client, LocalAuth } = require('whatsapp-web.js');
const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});



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
	}else{
        if(message.body) {
            // message.reply('👍');
        }    
    }
    
});

client.on('message_create', async (msg) => {
    console.log(msg);
})

// author: '19193570536@c.us'
// grace: '886979928343@c.us'