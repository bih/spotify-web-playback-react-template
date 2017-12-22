import React, { Component } from 'react';

// Placeholder
window.onSpotifyWebPlaybackSDKReady = () => {};

class WebPlaybackLoader extends Component {
  componentWillMount = () => {
    if (window.Spotify) {
      this.props.setLoadingState(true);
    } else {
      window.onSpotifyWebPlaybackSDKReady = () => {
        this.props.setLoadingState(true);
      };
    }
  }

  render = () => {
    return (<h3>Loading the Web Playback SDK ...</h3>);
  }
}

class WebPlaybackDeviceWait extends Component {
  createSpotifyPlayerInstance = () => {
    window.Spotify.PlayerInstance = new window.Spotify.Player({
      name: this.props.playerName,
      volume: this.props.playerInitialVolume,
      getOAuthToken: callback => {
        callback(this.props.userAccessToken);
      }
    });

    let { PlayerInstance } = window.Spotify;

    PlayerInstance.on("initialization_error", e => { this.props.setErrorState(e.message); });
    PlayerInstance.on("authentication_error", e => { this.props.setErrorState(e.message); });
    PlayerInstance.on("account_error", e => { this.props.setErrorState(e.message); });
    PlayerInstance.on("playback_error", e => { this.props.setErrorState(e.message); });
    PlayerInstance.on("player_state_changed", state => {
      if (this.props.onPlayerStateChange) this.props.onPlayerStateChange(state);
    });
    PlayerInstance.on("ready", data => {
      if (this.props.onPlayerReady) this.props.onPlayerReady(data);
    });
    if (this.props.playerAutoConnect) PlayerInstance.connect();
  }

  componentWillMount = () => {
    if (!window.Spotify.PlayerInstance) {
      this.createSpotifyPlayerInstance();
    }
  }

  render = () => {
    return (<h3>Waiting for Device to Transfer to Web Playback SDK</h3>);
  }
}

class WebPlaybackPlayer extends Component {
  render = () => {
    return this.props.children;
  }
}

class WebPlayback extends Component {
  interval = null

  state = {
    loaded: false,
    selected: false,
    error: null
  }

  setLoadingState = loadingState => {
    this.setState({ loaded: loadingState });

    if (!this.interval) {
      this.interval = setInterval(async () => {
        if (window.Spotify.PlayerInstance) {
          let state = await window.Spotify.PlayerInstance.getCurrentState();
          let isSelected = state !== null;
          this.setState({ selected: isSelected });
        }
      }, 100);
    }
  };

  renderPlayer = () => {
    return (
      <WebPlaybackPlayer setErrorState={(errorState) => this.setState({ error: errorState })} {...this.props}>
        {this.props.children}
      </WebPlaybackPlayer>
    );
  }

  componentWillUnmount = () => {
    if (this.interval) clearInterval(this.interval);
  }

  render = () => {
    return (
      <div>
        {this.state.error && <h3>Error</h3>}
        {this.state.loaded && !this.state.selected && <WebPlaybackDeviceWait {...this.props} />}
        {this.state.loaded && this.state.selected && this.renderPlayer()}
        {!this.state.loaded && <WebPlaybackLoader setLoadingState={this.setLoadingState} />}
      </div>
    );
  }
}

export default WebPlayback;
