import { useState } from 'react'
import TextInput from './components/TextInput'
import Button from './components/Button'
import './App.css'

function App() {
  return (
    <div className='App'>
      <h1>Cancel the New York Times</h1>
      <TextInput label='Phone Number' />
      <Button title='Submit' style={{ width: '100%' }} />
    </div>
  )
}

export default App
