import { useEffect, useState } from "react";
import { testConnection } from "./api/client";

export default function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    testConnection()
      .then(setMessage)
      .catch((err) => setMessage("Błąd połączenia"));
  }, []);

  return (
    <div>
      <h1>Strona główna</h1>
      <p>Backend mówi: {message}</p>
    </div>
  );
}
