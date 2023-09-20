const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const sent_to_id = '120363171196259711@g.us';       //change this to your personal What's app id that you want to receive the message
const meme_dir = './meme'                           //where you put your memes 

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

function getJobs(day){
    let now;
    let oneDayInMillis = 24 * 60 * 60 * 1000;  // hours * minutes * seconds * milliseconds

    if (day === 'today'){
        now = new Date();
    }else if (day === 'yesterday'){
        now = new Date();
        now = new Date(now - oneDayInMillis);
    }
    console.log(now)

    function formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth()).padStart(2, '0'); // Months are 0-based
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }

    const targetedDate = formatDate(now);
    
    return new Promise((resolve, reject)=>{
        axios.get('https://raw.githubusercontent.com/ReaVNaiL/New-Grad-2024/main/README.md')
        .then(response => {
            const data = response.data;
            const jobsSection = data.split('## Jobs')[1].split('-END OF LIST-')[0].trim();
            const rows = jobsSection.split('\n').filter(row => row.startsWith('| ['));
            const jobs = rows.map(row => {
                const [name, location, roles, requirements, dateAdded] = row.split('|').slice(1, -1).map(cell => cell.trim());
                return { name, location, roles, requirements, dateAdded };
            });
            let resultText = '';
            for (const job of jobs){
                if (job.dateAdded === targetedDate) {
                    resultText += `${job.name} in ${job.location} \nfor role ${job.roles}. \nRequirements: ${job.requirements}. \nDate Added: ${job.dateAdded}\n\n`;
                }
            }
            const cleanedText = resultText.replace(/<br>/g, '\n');
            console.log(now.toLocaleString('en-US'))
            console.log(resultText);
            resolve(resultText || `No jobs found for the selected date: ${now.toLocaleString('en-US')}`);
        }).catch(error => {
            console.error('Error fetching the content:', error);
            reject("Error fetching the jobs.");
        });
    })
}

function reminder(time, day){
    setTimeout(async ()=>{
        let message;
        if (day === 'morning'){
            message = `Rise and grind, squad! 💪Let's secure that bag! 🎒 Remember to slide through those job apps today. 🚀 #HustleModeOn\n\n`;
            try {
                const jobsMessage = await getJobs('yesterday');
                client.sendMessage(sent_to_id, message + jobsMessage);
            } catch (err) {
                console.error('Error sending the jobs message:', err);
            }
        }else if(day === 'evening'){
            message = `Yo, evening check-in! 🌆 Still got that job search grind to hit or what? Don't let the dream job ghost ya. 💼 #SecureTheBag\n\n`;
            try{
                const jobsMessage = await getJobs('today');
                client.sendMessage(sent_to_id, message + jobsMessage);
    
            } catch(err){
                console.error('Error sending the jobs message:', err);
            }    
        }
        client.sendMessage(sent_to_id, getMeme());
        reminder(time)
    }, getTime(time))
}

// main functions of What's-app-web.js
const client = new Client({
    authStrategy: new LocalAuth()
});
// generate qr code to login via this js service
client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});
// call the reminder functions
client.on('ready', () => {
    console.log('Client is ready!');
    reminder(21, 'morning');
    reminder(12, null);
    // reminder(20, 'evening');
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