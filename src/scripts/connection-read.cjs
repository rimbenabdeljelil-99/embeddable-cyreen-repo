const apiKey = '7f41e45d-02ac-45af-819d-16f024faeec6';
const connectionName = 'cap_2_demo'; 

const BASE_URL = 'https://api.us.embeddable.com'; // US
// const BASE_URL = 'https://api.eu.embeddable.com'; // EU

async function run() {
    const resp = await fetch(`${BASE_URL}/api/v1/connections/${connectionName}`, {
        method: 'GET', 
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiKey}` /* keep your API Key secure */
        }
    });

    console.log(`${resp.status} ${resp.statusText}`);
    const json = await resp.json();
    console.log(json);
}

run();