const axios = require('axios');


function getJobs(){
    const now = new Date();
    
    // Function to format the current date to match the dateAdded format
    function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth()).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
    }

    const today = formatDate(now);
    console.log(today)

    // Fetch the content using axios
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

        for (const job of jobs){
            if (job.dateAdded === today) {
                console.log(job);
            }
        }
    })
    .catch(error => {
        console.error('Error fetching the content:', error);
    });

}

const now = new Date();
console.log(now.toLocaleString('en-US'));
