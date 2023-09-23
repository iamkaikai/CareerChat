const axios = require('axios');

function convertDateFormat(dateStr) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const [month, day] = dateStr.split(' ');
    const monthNumber = monthNames.indexOf(month) + 1;
    const formattedMonth = String(monthNumber).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const year = 2023
    return `${formattedMonth}/${formattedDay}/${year}`;
}

function getJobs(day){
    let now;
    let oneDayInMillis = 24 * 60 * 60 * 1000;
    if (day === 'today'){
        now = new Date();
    }else if (day === 'yesterday'){
        now = new Date();
        now = new Date(now - 24 * 60 * 60 * 1000 * 1);
    }

    function formatDate(date) {
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
            axios.get('https://raw.githubusercontent.com/SimplifyJobs/New-Grad-Positions/dev/README.md')
        ]).then(responses => {
            let jobs = [];

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
                if (job.dateAdded >= formatDate(now)) {
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

getJobs('yesterday')
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error(error);
    });

