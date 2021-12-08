import { useState } from 'react'
import TextInput from './components/TextInput'
import Button from './components/Button'
import './App.css'

function App() {
  const submitHandler = () => {
    alert('Submitted')
  }
  return (
    <div className='App'>
      <h1 className='heading'>Cancel the New York Times</h1>
      <TextInput label='Phone Number' />
      <Button
        onClick={submitHandler}
        title='Submit'
        style={{ width: '100%' }}
      />
    </div>
  )
}

export default App
