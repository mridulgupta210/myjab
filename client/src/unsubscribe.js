import { PrimaryButton, DefaultButton } from "@fluentui/react/lib/Button";
import { useRouteMatch, useHistory, Link } from 'react-router-dom';
import React from "react";
import "./App.css";

export default function Unsubscribe() {
  const match = useRouteMatch();
  const history = useHistory();

  const [formValues, setFormValues] = React.useState({ email: match.params.email });
  const [formSubmitted, setFormSubmitted] = React.useState(false);

  const [showSuccess, setShowSuccess] = React.useState(false);
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
        setShowSuccess(true);
      }).catch(() => {
        setFailureMsg("No subscription found! To start the service, click here:");
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
        <DefaultButton type="submit" text="Submit" disabled={formSubmitted} />
        {showSuccess && <div className="success">You have successfully unsubscribed to the service. Click here to start the service again:</div>}
        {failureMsg && <div className="failure">{failureMsg}</div>}
        {(showSuccess || failureMsg) && <Link to="/subscribe">
          <PrimaryButton text="Subscribe" />
        </Link>}
      </form>
    </div>
  );
}
