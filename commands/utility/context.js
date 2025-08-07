async function context(channel, numMessages) {
  const fetchMessages = await channel.messages.fetch({ numMessages });

  const messages = [...fetchMessages.values()]
    .reverse()
    .map(msg => `${msg.author.username}: ${msg.content}`)
    .join('\n');

  return messages;
}

module.exports = { context };
