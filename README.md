# Discord-Bot
A feature-rich custom Discord bot built with `discord.js`, integrating useful utilities, fun interactions, and AI-powered responses. This bot supports reminders, meme generation, probability simulations, message logging, birthday events, and more.

## Commands

### Probability Simulators
- `/coinflip` – Simulates a 50/50 coin toss.
- `/rng` - Generates a random number between x and y inclusive.
- `/feeling-lucky` – Simulates different probabilities to determine luck.

### Reminder System
> Uses `chrono-node` to parse times.  
> Long-term reminders are stored in SQLite3 via Sequelize and checked regularly.
Set reminders that DM you at the specified time.
- `/remind`  
  - `user` (optional) – User to remind / Default: user who sent the command.   
  - `message` – Reminder content.  
  - `time` – Supports natural language time string (e.g. "in 2 hours", "tomorrow at 8am").

### Message Logging & AI Responses
- Detects messages and logs them.
- Replies to direct pings with contextual messages.
- DMs are forwarded and responded to automatically by the bot.

### Birthday Tracker 
> Feature still in testing.
- `/birthday set` – Store your birthday.
- `/birthday today` – View birthdays today.
- Automatically notifies the server of member birthdays.

### Gemini Integration (AI Support)
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
- `/meme search:<term>` (optional) – Finds a random meme based on your term sorted by relevance or upvotes within the last month.
- `/meme type:<subreddit>` (optional) – Finds a random meme from a chosen list of subreddits sorted by upvotes within the last month.
- `/meme search:<term> type:<subreddit>` – Searches within the subreddit using your term sorted by upvotes within the last month.

## Event listening

### Message logging
- Features message logging for direct pings and automatically replies.
- Listens for certain phrases and automatically replies.
- When a user replies to the bot's own response, the bot will reply back powered by AI integration with dynamic context up to 100 messages.

## Packages & Technologies Used
Packages 
--------------------------------------------------
| `discord.js`    | Core framework for bot interaction 
| `day.js`        | Lightweight time formatting      
| `sequelize`     | ORM for database handling        
| `sqlite3`       | Local storage of reminders, birthdays 
| `chrono-node`   | Natural language date parsing    
| `node-fetch`    | Fetching memes from Reddit API
