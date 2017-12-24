# bih/spotify-web-playback-react-template

This is a modified template of [Create React App](https://github.com/facebookincubator/create-react-app), with an example usage of the [Spotify Web Playback SDK](https://beta.developer.spotify.com/documentation/web-playback-sdk).

Demo: [https://bih.github.io/spotify-web-playback-react-template/](https://bih.github.io/spotify-web-playback-react-template/)

*It contains the following file changes:*
- `src/spotify/spotify-web-playback.js`
- `src/App.js`
- `public/index.html`

It's still a work in progress, and once it's polished, I'll make it into its own official React Node package.

## Example code

This is the React component(s) this project exposes:

```jsx
<WebPlayback
  playerName="Bilawal's React Player"
  playerInitialVolume={1.0}
  playerAutoConnect={true}
  userAccessToken={userAccessToken}
  onPlayerReady={(data) => console.log("player ready", data)}
  onPlayerStateChange={(playerState) => this.setState({ playerState: playerState })}>

  <Screen Error>
    <h3>Error</h3>
  </Screen>

  <Screen Loading>
    <h3>Loading Web Playback SDK</h3>
  </Screen>

  <Screen WaitingForDevice>
    <h3>Waiting for Device to be Selected</h3>
  </Screen>

  <Screen Player>
    <h1>Music is playing!</h1>
  </Screen>
</WebPlayback>
```

## Components

Some notes:
- Spotify will load the Web Playback SDK when the page initially loads, not when you call the `<WebPlayback />` element in your React code
- The `<WebPlayback />` component will select the right children React components, so the `onPlayerReady` and `onPlayerStateChange` are available only for additional customization and control.

### &lt;WebPlayback /&gt;

Declare this when you want to create an instance of the Web Playback SDK.
Once loaded, it is available in JavaScript under `window.Spotify.PlayerInstance`

```jsx
<WebPlayback
  {/* playerName -> The name of your player that shows up in Spotify. */}
  playerName="Bilawal's React Player"
  {/* playerInitialVolume -> The initial volume of your player. Between 0 and 1. (Recommended: 1.0) */}
  playerInitialVolume={1.0}
  {/* playerAutoConnect -> Once defined, should it load automatically? (Recommended: Yes) */}
  playerAutoConnect={true}
  {/* userAccessToken -> The Spotify access token. See https://beta.developer.spotify.com/documentation/web-playback-sdk for more info. */}
  userAccessToken={userAccessToken}
  {/* Optional: onPlayerReady -> Callback for when the player is ready to play music. */}
  onPlayerReady={(data) => console.log("player ready", data)}
  {/* Optional: onPlayerStateChange -> Callback for when the player state has changed. */}
  onPlayerStateChange={(playerState) => this.setState({ playerState: playerState })}
  >

  ...
</WebPlayback>
```

### &lt;Screen Error /&gt;

**Note:** This element must be nested inside of `<WebPlayback />` as per the example code above.

The contents of this element will only be visible when an error has occurred in the Web Playback SDK.

```jsx
<WebPlayback ...>
  <Screen Error>
    <h3>An error has occurred!</h3>
  </Screen>

  ...
</WebPlayback>
```

### &lt;Screen Loading /&gt;

**Note:** This element must be nested inside of `<WebPlayback />` as per the example code above.

The contents of this element will only be visible whilst the SDK being loaded in the user's browser.

```jsx
<WebPlayback ...>
  <Screen Loading>
    <h3>Loading the Web Playback SDK. Please wait ....</h3>
  </Screen>

  ...
</WebPlayback>
```

### &lt;Screen WaitingForDevice /&gt;

**Note:** This element must be nested inside of `<WebPlayback />` as per the example code above.

The contents of this element will only be visible once the SDK has loaded, but is waiting for the user to select your player inside of Spotify Connect.
This can be done automatically [through the Web API](https://beta.developer.spotify.com/documentation/web-api/reference/player/transfer-a-users-playback/), but requires a HTTP request that is not currently implemented.

```jsx
<WebPlayback ...>
  <Screen WaitingForDevice>
    <h3>Waiting for Device to be Selected</h3>
  </Screen>

  ...
</WebPlayback>
```

### &lt;Screen Player /&gt;

**Note:** This element must be nested inside of `<WebPlayback />` as per the example code above.

The contents of this element will only be visible when playback is available. This element is perfect for presenting a now playing view with controls.

```jsx
<WebPlayback ...>
  <Screen Player>
    <h3>Music is playing!</h3>
  </Screen>

  ...
</WebPlayback>
```

# facebookincubator/create-react-app

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

Read more on [github.com/facebookincubator/create-react-app](https://github.com/facebookincubator/create-react-app).
