<p align="center">
  <img src="./icon.png" alt="" width="128" />
</p>

# Zenbiuu

Zenbiuu (ゼンビウー, pronounced `/zenbjuː/`, like `zen view`) is a desktop app for comfortable watching streams from Twitch.

## Why
Streaming web-sites are bloated with unnecessary functionality and ads, not to mention strange design decisions.
Zenbiuu was made in attempt to make watching streams with less distractions as possible.

## Development
Zenbiuu is an Electron app, written in Vue and TypeScript.
It uses [Vite](https://vitejs.dev/) as its build tool.

### Prepare
1. To receive client id for communication with Twitch API register your app on https://dev.twitch.tv/console/apps
2. Create `.env` file from `.env.example` in project root
3. Set received client id in `VITE_APP_CLIENT_ID` field
4. Set the same redirect url you specified during app registration in `VITE_APP_REDIRECT_URL` field


## License
[GPL-3.0](https://opensource.org/licenses/GPL-3.0)
