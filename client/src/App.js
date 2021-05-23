import { DefaultButton, PrimaryButton } from "@fluentui/react/lib/Button";
import { Link } from 'react-router-dom';
import React from "react";
import "./App.css";

function App() {
  return (
    <div className="main">
      <b>Welcome to My Jab slots' notifier!</b>
      <Link to="/subscribe">
        <PrimaryButton text="Subscribe" />
      </Link>
      <p className="success"><b>Once you subscribe, you will start getting hourly emails about vaccine slots' availability according to the filters you select.</b></p>
      <Link to="/unsubscribe">
        <DefaultButton text="Unsubscribe" />
      </Link>
      <p className="failure">To stop getting emails at any time, you can unsubscribe to the service.</p>
    </div>
  );
}

export default App;