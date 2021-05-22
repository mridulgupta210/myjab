import React from "react";
import "./App.css";
import { PrimaryButton } from "@fluentui/react/lib/Button";
import ByDistrict from "./byDistrict";

export default function Subscribe() {
  const [byPincode, setByPincode] = React.useState(true);

  const [formValues, setFormValues] = React.useState({ filters: {} });
  const [formSubmitted, setFormSubmitted] = React.useState(false);

  const [showSuccess, setShowSuccess] = React.useState(false);
  const [showFailure, setShowFailure] = React.useState(false);

  let selectedDistricts = [];

  const postUser = () => {
    const user = {
      username: formValues.name,
      email: formValues.email,
      pincode: byPincode ? +formValues.pincode : undefined,
      districts: byPincode ? undefined : selectedDistricts,
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
    if ((byPincode && !formValues.pincode?.trim()) || (!byPincode && selectedDistricts.length === 0)) {
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

  return (
    <div className="main">
      <b>Please enter your details to receive email notifications as soon as vaccines slots become available in your area.</b>
      <form className="main" onSubmit={handleSubmit}>
        <label className="group">
          Name: &nbsp;
          <input type="text" name="name" value={formValues.name} onChange={handleChange} required />
        </label>

        <label className="group">
          Email: &nbsp;
          <input type="email" name="email" value={formValues.email} onChange={handleChange} required />
        </label>

        <label>
          <b>Filter on the vaccination you want based on:</b><br />
          <div>
            Age:
            <div className="subchoice">
              <label><input type="radio" name="filter.age" value={undefined} checked={!formValues.filters.age} onChange={handleChange} /> All</label>
              <label><input type="radio" name="filter.age" value="18" checked={formValues.filters.age === "18"} onChange={handleChange} /> 18 - 45</label>
              <label><input type="radio" name="filter.age" value="45" checked={formValues.filters.age === "45"} onChange={handleChange} /> 45+</label>
            </div>
          </div>
          <div>
            Vaccine type:
            <div className="subchoice">
              <label><input type="radio" name="filter.vaccinetype" value={undefined} checked={!formValues.filters.vaccinetype} onChange={handleChange} /> All</label>
              <label><input type="radio" name="filter.vaccinetype" value="COVISHIELD" checked={formValues.filters.vaccinetype === "COVISHIELD"} onChange={handleChange} /> Covishield</label>
              <label><input type="radio" name="filter.vaccinetype" value="COVAXIN" checked={formValues.filters.vaccinetype === "COVAXIN"} onChange={handleChange} /> Covaxin</label>
              <label><input type="radio" name="filter.vaccinetype" value="SPUTNIKV" checked={formValues.filters.vaccinetype === "SPUTNIKV"} onChange={handleChange} /> Sputnik V</label>
            </div>
          </div>
          <div>
            Fee type:
            <div className="subchoice">
              <label><input type="radio" name="filter.feetype" value={undefined} checked={!formValues.filters.feetype} onChange={handleChange} /> All</label>
              <label><input type="radio" name="filter.feetype" value="Free" checked={formValues.filters.feetype === "Free"} onChange={handleChange} /> Free</label>
              <label><input type="radio" name="filter.feetype" value="Paid" checked={formValues.filters.feetype === "Paid"} onChange={handleChange} /> Paid</label>
            </div>
          </div>
          <div>
            Dose type:
            <div className="subchoice">
              <label><input type="radio" name="filter.dosetype" value={undefined} checked={!formValues.filters.dosetype} onChange={handleChange} /> All</label>
              <label><input type="radio" name="filter.dosetype" value="1" checked={formValues.filters.dosetype === "1"} onChange={handleChange} /> Dose 1</label>
              <label><input type="radio" name="filter.dosetype" value="2" checked={formValues.filters.dosetype === "2"} onChange={handleChange} /> Dose 2</label>
            </div>
          </div>
        </label>

        <label className="group">
          <b>Check your nearest vaccination center and slots availability</b><br />
          <div className="subchoice">
            <label><input type="radio" name="byPincode" value={true} checked={byPincode} onChange={() => setByPincode(true)} /> By pincode</label>
            <label><input type="radio" name="byDistrict" value={false} checked={!byPincode} onChange={() => setByPincode(false)} /> By district</label>
          </div>
        </label>

        {byPincode && <label className="group">
          Pincode: &nbsp;
          <input type="text" name="pincode" value={formValues.pincode} onChange={handleChange} />
        </label>}

        {!byPincode && <ByDistrict totalSelectedDistricts={x => { selectedDistricts = x; }} />}

        <PrimaryButton text="Submit" type="submit" disabled={formSubmitted} />
      </form>
      {showSuccess && <div className="success">Submission successful! You will start receiving email notifications soon.</div>}
      {showFailure && <div className="failure">Submission failed!! Details mentioned already exist.</div>}
    </div>
  );
}
