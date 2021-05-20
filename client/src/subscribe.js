import React from "react";
import "./App.css";

export default function Subscribe() {
  const [states, setStates] = React.useState([]);
  const [selectedState, setSelectedState] = React.useState();

  const [districts, setDistricts] = React.useState([]);
  const [selectedDistrict, setSelectedDistrict] = React.useState();

  const [byPincode, setByPincode] = React.useState(true);

  const [formValues, setFormValues] = React.useState({});
  const [formSubmitted, setFormSubmitted] = React.useState(false);

  const [showSuccess, setShowSuccess] = React.useState(false);
  const [showFailure, setShowFailure] = React.useState(false);

  React.useEffect(() => {
    fetch("https://cdn-api.co-vin.in/api/v2/admin/location/states")
      .then(res => res.json())
      .then(res => {
        setStates(res.states);
        setSelectedState(res.states[0].state_id.toString());
        getDistricts(res.states[0].state_id);
      })
  }, []);

  const getDistricts = (stateId) => {
    fetch(`https://cdn-api.co-vin.in/api/v2/admin/location/districts/${stateId}`)
      .then(res => res.json())
      .then(res => {
        setDistricts(res.districts);
        setSelectedDistrict(res.districts[0].district_id.toString());
      })
  }

  const postUser = () => {
    const user = {
      username: formValues.name,
      email: formValues.email,
      pincode: byPincode ? +formValues.pincode : undefined,
      district: byPincode ? undefined : +selectedDistrict
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
    if ((byPincode && !formValues.pincode?.trim()) || (!byPincode && (!selectedDistrict?.trim() || !selectedState?.trim()))) {
      alert("Please enter pincode or select a district!!");
    } else {
      setFormSubmitted(true);
      postUser();
    }
  }

  const handleChange = (event) => {
    setFormValues({ ...formValues, [event.target.name]: event.target.value });
  }

  const onStateSelect = e => {
    const state = e.target.value;
    setSelectedState(state);
    getDistricts(state);
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
          Check your nearest vaccination center and slots availability
          <input type="radio" name="byPincode" value={true} checked={byPincode} onChange={() => setByPincode(true)} />
          <label>By pincode</label>
          <input type="radio" name="byDistrict" value={false} checked={!byPincode} onChange={() => setByPincode(false)} />
          <label>By district</label>
        </label>

        {byPincode && <label>
          Pincode: &nbsp;
          <input type="text" name="pincode" value={formValues.pincode} onChange={handleChange} />
        </label>}

        {!byPincode &&
          <>
            <label>State</label>
            <select value={selectedState} onChange={onStateSelect}>
              {states.map(state => <option value={state.state_id}>{state.state_name}</option>)}
            </select>
            <label>District</label>
            <select value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)}>
              {districts.map(district => <option value={district.district_id}>{district.district_name}</option>)}
            </select>
          </>
        }

        <input type="submit" value="Submit" disabled={formSubmitted} />
      </form>
      {showSuccess && <div className="success">Submission successful! You will start receiving email notifications soon.</div>}
      {showFailure && <div className="failure">Submission failed!! Details mentioned already exist.</div>}
    </div>
  );
}
