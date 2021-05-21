import React from "react";
import "./App.css";

export default function Subscribe() {
  const [states, setStates] = React.useState([]);
  const [selectedState, setSelectedState] = React.useState();

  const [districts, setDistricts] = React.useState([]);
  const [selectedDistrict, setSelectedDistrict] = React.useState();

  const [byPincode, setByPincode] = React.useState(true);

  const [formValues, setFormValues] = React.useState({ filters: {} });
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
      district: byPincode ? undefined : +selectedDistrict,
      filters: {
        age: formValues.filters.age ? +formValues.filters.age : undefined,
        vaccinetype: formValues.filters.vaccinetype,
        feetype: formValues.filters.feetype,
        dosetype: formValues.filters.dosetype ? +formValues.filters.dosetype : undefined
      }
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
    if (event.target.name.includes("filter.")) {
      const [, field] = event.target.name.split(".");

      setFormValues(Object.assign({}, formValues, {
        filters: Object.assign({}, formValues.filters, {
          [field]: event.target.value
        })
      }));
    } else {
      setFormValues({ ...formValues, [event.target.name]: event.target.value });
    }
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
        <label className="group">
          Name: &nbsp;
          <input type="text" name="name" value={formValues.name} onChange={handleChange} required />
        </label>

        <label className="group">
          Email: &nbsp;
          <input type="text" name="email" value={formValues.email} onChange={handleChange} required />
        </label>

        <label className="group">
          Drill down on the vaccination you want based on:<br />
          <div className="subchoice">
            Age: &nbsp;
            <input type="radio" name="filter.age" value={undefined} checked={!formValues.filters.age} onChange={handleChange} />
            <label>All</label>
            <input type="radio" name="filter.age" value="18" checked={formValues.filters.age === "18"} onChange={handleChange} />
            <label>18 - 45 only</label>
            <input type="radio" name="filter.age" value="45" checked={formValues.filters.age === "45"} onChange={handleChange} />
            <label>45+ only</label>
          </div>
          <div className="subchoice">
            Vaccine type: &nbsp;
            <input type="radio" name="filter.vaccinetype" value={undefined} checked={!formValues.filters.vaccinetype} onChange={handleChange} />
            <label>All</label>
            <input type="radio" name="filter.vaccinetype" value="COVISHIELD" checked={formValues.filters.vaccinetype === "COVISHIELD"} onChange={handleChange} />
            <label>Covishield</label>
            <input type="radio" name="filter.vaccinetype" value="COVAXIN" checked={formValues.filters.vaccinetype === "COVAXIN"} onChange={handleChange} />
            <label>Covaxin</label>
            <input type="radio" name="filter.vaccinetype" value="SPUTNIKV" checked={formValues.filters.vaccinetype === "SPUTNIKV"} onChange={handleChange} />
            <label>Sputnik V</label>
          </div>
          <div className="subchoice">
            Fee type: &nbsp;
            <input type="radio" name="filter.feetype" value={undefined} checked={!formValues.filters.feetype} onChange={handleChange} />
            <label>All</label>
            <input type="radio" name="filter.feetype" value="Free" checked={formValues.filters.feetype === "Free"} onChange={handleChange} />
            <label>Free</label>
            <input type="radio" name="filter.feetype" value="Paid" checked={formValues.filters.feetype === "Paid"} onChange={handleChange} />
            <label>Paid</label>
          </div>
          <div className="subchoice">
            Dose type: &nbsp;
            <input type="radio" name="filter.dosetype" value={undefined} checked={!formValues.filters.dosetype} onChange={handleChange} />
            <label>All</label>
            <input type="radio" name="filter.dosetype" value="1" checked={formValues.filters.dosetype === "1"} onChange={handleChange} />
            <label>Dose 1</label>
            <input type="radio" name="filter.dosetype" value="2" checked={formValues.filters.dosetype === "2"} onChange={handleChange} />
            <label>Dose 2</label>
          </div>
        </label>

        <label className="group">
          Check your nearest vaccination center and slots availability<br />
          <div className="subchoice">
            <input type="radio" name="byPincode" value={true} checked={byPincode} onChange={() => setByPincode(true)} />
            <label>By pincode</label>
            <input type="radio" name="byDistrict" value={false} checked={!byPincode} onChange={() => setByPincode(false)} />
            <label>By district</label>
          </div>
        </label>

        {byPincode && <label className="group">
          Pincode: &nbsp;
          <input type="text" name="pincode" value={formValues.pincode} onChange={handleChange} />
        </label>}

        {!byPincode &&
          <div className="group column">
            <div className="group">
              <label>State: &nbsp;</label>
              <select value={selectedState} onChange={onStateSelect}>
                {states.map(state => <option value={state.state_id}>{state.state_name}</option>)}
              </select>
            </div>
            <div className="group">
              <label>District: &nbsp;</label>
              <select value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)}>
                {districts.map(district => <option value={district.district_id}>{district.district_name}</option>)}
              </select>
            </div>
          </div>
        }

        <input type="submit" value="Submit" disabled={formSubmitted} />
      </form>
      {showSuccess && <div className="success">Submission successful! You will start receiving email notifications soon.</div>}
      {showFailure && <div className="failure">Submission failed!! Details mentioned already exist.</div>}
    </div>
  );
}
