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
      let { type: child_type } = child.props;

      switch (child_type) {
        case 'Error':
          return React.cloneElement(child, { errorMessage: this.state.error });
        case 'Loading':
          return (
            <WebPlaybackLoading type="Loading" setLoadingState={this.setLoadingState}>
              {this.props.children}
            </WebPlaybackLoading>
          );
        case 'WaitingForDevice':
          return (
            <WebPlaybackWaitingForDevice type="WaitingForDevice" {...this.props}>
              {this.props.children}
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

  getViewState = (state) => {
    return this.childrenWithAddedProps().filter(child => {
      return state === child.props.type;
    })[0];
  }

  render = () => {
    let result = (
      <div>
        {this.state.error && this.getViewState("Error")}
        {!this.state.loaded && this.getViewState("Loading")}
        {this.state.loaded && !this.state.selected && this.getViewState("WaitingForDevice")}
        {this.state.loaded && this.state.selected && this.getViewState("Player")}
      </div>
    );

    return result;
  }
}

export {
  WebPlaybackScreen,
  WebPlayback
};
