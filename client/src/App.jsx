import { useState } from 'react'
import TextInput from './components/TextInput'
import Button from './components/Button'
import axios from 'axios'
import './App.css'

function App() {
  const [userPhoneNumber, setuserPhoneNumber] = useState('')
  const [loading, setloading] = useState(false)

  const onPhoneNumberChangeHandler = (e) => {
    const re = /^[0-9\b]+$/
    if (e.target.value === '' || re.test(e.target.value)) {
      setuserPhoneNumber(e.target.value)
    }
  }

  const onSubmitHandler = async () => {
    const body = {
      userPhoneNumber,
      // the businessPhoneNumber here is for the NYT
      businessPhoneNumber: '8662733612',
      keywords: 'next',
    }
    if (!userPhoneNumber) {
      alert('Please enter your phone number')
    } else if (userPhoneNumber.length < 10) {
      alert('Please enter a valid phone number')
    } else if (userPhoneNumber.length === 10) {
      try {
        setloading(true)
        axios.post('http://localhost:5001/api/call', body)
      } catch (error) {
        console.log(error)
      } finally {
        setloading(false)
      }
    }
  }

  return (
    <div className='App'>
      <h1 className='heading'>Cancel the New York Times</h1>
      <p>
        Enter your phone number and you will get connected to someone who works
        at the NYT. Avoid the long wait times and having to enter in your
        account information.
      </p>
      <TextInput
        onChange={onPhoneNumberChangeHandler}
        label='Phone Number'
        type='tel'
        maxLength='10'
        placeholder='(915) 833-4100'
        value={userPhoneNumber}
        required
      />
      <Button
        loading={loading}
        onClick={onSubmitHandler}
        title='Submit'
        style={{ width: '100%' }}
      />
    </div>
  )
}

export default App
