import { DefaultButton, PrimaryButton } from "@fluentui/react/lib/Button";
import React from "react";
import "./App.css";
import Subscribe from "./subscribe";
import Unsubscribe from "./unsubscribe";

function App() {
  const [isSubscriptionMode, setIsSubscriptionMode] = React.useState(null);

  return (
    <div className="main">
      {isSubscriptionMode === null && <>
        <b>Welcome to My Jab slots' notifier!</b>
        <PrimaryButton onClick={() => setIsSubscriptionMode(true)}>Subscribe</PrimaryButton>
        <p className="success"><b>Once you subscribe, you will start getting hourly emails about vaccine slots' availability according to the filters you select!</b></p>
        <DefaultButton onClick={() => setIsSubscriptionMode(false)}>Unsubscribe</DefaultButton>
        <p className="failure">To stop getting emails at any time, you can unsubscribe to the service!</p>
      </>}
      {isSubscriptionMode === true && <Subscribe />}
      {isSubscriptionMode === false && <Unsubscribe />}
    </div>
  );
}

export default App;