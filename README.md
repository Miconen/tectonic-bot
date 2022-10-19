# Tectonic bot

## Branches
- main branch: Deployed version of the bot
- dev branch: Most up to date branch

# Table of contents
1. [Introduction](#introduction)
2. [Usage](#usage)
    1. [Points](#points)
    2. [Commands](#commands)
    3. [New users](#newusers)
4. [Instatllation](#installation)
    1. [Initial setup](#installation__initialsetup)
    2. [Project folder](#installation__projectfolder)
    3. [Docker & MySql](#installation__docker&mysql)

## Introduction<a name="introduction"></a>

## Usage<a name="usage"></a>
This section will go over the usage of the bot and is mostly meant for those managing users with it.

### Points<a name="points"></a>
Currently we give out points like so.
- Splits
    - Low value: 10
    - Medium value: 20
    - High value: 30
- Events
    - Participation: 5
    - Hosting: 10
- Learners
    - Half: 5
    - Full: 10
- Forum
    - Bumping: 5

### Commands (TODO)<a name="commands"></a>

#### Points
#### Activate
#### Deactivate
#### Checkstatus
#### Split
#### Event
#### Learner
#### Quote
#### Rsn
#### Help

### New users<a name="newusers"></a>
For new users we will use /activate (username). This will automatically assign them with the Jade rank and add them to the database. This allows activated users to start recieving rank points.

## Installation<a name="installation"></a>

### Requirements:<a name="installation__requirements"></a>

-   [Node.js Version >= 16.6.0](https://nodejs.org/en/)
-   [TypeScript	Version >= 4.4.4](https://www.npmjs.com/package/typescript)
-   [Discord Bot](https://discord.com/developers/applications)
-   [Docker](https://www.docker.com/)

### Beginner friendly guide

#### Initial setup<a name="installation__initialsetup"></a>

Git clone the project or manually download and extract.

```
git clone https://github.com/Miconen/tectonic-bot
```

#### Project folder<a name="installation__projectfolder"></a>

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

#### Docker & MySql<a name="installation__docker&mysql"></a>

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
