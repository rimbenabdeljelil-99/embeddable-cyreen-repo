const apiKey = '7f41e45d-02ac-45af-819d-16f024faeec6';
const connectionName1 = 'cap_2_demo';

const connectionName2 = 'my-db2';

const connectionName3 = 'my-db3';

//const BASE_URL = 'https://api.us.embeddable.com'; // US
const BASE_URL = 'https://api.eu.embeddable.com'; // EU

/**
 * see db-specific examples @ https://trevorio.notion.site/Connections-API-ff4af10f7eaf4288b6952fde04e6e933
 */
const dbType = 'postgres'; 
const credentials1 = {
    database: 'cap_2_analytics_demo',
    host: 'jump-server.eu.embeddable.internal',
    user: 'tableau',
    password: 'Business_As_Usual',
    port: 8090
}


const credentials2 = {
    database: 'cap_2_demo',
    host: 'caplatam.ccy0kgtniogg.eu-central-1.rds.amazonaws.com',
    user: 'tableau',
    password: 'Business_As_Usual'
}

const credentials3 = {
    database: 'cap_monitoring',
    host: 'caplatam.ccy0kgtniogg.eu-central-1.rds.amazonaws.com',
    user: 'tableau',
    password: 'Business_As_Usual'
}

async function createConnection(name, credentials) {
    const resp = await fetch(`${BASE_URL}/api/v1/connections`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            name: name,
            type: dbType,
            credentials: credentials
        })
    });

    console.log(`Connection ${name}: ${resp.status} ${resp.statusText}`);
    const json = await resp.json();
    console.log(json);
}

async function run() {
    await createConnection(connectionName1, credentials2);
}

run();