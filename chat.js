const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

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

function getJobs(day){
    let now;
    if (day === 'today'){
        now = new Date();
    }else if (day === 'yesterday'){
        now = new Date(now.getDate() - 1);
    }
    
    // Function to format the current date to match the dateAdded format
    function formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth()).padStart(2, '0'); // Months are 0-based
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }

    const targetedDate = formatDate(now);
    // console.log(targetedDate)

    // Fetch the content using axios
    return new Promise((resolve, reject)=>{
        axios.get('https://raw.githubusercontent.com/ReaVNaiL/New-Grad-2024/main/README.md')
        .then(response => {
            const data = response.data;

            // Extract the section under '## Jobs'
            const jobsSection = data.split('## Jobs')[1].split('-END OF LIST-')[0].trim();
            
            // Split the section into rows
            const rows = jobsSection.split('\n').filter(row => row.startsWith('| ['));
            
            // Convert each row into an object
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

            console.log(resultText);
            resolve(resultText || "No jobs found for the selected date.");
        }).catch(error => {
            console.error('Error fetching the content:', error);
            reject("Error fetching the jobs.");
        });
    })
}

function reminder(time, day){
    setTimeout(async ()=>{
        const sent_to_id = '120363171196259711@g.us';
        let message;
        if (day === 'morning'){
            message = `Rise and grind, squad! 💪Let's secure that bag! 🎒 Remember to slide through those job apps today. 🚀 #HustleModeOn\n\n`;
            try {
                const jobsMessage = await getJobs('yesterday');
                client.sendMessage(sent_to_id, message + jobsMessage);
            } catch (err) {
                console.error('Error sending the jobs message:', err);
            }
        }else if(day === 'Soo'){
            message = `Hey Soo! Time to rise, shine, and grind! 💪 Let's conquer those job apps today and move one step closer to our dreams. 🚀 Don't let the hustle fade. #SooGotThis 💼🎒`;
        }else if(day === 'evening'){
            message = `Yo, evening check-in! 🌆 Still got that job search grind to hit or what? Don't let the dream job ghost ya. 💼 #SecureTheBag\n\n`;
            try{
                const jobsMessage = await getJobs('today');
                client.sendMessage(sent_to_id, message + jobsMessage);
    
            } catch(err){
                console.error('Error sending the jobs message:', err);
            }    
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
    reminder(20, 'evening');
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