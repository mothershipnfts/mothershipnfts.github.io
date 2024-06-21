// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // For making HTTP requests
const { Connection, clusterApiUrl } = require('@solana/web3.js');

// Initialize Express app
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Solana network connection
const connection = new Connection(clusterApiUrl('devnet'));

// Route to handle wallet connection and whitelist addition
app.post('/connect-wallet', async (req, res) => {
    try {
        const { walletAddress, twitterUsername, discordUserId } = req.body;

        // Check if the wallet address is valid (you might want to perform additional checks)
        if (!walletAddress) {
            return res.status(400).json({ error: 'Invalid wallet address' });
        }

        // Check Twitter membership
        const twitterResponse = await fetch(`https://api.twitter.com/2/users/by/username/${twitterUsername}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer AAAAAAAAAAAAAAAAAAAAAAKsuQEAAAAA01ZlIp7skgCd%2Boj48AZOcIpn4Ec%3DA5xyFNRGMOdXD74idY87mnstDYc3drVjUXOyzXhqVIO5DcOgNV`,
            },
        });
        const twitterData = await twitterResponse.json();

        // Check if the user is following on Twitter
        if (!twitterData.data) {
            return res.status(400).json({ error: 'User is not following on Twitter' });
        }

        // Check Discord membership
        const discordResponse = await fetch(`https://discord.com/api/v9/guilds/1242245658124222484/members/${discordUserId}`, {
            method: 'GET',
            headers: {
                Authorization: `Bot MTI1MzU2NTE1NTgwODEyMDkyNQ.GyqZ0Q.RCGohYUUDmA73Gnd6Hirnm4aRxOcjjOcB7MNCw`,
            },
        });
        const discordData = await discordResponse.json();

        // Check if the user is a member of the Discord server
        if (discordResponse.status !== 200) {
            return res.status(400).json({ error: 'User is not a member of the Discord server' });
        }

        // If all checks pass, add the wallet address to the whitelist
        // Your Solana whitelist management logic here

        res.status(200).json({ message: 'Wallet connected and added to whitelist successfully' });
    } catch (error) {
        console.error('Error connecting wallet:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

