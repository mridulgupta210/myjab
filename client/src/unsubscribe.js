import React from "react";
import "./App.css";

export default function Unsubscribe() {
  const [formValues, setFormValues] = React.useState({});
  const [formSubmitted, setFormSubmitted] = React.useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormSubmitted(true);
    deleteRecord();
  }

  const handleChange = (event) => {
    setFormValues({ ...formValues, [event.target.name]: event.target.value });
  }

  const deleteRecord = () => {
    fetch(`/users/remove/${formValues.email}`, {
      method: 'PUT',
    }).then(() => {
      window.location.reload();
    });
  }

  return (
    <div className="main">
      Please enter your email to stop receiving notifications.
      <form className="main" onSubmit={handleSubmit}>
        <label>
          Email: &nbsp;
          <input type="text" name="email" value={formValues.email} onChange={handleChange} required />
        </label>
        <input type="submit" value="Submit" disabled={formSubmitted} />
      </form>
    </div>
  );
}
