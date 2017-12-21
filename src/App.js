import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';

// Add Spotify Web Playback for React
import WebPlayback from './spotify/spotify-web-playback.js';

// class App extends Component {
//   render() {
//     return (
//       <div className="App">
//         <header className="App-header">
//           <img src={logo} className="App-logo" alt="logo" />
//           <h1 className="App-title">Welcome to React</h1>
//         </header>
//         <p className="App-intro">
//           To get started, edit <code>src/App.js</code> and save to reload.
//         </p>
//       </div>
//     );
//   }
// }

class NowPlayingView extends Component {
  render = () => {
    let {
      id,
      uri: track_uri,
      name: track_name,
      duration_ms,
      artists: [{
        name: artist_name,
        uri: artist_uri
      }],
      album: {
        name: album_name,
        uri: album_uri,
        images: [{ url: album_image }]
      }
    } = this.props.track_window.current_track;

    return (
      <div>
        <img src={album_image} />
        <h3><a href={track_uri}>{track_name}</a> by <a href={artist_uri}>{artist_name}</a></h3>
        <h3><a href={album_uri}>{album_name}</a></h3>
        <h3>ID: {id} | Duration: {duration_ms}</h3>
        <NowPlayingControls />
      </div>
    );
  }
}

class NowPlayingControls extends Component {
  render = () => {
    return (
      <div>
        <button onClick={() => window.Spotify.PlayerInstance.resume()}>Resume</button>
        <button onClick={() => window.Spotify.PlayerInstance.pause()}>Pause</button>
        <button onClick={() => window.Spotify.PlayerInstance.previousTrack()}>Previous Track</button>
        <button onClick={() => window.Spotify.PlayerInstance.nextTrack()}>Next Track</button>
      </div>
    );
  }
}

class CollectUserAccessToken extends Component {
  submitForm = (e) => {
    e.preventDefault();
    this.props.setUserAccessToken(this.userInput.value);
  }

  render = () => {
    return (
      <form onSubmit={this.submitForm}>
        <label>
          <h3>Enter User Access Token</h3>
          <input type="text" name="userAccessToken" ref={(c) => this.userInput = c} />
        </label>
        <button type="submit">Submit</button>
      </form>
    );
  }
}

class App extends Component {
  state = {
    userAccessToken: null,
    playerState: null
  }

  onPlayerReady = (data) => {
    console.log("player ready", data);
  }

  onPlayerStateChange = (playerState) => {
    this.setState({ playerState: playerState });
  }

  render = () => {
    let {
      userAccessToken,
      playerState,
      playerState: { track_window }
    } = this.state;

    return (
      <div className="App">
        {!userAccessToken && <CollectUserAccessToken setUserAccessToken={(token) => this.setState({ userAccessToken: token })} />}
        {userAccessToken && <WebPlayback
          playerName="Bilawal's React Player"
          playerInitialVolume={1.0}
          playerAutoConnect={true}
          userAccessToken={userAccessToken}
          onPlayerReady={this.onPlayerReady}
          onPlayerStateChange={this.onPlayerStateChange}>
          <h1>Web Playback SDK</h1>
          {playerState && <NowPlayingView track_window={track_window} />}
        </WebPlayback> }
      </div>
    );
  }
}

export default App;
