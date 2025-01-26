const linksList = document.getElementById('links');
const backendUrl = 'http://localhost:3000/api';

async function fetchAndRenderLinks() {
    try {
        const response = await fetch(`${backendUrl}/data`);
        const data = await response.json();
        linksList.innerHTML = '';
        data.groups.forEach(group => {
            group.websites.forEach(website => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `<a href="${website.url}" target="_blank">${website.name}</a>`;
                linksList.appendChild(listItem);
            });
        });
    } catch (error) {
        console.error('Failed to fetch links:', error);
        linksList.innerHTML = 'Failed to load links.';
    }
}

fetchAndRenderLinks(); 