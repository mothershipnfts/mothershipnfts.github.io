// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // For making HTTP requests
const { Connection, clusterApiUrl } = require('@solana/web3.js');
require('dotenv').config(); // Load environment variables

// Initialize Express app
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Solana network connection
const connection = new Connection(clusterApiUrl('devnet'));

// Array to store whitelist information
const whitelist = [];

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
                Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
            },
        });
        const twitterData = await twitterResponse.json();

        // Check if the user exists on Twitter
        if (!twitterData.data) {
            return res.status(400).json({ error: 'Twitter user not found' });
        }

        // Check if the user follows a specific Twitter account (if needed)
        const userId = twitterData.data.id;
        const followCheckResponse = await fetch(`https://api.twitter.com/2/users/${userId}/following`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
            },
        });
        const followCheckData = await followCheckResponse.json();
        const isFollowing = followCheckData.data.some(follow => follow.username === 'YourAccountToCheck');

        if (!isFollowing) {
            return res.status(400).json({ error: 'User is not following the specified Twitter account' });
        }

        // Check Discord membership
        const discordResponse = await fetch(`https://discord.com/api/v9/guilds/${process.env.DISCORD_SERVER_ID}/members/${discordUserId}`, {
            method: 'GET',
            headers: {
                Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
            },
        });
        const discordData = await discordResponse.json();

        // Check if the user is a member of the Discord server
        if (discordResponse.status !== 200) {
            return res.status(400).json({ error: 'User is not a member of the Discord server' });
        }

        // If all checks pass, add the wallet address and other info to the whitelist
        const whitelistEntry = {
            walletAddress,
            twitterUsername,
            discordUserId,
            timestamp: new Date().toISOString()
        };
        whitelist.push(whitelistEntry);

        res.status(200).json({ message: 'Wallet connected and added to whitelist successfully' });
    } catch (error) {
        console.error('Error connecting wallet:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to retrieve the whitelist
app.get('/whitelist', (req, res) => {
    res.status(200).json(whitelist);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
