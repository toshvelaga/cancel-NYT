Cancel your New York Times subscription. Built using react, vitejs, node, websockets (ws), twilio, and google speech to text.

Here's the corresponding [Medium article]() with a detailed explanation.

<span style="display:block" class="note">
  <img src="https://readmeassets.s3.us-east-2.amazonaws.com/Screen+Shot+2021-12-08+at+8.59.41+PM.png">
</span>

# Start client

```
cd client
npm install
npm run dev
```

# Start server

- create an .env file in the server folder with the variables in .env.sample
- add a [service account](https://cloud.google.com/iam/docs/creating-managing-service-account-keys) json file to enable google speech to text. Name the file googleKey.json

```
cd server
npm install
nodemon server.js
```
