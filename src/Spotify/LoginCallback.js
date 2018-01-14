export default (callbacks) => {
  let { location: {hash} } = window;
  let hashExists = hash.length > 0;
  let hashObj = hash.substring(1).split('&').reduce((initial, item) => {
    if (item) {
      const parts = item.split('=');
      initial[parts[0]] = decodeURIComponent(parts[1]);
    }
    return initial;
  }, {});

  if (hashExists) {
    window.location.hash = '';
        
    // Let us know it's a successful authorization
    if (typeof callbacks.onSuccessfulAuthorization !== "undefined") {
      callbacks.onSuccessfulAuthorization(hashObj.access_token);
    }

    // Let us know when the access token expires
    setTimeout(() => {
      if (typeof callbacks.onAccessTokenExpiration !== "undefined") {
        callbacks.onAccessTokenExpiration();
      }
    }, hashObj.expires_in * 1000);

    return hashObj.access_token;
  }
  else {
    return null;
  }
};