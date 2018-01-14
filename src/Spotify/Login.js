export default {
  logInWithSpotify: (() => {
    let client_id      = "bad9e04cf07e4ac89c75a71999f18955";
    let redirect_uri   = "https://spotify-web-playback-react.glitch.me";
    let scopes         = "streaming user-read-birthdate user-read-email user-read-private user-modify-playback-state";
    let scopes_encoded = scopes.replace(" ", "%20");

    window.location = [
      "https://accounts.spotify.com/authorize",
      `?client_id=${client_id}`,
      `&redirect_uri=${redirect_uri}`,
      `&scope=${scopes_encoded}`,
      "&response_type=token",
      "&show_dialog=true"
    ].join('');
  })
};