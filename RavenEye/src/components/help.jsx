import React, { useState, useEffect } from "react";

const Help = () => {
  const [clientInfo, setClientInfo] = useState(null);

  useEffect(() => {
    fetch("https://api.ipify.org/?format=json")
      .then(response => response.json())
      .then(data => {
        const ipAddress = data.ip;
        const systemInfo = `${navigator.platform}`;
        const info = {
          ipAddress,
          systemInfo
        };
        setClientInfo(info);
      })
      .catch(error => console.error("Error fetching client info:", error));
  }, []);

  return (
    <>
      <ul>
        <li>help - Do you need a fkin manual now!</li>
        <li>Leave this site immediately</li>
        {clientInfo && (
          <>
            <li>Your ip address: {clientInfo.ipAddress}</li>
            <li>Your System: {clientInfo.systemInfo}</li>
            <li>Sending your information to the Servers...</li>
          </>
        )}
      </ul>
    </>
  );
};

export default Help;
