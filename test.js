const axios = require('axios');

// Fetch the content using axios
axios.get('https://raw.githubusercontent.com/ReaVNaiL/New-Grad-2024/main/README.md')
  .then(response => {
    const data = response.data;

    // Extract the section under '## Jobs'
    const jobsSection = data.split('## Jobs')[1].split('-END OF LIST-')[0].trim();
    // console.log(jobsSection)
    
    // Split the section into rows
    const rows = jobsSection.split('\n').filter(row => row.startsWith('| ['));
    console.log(rows)
    
    // Convert each row into an object
    const jobs = rows.map(row => {
      const [name, location, roles, requirements, dateAdded] = row.split('|').slice(1, -1).map(cell => cell.trim());
      return { name, location, roles, requirements, dateAdded };
    });

    // console.log(jobs);
  })
  .catch(error => {
    console.error('Error fetching the content:', error);
  });
