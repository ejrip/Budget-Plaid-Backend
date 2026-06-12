const express = require('express');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const config = new Configuration({
basePath: PlaidEnvironments.development,
baseOptions: {
headers: {
'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
'PLAID-SECRET': process.env.PLAID_SECRET,
},
},
});

const plaidClient = new PlaidApi(config);
let accessToken = null;

app.post('/create-link-token', async (req, res) => {
const response = await plaidClient.linkTokenCreate({
user: { client_user_id: 'eli-budget-user' },
client_name: 'Eli Budget Tool',
products: ['transactions'],
country_codes: ['US'],
language: 'en',
});
res.json(response.data);
});

app.post('/exchange-token', async (req, res) => {
const { public_token } = req.body;
const response = await plaidClient.itemPublicTokenExchange({ public_token });
accessToken = response.data.access_token;
res.json({ success: true });
});

app.get('/transactions', async (req, res) => {
const today = new Date().toISOString().split('T')[0];
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const response = await plaidClient.transactionsGet({
access_token: accessToken,
start_date: thirtyDaysAgo,
end_date: today,
});
res.json(response.data.transactions);
});

app.listen(3000, () => console.log('Budget backend running on port 3000'));
