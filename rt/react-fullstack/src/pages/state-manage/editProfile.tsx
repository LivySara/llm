import { useState } from 'react';
export default function EditProfile() {
  const [firstName, setFirstName] = useState('Jane')
  const [lastName, setLastName] = useState('Jacobs')
  const [isEdit, setIsEdit] = useState(false)
  function handleFirstNameChange(e) {
    setFirstName(e.target.value)
  }
  function handleLastNameChange(e) {
    setLastName(e.target.value)
  }
  return (
    <form onSubmit={(e) => {
        e.preventDefault()
    }}>
      <label>
        First name:{ !isEdit ? <input value={firstName} onChange={handleFirstNameChange} /> : <b>{firstName}</b> }
      </label>
      <label>
        Last name:{ !isEdit ? <input value={lastName} onChange={handleLastNameChange} /> : <b>{lastName}</b>}
      </label>
      <button type="submit" onClick={() => setIsEdit(!isEdit)}>
        { isEdit ? 'Save' : 'Edit' } Profile
      </button>
      <p><i>{`Hello, ${firstName} ${lastName}!`}</i></p>
    </form>
  );
}
