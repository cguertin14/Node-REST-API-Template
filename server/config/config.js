const env = process.env.NODE_ENV || 'development';
import { FACEBOOK as fb } from './json/social.json';


if (env === 'development' || env === 'test') {
    let config = require('./json/config.json');
    let envConfig = config[env];

    Object.keys(envConfig).forEach(key => process.env[key] = envConfig[key]);
}

if (env === 'production') {
    process.env.URL = 'https://nightplanner-api.herokuapp.com';
} else if (env === 'development') {
    process.env.URL = 'http://localhost:3000';
}

process.env.FB = JSON.stringify(fb);