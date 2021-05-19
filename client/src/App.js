import React from "react";
import "./App.css";
import Subscribe from "./subscribe";
import Unsubscribe from "./unsubscribe";

function App() {
  const [isSubscriptionMode, setIsSubscriptionMode] = React.useState(null);

  return (
    <div className="main">
      {isSubscriptionMode === null && <>
        <span>Welcome to My jab alert!</span>
        <button onClick={() => setIsSubscriptionMode(true)}>Subscribe</button>
        <button onClick={() => setIsSubscriptionMode(false)}>Unsubscribe</button>
      </>}
      {isSubscriptionMode === true && <Subscribe />}
      {isSubscriptionMode === false && <Unsubscribe />}
    </div>
  );
}

export default App;