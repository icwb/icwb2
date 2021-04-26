require('dotenv').config();

const FBConfig = {
  token: process.env.FACEBOOK_TOKEN,
  appId: process.env.FACEBOOK_APP_ID,
  appSecret: process.env.FACEBOOK_APP_SECRET,
  pageId: process.env.FACEBOOK_PAGE_ID,
}

export default FBConfig;
