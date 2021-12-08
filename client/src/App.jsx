import { useState } from 'react'
import TextInput from './components/TextInput'
import Button from './components/Button'
import './App.css'

function App() {
  const [userPhoneNumber, setuserPhoneNumber] = useState('')

  const onPhoneNumberChangeHandler = (e) => {
    const re = /^[0-9\b]+$/
    if (e.target.value === '' || re.test(e.target.value)) {
      setuserPhoneNumber(e.target.value)
    }
  }

  const onSubmitHandler = async () => {
    if (!userPhoneNumber) {
      alert('Please enter your phone number')
    } else if (userPhoneNumber.length < 10) {
      alert('Please enter a valid phone number')
    } else if (userPhoneNumber.length === 10) {
      alert('Thank you for your submission')
    }
  }

  return (
    <div className='App'>
      <h1 className='heading'>Cancel the New York Times</h1>
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
        onClick={onSubmitHandler}
        title='Submit'
        style={{ width: '100%' }}
      />
    </div>
  )
}

export default App
