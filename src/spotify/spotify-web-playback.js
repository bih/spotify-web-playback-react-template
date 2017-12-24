import React, { Component } from 'react';

// Placeholder
window.onSpotifyWebPlaybackSDKReady = () => {};

class WebPlaybackLoading extends Component {
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
    return this.props.children;
  }
}

class WebPlaybackWaitingForDevice extends Component {
  createSpotifyPlayerInstance = () => {
    window.Spotify.PlayerInstance = new window.Spotify.Player({
      name: this.props.playerName,
      volume: this.props.playerInitialVolume,
      getOAuthToken: callback => {
        callback(this.props.userAccessToken);
      }
    });

    let { PlayerInstance: instance } = window.Spotify;

    instance.on("initialization_error", e => { this.props.setError(e.message); });
    instance.on("authentication_error", e => { this.props.setError(e.message); });
    instance.on("account_error", e => { this.props.setError(e.message); });
    instance.on("playback_error", e => { this.props.setError(e.message); });
    instance.on("player_state_changed", state => {
      if (this.props.onPlayerStateChange) this.props.onPlayerStateChange(state);
    });
    instance.on("ready", data => {
      if (this.props.onPlayerReady) this.props.onPlayerReady(data);
    });

    if (this.props.playerAutoConnect) {
      instance.connect();
    }
  }

  componentWillMount = () => {
    if (!window.Spotify.PlayerInstance) {
      this.createSpotifyPlayerInstance();
    }
  }

  render = () => {
    return this.props.children;
  }
}

class WebPlaybackScreen extends Component {
  render = () => {
    return this.props.children;
  }
}

class WebPlayback extends Component {
  interval = null

  state = {
    loaded: false, // Has the player loaded?
    selected: false, // Has the player been selected?
    error: null // Has the player thrown an error?
  }

  setLoadingState = loadingState => {
    this.setState({ loaded: loadingState });

    if (!this.interval) {
      this.interval = setInterval(async () => {
        if (window.Spotify.PlayerInstance) {
          let state = await window.Spotify.PlayerInstance.getCurrentState();
          this.setState({ selected: (state !== null) });
          if (this.props.onPlayerStateChange) this.props.onPlayerStateChange(state);
        }
      }, 100);
    }
  };

  componentWillUnmount = () => {
    if (this.interval) clearInterval(this.interval);
  }

  getTypeName = (props) => {
    let prop_keys = Object.keys(props);
    if (prop_keys.includes("Error")) return "Error";
    if (prop_keys.includes("Loading")) return "Loading";
    if (prop_keys.includes("WaitingForDevice")) return "WaitingForDevice";
    if (prop_keys.includes("Player")) return "Player";
    throw new Error(`Unrecognised WebPlayback.Screen type`);
  }

  childrenWithAddedProps = () => {
    return React.Children.map(this.props.children, child => {
      let child_type = this.getTypeName(child.props);

      switch (child_type) {
        case 'Error':
          return React.cloneElement(child, { errorMessage: this.state.error });
        case 'Loading':
          return (
            <WebPlaybackLoading Loading setLoadingState={this.setLoadingState}>
              {child.props.children}
            </WebPlaybackLoading>
          );
        case 'WaitingForDevice':
          return (
            <WebPlaybackWaitingForDevice WaitingForDevice {...this.props}>
              {child.props.children}
            </WebPlaybackWaitingForDevice>
          );
        case 'Player':
          // TODO: Send state as a props for better developer UX
          return child;
        default:
          throw new Error(`Unrecognised WebPlayback.Screen type - ${child_type}`);
      }
    });
  }

  getScreenByTypeName = (type_name) => {
    return this.childrenWithAddedProps().filter(child => {
      return type_name === this.getTypeName(child.props);
    })[0];
  }

  render = () => {
    let result = (
      <div>
        {this.state.error && this.getScreenByTypeName("Error")}
        {!this.state.loaded && this.getScreenByTypeName("Loading")}
        {this.state.loaded && !this.state.selected && this.getScreenByTypeName("WaitingForDevice")}
        {this.state.loaded && this.state.selected && this.getScreenByTypeName("Player")}
      </div>
    );

    return result;
  }
}

export {
  WebPlaybackScreen,
  WebPlayback
};
