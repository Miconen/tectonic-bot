# Tectonic bot

## Installation

### Requirements:

-   [Node.js 16+](https://nodejs.org/en/)
-   [Discord Bot](https://discord.com/developers/applications)
-   [Docker](https://www.docker.com/)

### Beginner friendly guide

#### Initial setup

Git clone the project or manually download and extract.

```
git clone https://github.com/Miconen/tectonic-bot
```

#### Project folder

For this step you will need your bots token, if you haven't yet made a bot or got a token you can do so from [Discords developer website](https://discord.com/developers/applications).
Once you have your bot token, create a file in the projects root folder, name it .env and paste your bot token inside as shown below.

```
BOT_TOKEN=BOT_TOKEN_HERE
```

Install your npm packages, specified in package.json

```
npm install
```

Edit passwords and usernames to your liking in docker-compose.yml

#### Docker & MySql

Build and start your docker instance, open a terminal window and make sure you're in your project folder.

```
cd (Project path)
docker-compose build
docker-compose up
```

Now you can open [localhost:8080](localhost:8080) in your browser, you should be able to login using the credentials you chose
under phpmyadmin in docker-compose.yml. To find your ip for the "Server" field, open your terminal once again and run the following commands.

```
docker ps
```

You should now see a row that says "mysql", copy the first few letters or numbers below the "CONTAINER ID" column.
After running the command scroll up slightly and look for "IPAddress", use this for your Server section on the phpMyAdmin login screen.

```
docker inspect (first few letters of container id)
```

Find the database specified in docker-compose.yml, click on it and select "SQL" from the top row.
Now paste the contents of the database.sql file inside. You should now have a working development build of the bot running.

_Boilerplate and template for the bot from https://github.com/oceanroleplay/discordx-templates/_
