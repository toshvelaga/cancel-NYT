const express = require('express') // call express
const app = express() // define our app using express
const cors = require('cors')
const WebSocket = require('ws')
const EventEmitter = require('events').EventEmitter
require('dotenv').config()

const nytKeyword = 'next'

//Configure Transcription Request for Google Speech to Text
const request = {
  config: {
    encoding: 'MULAW',
    sampleRateHertz: 8000,
    languageCode: 'en',
  },
  interimResults: true, // If you want interim results, set this to true
}

//Include Google Speech to Text
const speech = require('@google-cloud/speech')
const googleSpeechClient = new speech.SpeechClient()

// Include Twilio
const twilioClient = require('twilio')(
  process.env.accountSid,
  process.env.authToken
)

// Create a new Event Emitter
const ee = new EventEmitter()

// init callSid, userPhoneNumber, and keywords
let callSid = null
let userPhoneNumber = null
let keywords = null

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

const PORT = process.env.PORT || 5001
const WS_PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT} for REST API requests`)
})

const wss = new WebSocket.Server({ port: WS_PORT }, () => {
  console.log(`Listening on PORT ${WS_PORT} for websockets`)
})

// REPLACE THIS WITH YOUR NGROK URL
let ngrokURL = '8125-2603-8080-9b06-8b00-4c8b-4cf4-478b-185b.ngrok.io'
// ngrokURL = 'http://localhost:3001/'

// rest api that sends twilio text message ==> create a phone call to a business and streams the audio through websocket ==> after hearing the keyword in the stream, update the call to forward the call to the user
app.post('/api/call', async (req, res) => {
  const userPhoneNumber = req.body.userPhoneNumber
  const businessPhoneNumber = req.body.businessPhoneNumber
  const pressDigitsOnKeypad = req.body.pressDigitsOnKeypad
    ? req.body.pressDigitsOnKeypad
    : 'w'
  const keywords = req.body.keywords

  // sends text message to your personal phone number
  await twilioClient.messages
    .create({
      body: 'Thank you for sending this text message.',
      to: `+1${userPhoneNumber}`,
      from: `+1${process.env.twilioPhoneNumber}`,
    })
    .then((message) => console.log(message.sid))

  // calls the businessPhoneNumber and streams the audio through websocket
  const callSid = await twilioClient.calls
    .create({
      twiml: `
      <Response>
        <Connect>
          <Stream url="wss://${ngrokURL}"/>
        </Connect>
      </Response>`,
      to: `+1${businessPhoneNumber}`,
      from: `+1${process.env.twilioPhoneNumber}`,
      // use sendDigits if there is a series of digits the user needs to press on the keypad at the start of the call (w represents a pause for .5 seconds)
      // https://www.twilio.com/docs/voice/twiml/number#attributes-sendDigits
      sendDigits: pressDigitsOnKeypad,
    })
    .then((call) => {
      console.log(call)
      return call.sid
    })
    .catch((err) => console.log(err))

  // node event emiter
  ee.emit('call', {
    callSid: callSid,
    userPhoneNumber: userPhoneNumber,
    businessPhoneNumber: businessPhoneNumber,
    keywords: keywords,
  })

  res.json({ callSid: callSid })
})

// updates the phone call to stop the audio stream and forward the call to the user
const stopStream = async (callSid, userPhoneNumber) => {
  return await twilioClient
    .calls(callSid)
    .update({
      twiml: `
      <Response>
        <Stop>
          <Stream name="stream" url="wss://${ngrokURL}"/>
        </Stop>
        <Dial>
          <Number>${userPhoneNumber}</Number>
        </Dial>
      </Response>`,
    })
    .then((call) => console.log(call))
    .catch((err) => console.log(err))
}

// recieves the data from the node event emitter
ee.on('call', function (data) {
  callSid = data.callSid
  userPhoneNumber = data.userPhoneNumber
  businessPhoneNumber = data.businessPhoneNumber
  keywords = data.keywords
})

// websocket that streams the audio from the call
wss.on('connection', function connection(ws) {
  console.log('New Connection Initiated')

  let recognizeStream = null

  ws.on('message', function incoming(message) {
    const msg = JSON.parse(message)
    // use num to run the stopStream function only once
    let num = 0

    switch (msg.event) {
      case 'connected':
        console.log(`A new call has connected.`)
        break
      case 'start':
        console.log(`Starting Media Stream ${msg.streamSid}`)
        // Create stream to the Google Speech to Text API
        recognizeStream = googleSpeechClient
          .streamingRecognize(request)
          .on('error', console.error)
          .on('data', (data) => {
            let streamMsg = data.results[0].alternatives[0].transcript
            // logs stream in real time
            console.log(streamMsg)
            // if the keyword is present, the stream will stop and the call will be forwarded to your personal phone number
            if (streamMsg.includes(keywords) && num == 0) {
              stopStream(callSid, userPhoneNumber)
              console.log(`keyword ${keywords} detected!`)
              num++
              return
            }
            // sends the transcribed text to the react frontend
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(
                  JSON.stringify({
                    event: 'interim-transcription',
                    text: data.results[0].alternatives[0].transcript,
                  })
                )
              }
            })
          })
        break
      case 'media':
        // Write Media Packets to the recognize stream
        recognizeStream.write(msg.media.payload)
        break
      case 'stop':
        console.log(`Call Has Ended`)
        recognizeStream.destroy()
        break
    }
  })
})
