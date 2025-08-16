# Discord-Bot
A feature-rich custom Discord bot built with primarily `Node.js and Discord.js`, integrating useful utilities, fun interactions, and AI-powered responses. This bot supports reminders, meme generation, probability simulations, message logging, birthday events, and more.

## Commands

### Probability Simulators
- `/coinflip` – Simulates a 50/50 coin toss.
- `/rng` - Generates a random number between x and y inclusive.
- `/feeling-lucky` – Simulates different probabilities to determine luck.
  - `tries` - Number of times you want to try

### Reminder System
> Uses `chrono-node` to parse times.  
> Long-term reminders are stored in SQLite3 via Sequelize and checked regularly.
Set reminders that DM you at the specified time.
- `/remind`  
  - `user` (optional) – User to remind / Default: user who sent the command.   
  - `message` – Reminder content.  
  - `time` – Enter a time. Supports natural language time string (e.g. "in 2 hours", "tomorrow at 8am").

### Message Logging & AI Responses
- Detects messages and logs them.
- Replies to direct pings with contextual messages.
- DMs are forwarded and responded to automatically by the bot.

### AI Integration
- `/ask-ai-question` 
  - `your-question` – Ask a question and get an answer.
  - `context` (optional) – Number of messages to fetch for context.

- `/ask-ai-summarize` 
  - `messages` – Number of messages to fetch and summarize.
  - `channel` (optional) - Specify the channel you want to summarize from.

### Meme Generator
> Filters posts to show only image-based memes.  
> Displays meme as an embedded image with title and post link.
- `/meme` – Pulls a random meme from a random meme subreddit.
- `/meme type:<subreddit>` (optional) – Finds a random meme from a chosen list of subreddits sorted by upvotes within the last month.

### Database Commands
> View all entries associated with the user
- `/list` - Lists all stored information added by user (reminders)

### Game Polling
> Creates a poll to gather friends for a game
- `/pollgame` - creates an embedded post where users can vote to play.
  - `game` - Select a game to poll for.
  - `players` - Number of players your looking for.
  - `time` - Enter a time to play. Supports natural language time string (e.g. "in 2 hours", "tomorrow at 8am").
  - `mention` (optional) - Ping a role or user.
  - `description` (optional) - Adds a custom description to the poll.
  - `dm` (optional) - When the poll ends everyone who voted to play will recieve a notification.

### Messages
> Purges multiple messages with a 10 second cooldown
- `/message delete`
  - `amount-of-messages` - Amount of messages to delete (max: 50)

## Event listening

### Message logging
- Features message logging for direct pings and automatically replies.
- Listens for certain phrases and automatically replies.
- When a user replies to the bot's own response, the bot will reply back powered by AI integration with dynamic context up to 100 messages.

### Level Up System
- Features custom ranks and borders for using commands.
- Rank command to display current rank and amount of xp needed for the next rank.

## Packages Used
- `discord.js` - Core framework for bot interaction.
- `day.js` - Lightweight time formatting.
- `sequelize` - ORM for database handling.
- `sqlite3` - Local storage of reminders, birthdays, and user xp.
- `chrono-node` - Natural language date parsing.
- `node-fetch` - Fetching memes from Reddit API.
- `napi-rs/canvas` - Creates images for displaying profiles.
- `luxon` - Handles strict time conversions.


