import React from 'react'
import './Button.css'

function Button(props) {
  return (
    <>
      <button
        disabled={props.disabled}
        style={props.style}
        className='button'
        onClick={props.fx}
      >
        {props.loading ? <div class='loader'></div> : null}
        {props.title}
      </button>
    </>
  )
}

export default Button
