# Tectonic bot

## Branches

-   main branch: Deployed version of the bot
-   dev branch: Most up to date branch

# Table of contents

1. [Introduction](#introduction)
2. [Usage](#usage)
    1. [Points](#points)
    2. [Commands](#commands)
    3. [Moderation Commands](#modcommands)
    4. [Handling users](#newusers)
3. [Installation](#installation)
    1. [Initial setup](#installation__initialsetup)
    2. [Project folder](#installation__projectfolder)
    3. [Docker & MySql](#installation__docker&mysql)
    4. [Installation issues](#installation__issues)

## Introduction<a name="introduction"></a>

## Usage<a name="usage"></a>

This section will go over the usage of the bot and is mostly meant for those managing users with it.

### Points<a name="points"></a>

Points info command:

```
/help points
```

Ranks info command:

```
/help ranks
```

Currently we give out points like so.

-   Splits
    -   Low value: 10
    -   Medium value: 20
    -   High value: 30
-   Events
    -   Participation: 5
    -   Hosting: 10
-   Learners
    -   Half: 5
    -   Full: 10
-   Forum
    -   Bumping: 5

### User Commands<a name="commands"></a>

---

#### /help

##### Info:

Help on different commands and topics relating to the clan.

##### Usage:

```
/help (command/topic)
```

Use the discord slash command autocomplete to browse through options.

---

#### /points

##### Info:

Points is a command that returns the points of a specified user, takes in an optional username which will default to the user calling the command if left blank.

##### Usage:

Get own points:

```
/points
```

Get someone elses points:

```
/points @User
```

---

#### /split

##### Info:

Used for gaining rank points after splitting with clan members. You must accompany using this command with a screenshot of a drop that you split with your clan members.

##### Usage:

```
/split (value range)
```

Select the correct value range corresponding to the item value at the time.

---

### Moderation Commands<a name="modcommands"></a>

---

#### /activate

##### Info:

For new users we will use /activate (username). This will automatically assign them with the Jade rank and add them to the database. This allows activated users to start recieving rank points.

##### Usage:

```
/activate @User
```

---

#### /deactivate

##### Info:

For users that are no longer a part of the community we have /deactivate (username) which will delete all points values associated with them from the database.

##### Usage:

```
/deactivate @User
```

---

#### /checkstatus

##### Info:

Used for checking if a user is activated or not, just a simple and useful utility mod command.

##### Usage:

```
/checkstatus @User
```

---

#### /event

##### Info:

Event is used for rewarding points for either participating or hosting an event.

##### Usage:

Rewarding a user for hosting an event:

```
/event hosting @User
```

Rewarding a user for participating in an event:

```
/event participation @User
```

---

#### /learner

##### Info:

Used for rewarding players that teach other clan members. Depending on the activity, players can be awarder either half or full points.

##### Usage:

Half points:

```
/learner half @User
```

Full points:

```
/learner full @User
```

---

### Handling users<a name="newusers"></a>

For new users we will use /activate (username). This will automatically assign them with the Jade rank and add them to the database. This allows activated users to start recieving rank points.

For users that are no longer a part of the community we have /deactivate (username) which will delete all points values associated with them from the database.

Checking if a particular user is activated or not can be done with /checkstatus (username).

## Installation<a name="installation"></a>

### Requirements:<a name="installation__requirements"></a>

-   [Node.js Version >= 16.6.0](https://nodejs.org/en/)
-   [TypeScript Version >= 4.4.4](https://www.npmjs.com/package/typescript)
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

### Installation issues<a name="installation__issues"></a>

#### MySql database refuses connection

I had this issue on a Mac. The solution to fix it was to create a new user with a host of % in the database.
First user docker ps to list your containers.

```
docker ps
```

Copy your databases id and run:

```
docker exec -it (database_id) bash
```

Log in to your databse through the command line by running the following command and inserting your password. The default password is most likely either root or just blank.

```
mysql -u root -p
```

After logging in run these commands and the database connection should be fixed.

```sql
CREATE USER 'root'@'%' IDENTIFIED BY 'root';
grant all on *.* to 'root'@'%';
```
