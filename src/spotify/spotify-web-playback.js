import React, { Component } from 'react';

// Placeholder
window.onSpotifyWebPlaybackSDKReady = () => {};

class WebPlaybackError extends Component {
  render = () => {
    return this.props.children;
  }
}

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
    return (<h3>Loading the Web Playback SDK ...</h3>);
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
    return (<h3>Waiting for Device to Transfer to Web Playback SDK</h3>);
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

  childrenWithAddedProps = () => {
    return React.Children.map(this.props.children, child => {
      const element_name = child.type.name;

      switch (element_name) {
        case 'WebPlaybackError':
          child = React.cloneElement(child, { setError: this.setLoadingState })
          break;
        case 'WebPlaybackLoading':
          child = React.cloneElement(child, { setLoadingState: this.setLoadingState })
          break;
        case 'WebPlaybackWaitingForDevice':
          child = React.cloneElement(child, this.props);
          break;
        case 'WebPlaybackScreen':
          (async (shouldRun) => {
            if (shouldRun) {
              let playerState = await window.Spotify.PlayerInstance.getCurrentState();
              child = React.cloneElement(child, { playerState: playerState });
            }
          })(typeof window.Spotify.PlayerInstance !== "undefined");
          break;
        default:
          throw new Error("Unrecognised WebPlayback React Component");
          break;
      }

      return child;
    });
  }

  getViewState = (state) => {
    var element;

    this.childrenWithAddedProps().forEach(child => {
      let element_name = child.type.name;
      if (state === element_name) {
        element = child;
      }
    });

    return [ element ];
  }

  render = () => {
    return (
      <div>
        {this.state.error && this.getViewState("WebPlaybackError")}
        {!this.state.loaded && this.getViewState("WebPlaybackLoading")}
        {this.state.loaded && !this.state.selected && this.getViewState("WebPlaybackWaitingForDevice")}
        {this.state.loaded && this.state.selected && this.getViewState("WebPlaybackScreen")}
      </div>
    );
  }
}

export {
  WebPlaybackError,
  WebPlaybackLoading,
  WebPlaybackWaitingForDevice,
  WebPlaybackScreen,
  WebPlayback
};
