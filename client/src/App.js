import React from "react";
import "./App.css";

function App() {
  const [formValues, setFormValues] = React.useState({});
  const [formSubmitted, setFormSubmitted] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [showFailure, setShowFailure] = React.useState(false);

  const postUser = () => {
    const user = {
      username: formValues.name,
      email: formValues.email,
      pincode: +formValues.pincode
    };

    fetch("/users/add", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    })
      .then((res) => {
        if (res.status === 200) {
          setShowSuccess(true);
        } else {
          setShowFailure(true);
        }
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormSubmitted(true);
    postUser();
  }

  const handleChange = (event) => {
    setFormValues({ ...formValues, [event.target.name]: event.target.value });
  }

  const deleteRecord = () => {
    fetch(`/users/remove/${formValues.email}`, {
      method: 'Delete',
    }).then((res) => {
      window.location.reload();
    });
  }

  return (
    <div className="main">
      Please enter your details to receive email notifications as soon as vaccines slots become available in your area.
      <form className="main" onSubmit={handleSubmit}>
        <label>
          Name: &nbsp;
          <input type="text" name="name" value={formValues.name} onChange={handleChange} required />
        </label>

        <label>
          Email: &nbsp;
          <input type="text" name="email" value={formValues.email} onChange={handleChange} required />
        </label>

        <label>
          Pincode: &nbsp;
          <input type="text" name="pincode" value={formValues.pincode} onChange={handleChange} required />
        </label>

        <input type="submit" value="Submit" disabled={formSubmitted} />
      </form>
      {showSuccess && <div className="success">Submission successful! You will start receiving email notifications soon.</div>}
      {showFailure && <div className="failure">Submission failed!! Details mentioned already exist. Would you like to delete existing record? <button onClick={deleteRecord}>Yes</button></div>}
    </div>
  );
}

export default App;