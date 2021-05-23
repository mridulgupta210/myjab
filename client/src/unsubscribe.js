import { PrimaryButton } from "@fluentui/react/lib/Button";
import React from "react";
import "./App.css";

export default function Unsubscribe() {
  const [formValues, setFormValues] = React.useState({});
  const [formSubmitted, setFormSubmitted] = React.useState(false);
  const [failureMsg, setFailureMsg] = React.useState(null);

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
    }).then(res => res.json())
    .then(() => {
      window.location.reload();
    }).catch(() => {
      setFailureMsg("No subscription found! To start the service, click here");
    });
  }

  return (
    <div className="main">
      Please enter your email to stop receiving notifications.
      <form className="main" onSubmit={handleSubmit}>
        <label>
          Email: &nbsp;
          <input pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
            title="Invalid email format"
            type="email" name="email" value={formValues.email} onChange={handleChange} required />
        </label>
        <PrimaryButton type="submit" text="Submit" disabled={formSubmitted} />
        {failureMsg && <div className="failure">{failureMsg}</div>}
      </form>
    </div>
  );
}
