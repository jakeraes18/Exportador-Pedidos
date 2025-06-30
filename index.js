require('dotenv').config();
const axios = require('axios');
const { google } = require('googleapis');

const SHOPIFY_STORE_NAME = process.env.SHOPIFY_STORE_NAME;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

const SHOPIFY_API_VERSION = '2024-07';
const SHOPIFY_BASE_URL = `https://${SHOPIFY_STORE_NAME}/admin/api/${SHOPIFY_API_VERSION}`;

const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
);

async function getShopifyOrders(dateFilter) {
    try {
        const response = await axios.get(`${SHOPIFY_BASE_URL}/orders.json`, {
            headers: {
                'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
            },
            params: {
                status: 'any',
                created_at_min: dateFilter.start,
                created_at_max: dateFilter.end,
                limit: 250,
            }
        });
        return response.data.orders;
    } catch (error) {
        console.error('Error al obtener pedidos de Shopify:', error.response ? error.response.data : error.message);
        throw error;
    }
}

function formatShopifyOrders(orders) {
    return orders.map(order => {
        const customerName = order.customer ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() : 'N/A';
        const productsBought = order.line_items.map(item => `${item.name} (x${item.quantity})`).join(', ');
        const totalPrice = parseFloat(order.total_price).toFixed(2);

        return [
            order.id,
            customerName,
            new Date(order.created_at).toLocaleString(),
            productsBought,
            totalPrice
        ];
    });
}

async function authorizeGoogleSheets() {
    let tokens;
    try {
        const fs = require('fs');
        const TOKEN_PATH = 'token.json';

        if (fs.existsSync(TOKEN_PATH)) {
            tokens = JSON.parse(fs.readFileSync(TOKEN_PATH));
            oauth2Client.setCredentials(tokens);
            console.log('Credenciales de Google cargadas desde el archivo.');
        } else {
            console.log('No se encontraron tokens. Generando URL de autorización...');
            const authUrl = oauth2Client.generateAuthUrl({
                access_type: 'offline', 
                scope: SCOPES,
            });
            console.log('Autoriza esta aplicación visitando esta URL:', authUrl);

            const readline = require('readline').createInterface({
                input: process.stdin,
                output: process.stdout,
            });

            const code = await new Promise(resolve => {
                readline.question('Ingresa el código de autorización de esa página aquí: ', resolve);
            });
            readline.close();

            const { tokens: newTokens } = await oauth2Client.getToken(code);
            oauth2Client.setCredentials(newTokens);
            fs.writeFileSync(TOKEN_PATH, JSON.stringify(newTokens)); 
            console.log('Tokens guardados en token.json');
        }
    } catch (error) {
        console.error('Error al autorizar Google Sheets o al obtener tokens:', error.message);
        throw error;
    }
    return oauth2Client;
}

async function appendDataToSheet(auth, data) {
    const sheets = google.sheets({ version: 'v4', auth });
    const range = 'Reporte!A:E'; 

    try {
        const res = await sheets.spreadsheets.values.append({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: range,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: data,
            },
        });
        console.log(`${res.data.updates.updatedCells} celdas actualizadas en Google Sheet.`);
        return res.data;
    } catch (error) {
        console.error('Error al insertar datos en Google Sheet:', error.response ? error.response.data : error.message);
        throw error;
    }
}

async function main() {
    try {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0);
        const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

        const dateFilter = {
            start: startOfYesterday.toISOString(),
            end: endOfToday.toISOString(),
        };

        console.log(`Obteniendo pedidos de Shopify desde ${dateFilter.start} hasta ${dateFilter.end}...`);
        const orders = await getShopifyOrders(dateFilter);
        console.log(`Se encontraron ${orders.length} pedidos.`);

        if (orders.length === 0) {
            console.log('No hay pedidos nuevos para reportar. Saliendo.');
            return;
        }

        console.log('Formateando datos de pedidos...');
        const formattedData = formatShopifyOrders(orders);

        console.log('Autorizando Google Sheets API...');
        const auth = await authorizeGoogleSheets();

        console.log('Insertando datos en Google Sheet...');
        await appendDataToSheet(auth, formattedData);

        console.log('¡Reporte diario generado exitosamente!');

    } catch (error) {
        console.error('Se produjo un error durante la ejecución principal:', error);
    }
}

main();