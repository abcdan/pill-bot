# pill-bot
A bot made for my GF so she doesn't forget "the pill" but you can set it up for yourself as well

## Setup
The first thing you have to do is setup a bot using this tutorial [https://core.telegram.org/bots](https://core.telegram.org/bots)

After that, the person that wants to get reminders has to `/start` the bot and the person who wants the warnings has to do the same. If you just want to use it for yourself, simply enter your own ID in the `.env` (we'll get to this soon) for the person that needs to be warned.

1. Clone the repo somewhere
2. Copy `.env.example` to `.env`
3. Fill in the file
4. `docker-compose up -d` (--build is optional)
5. It works!

## Code quality
The bot isn't meant to be "high quality code" but just a temp. solution before I clean up this project. The project itself was a bit rushed but properly tested to ensure it's **actually** works like it should.

## To be added features
1. Instead of hardcoding the reminder times, make it a setting. (It's currently 9, 10, 11 PM for reminders and 11:50 pm for the last call.)
2. Make it so you don't have to selfhost it, one big bot that does all this.

## Found an issue?
Great! Let me know through an issue or a PR if you've already fixed it.

## Known issues
1. the `chainfile.json` isn't stored outside of the container, this can cause issues when the container gets built again. Fixing asap.
## License?
It's released under `apache 2.0`