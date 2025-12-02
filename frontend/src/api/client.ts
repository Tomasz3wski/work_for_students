const BASE_URL = "http://localhost:8080";

export async function testConnection() {
  const res = await fetch(`${BASE_URL}/test`);
  if (!res.ok) throw new Error("Błąd połączenia");
  return res.text();
}
