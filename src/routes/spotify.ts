import { Router } from "express";
import dotenv from 'dotenv'
import querystring from 'querystring'
import axios from "axios";
dotenv.config()

const generateRandomString = (length: number) => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};
const stateKey = 'spotify_auth_state';
const credentials = {
  id: process.env.SPOTIFY_ID,
  secret: process.env.SPOTIFY_SECRET
}

const routes = Router();

// Initiate a Spotify login request
routes.get('/login', function (req, res) {
  const state = generateRandomString(16);
  const scopes = [
    'user-top-read',
    'user-read-recently-played',
    'user-read-currently-playing',
    'user-library-read',
    'user-read-private',
    'user-read-email',
    'playlist-modify-public'
  ]

  res.cookie(stateKey, state);
  res.status(200).json({
    url: 'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: credentials.id,
      scope: scopes.join(" "),
      redirect_uri: `${process.env.PROJECT_ROOT}/authsuccess`,
      state: state
    })
  });
});

// Get a Spotify access token
routes.get("/token", async (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;

  try {
    if (state === null) {
      // Implement checking state in cookie
      throw new Error('State mismatch');
    }
    else {
      res.clearCookie(stateKey);
      const response = await axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: querystring.stringify({
          code: code as string,
          redirect_uri: `${process.env.PROJECT_ROOT}/authsuccess`,
          grant_type: 'authorization_code'
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(credentials.id + ':' + credentials.secret).toString('base64')}`
        }
      })
      const {access_token, refresh_token} = response.data;
      return res.status(200).json({access_token, refresh_token});
    }
  } 
  catch(err) {
    return res.status(404).json({error: err});
  }
});

// Refresh an access token
routes.get('/refresh', async (req, res) => {
  const refresh_token = req.query.refresh_token;
  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        refresh_token: refresh_token as string,
        redirect_uri: `${process.env.PROJECT_ROOT}/authsuccess`,
        grant_type: 'refresh_token'
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(credentials.id + ':' + credentials.secret).toString('base64')}`
      }
    })
    const {access_token} = response.data;
    return res.status(200).json({access_token});
  }
  catch(err) {
    return res.status(404).json({error: err});
  }
});

export default routes;