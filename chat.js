const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const sent_to_id = '120363171196259711@g.us';        //change this to your personal What's app id that you want to receive the message
const meme_dir = './meme';                           //where you put your memes 
const min = 0;
const sec = 0;

console.log('CareerChat initialized! v2')

const files = fs.readdirSync(meme_dir).filter(f => f !== '.DS_Store');
if (files.length <= 0){
    console.log('no imgs in meme folder')
    return;
}

function getMeme(){
    const randomFile = files[Math.floor(Math.random()*files.length)];
    const meme_path = path.join(meme_dir, randomFile);
    const img = MessageMedia.fromFilePath(meme_path);
    return img;
}

function convertDateFormat(dateStr) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const [month, day] = dateStr.split(' ');
    const monthNumber = monthNames.indexOf(month) + 1;
    const formattedMonth = String(monthNumber).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const year = 2023
    return `${formattedMonth}/${formattedDay}/${year}`;
}


function getTime(targetHour){
    const now = new Date();
    const then = new Date(now);
    then.setHours(targetHour, min, sec, 0);                 /////////////////////////////////////
    if (now.getTime() > then.getTime()){
        then.setDate(now.getDate()+1);
    }
    return then.getTime() - now.getTime();
}

// main functions of What's-app-web.js
const client = new Client({
    authStrategy: new LocalAuth()
});
// generate qr code to login via this js service
client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

function getJobs(day){
    let now;
    let oneDayInMillis = 24 * 60 * 60 * 1000;               /////////////////////////////////////    
    let oneWeekInMillis = 24 * 60 * 60 * 1000 * 7;
    if (day === 'today'){
        now = new Date();
    }else if (day === 'yesterday'){
        now = new Date();
        now = new Date(now - oneDayInMillis);
    }else if (day === 'week'){
        now = new Date();
        now = new Date(now - oneWeekInMillis);
    }

    console.log(now.toLocaleString('en-US'))

    function formatDate(date) {
        if (typeof date == "string"){ 
            date = new Date(date);
            if (isNaN(date.getTime())) { // check if date is invalid
                console.error('Invalid date string:', date);
                return;
            }
        }
    
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            console.error('Invalid date:', date);
            return;
        }

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth()+1).padStart(2, '0'); // Months are 0-based
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }

    const targetedDate = formatDate(now);
    
    return new Promise((resolve, reject)=>{
        // Fetch data from both links concurrently
        Promise.all([
            axios.get('https://raw.githubusercontent.com/ReaVNaiL/New-Grad-2024/main/README.md'),
            axios.get('https://raw.githubusercontent.com/SimplifyJobs/New-Grad-Positions/dev/README.md'),
            axios.get('https://raw.githubusercontent.com/SimplifyJobs/Summer2024-Internships/dev/README.md')
        ]).then(responses => {
            let jobs = [];
            const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;    //format check for parsed date

            // Process the first response
            const data1 = responses[0].data.split('## Jobs')[1].split('-END OF LIST-')[0].trim();
            const rows1 = data1.split('\n').filter(row => row.startsWith('| ['));
            const jobs1 = rows1.map(row => {
                const [name, location, roles, requirements, dateAdded] = row.split('|').slice(1, -1).map(cell => cell.trim());
                return { name, location, roles, requirements, dateAdded };
            });
            jobs = jobs.concat(jobs1);

            // Process the second response
            const data2 = responses[1].data.split('| --- | --- | --- | :---: | :---: |')[1].split('<!-- Please leave a one line gap between this and the table TABLE_END (DO NOT CHANGE THIS LINE) -->')[0].trim();
            const rows2 = data2.split('\n').filter(row => row.startsWith('| **['));
            const jobs2 = rows2.map(row => {
                const [company, role, location, applicationLink, datePosted] = row.split('|').slice(1, -1).map(cell => cell.trim());   
                return { name: company, location, roles: role, requirements: applicationLink, dateAdded:  convertDateFormat(datePosted) };
            });
            jobs = jobs.concat(jobs2);           
            
            let resultText = '';
            for (const job of jobs){
                if (job.dateAdded >= formatDate(now) && datePattern.test(job.dateAdded)) {
                    resultText += `${job.name} in ${job.location} \nfor role ${job.roles}. \nRequirements: ${job.requirements}. \nDate Added: ${job.dateAdded}\n\n`;
                }
            }
            const cleanedText = resultText.replace(/<br>/g, '\n').replace(/<img[^>]*>/g, '');

            resolve(cleanedText || `No jobs found for the selected date: ${now.toLocaleString('en-US')}`);
        }).catch(error => {
            console.error('Error fetching the content:', error);
            reject("Error fetching the jobs.");
        });
    })
}

function reminder(time, note){
    setTimeout(async ()=>{
        let message;
        if (note === 'morning'){
            message = `Rise and grind, squad! 💪Let's secure that bag! 🎒 Remember to slide through those job apps today. 🚀 #HustleModeOn\n\nHere are the jobs found yesterday:\n`;
            try {
                const jobsMessage = await getJobs('yesterday');
                client.sendMessage(sent_to_id, message + jobsMessage);
            } catch (err) {
                console.error('Error sending the jobs message:', err);
            }
        }else if(note === 'evening'){
            message = `Yo, evening check-in! 🌆 Still got that job search grind to hit or what? Don't let the dream job ghost ya. 💼 #SecureTheBag\n\nHere are the jobs found today:\n`;
            try{
                const jobsMessage = await getJobs('today');
                client.sendMessage(sent_to_id, message + jobsMessage);
            } catch(err){
                console.error('Error sending the jobs message:', err);
            }    
        }else if(note === 'weekly wrap up'){
            message = `Weekly check-in bro! 🤙 Wake the F up! Here are the jobs listed in the past week. 🔥 #SecureTheBag\n\n`;
            try{
                const jobsMessage = await getJobs('week');
                client.sendMessage(sent_to_id, message + jobsMessage);
            } catch(err){
                console.error('Error sending the jobs message:', err);
            }    
        }
        client.sendMessage(sent_to_id, getMeme());
        reminder(time, note)
        console.log('message sent!')
    }, getTime(time))
}


// call the reminder functions
client.on('ready', () => {
    console.log('Client is ready!');
    reminder(8, 'morning');
    reminder(13, null);
    reminder(20, 'evening');
    reminder(14, 'weekly wrap up')
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