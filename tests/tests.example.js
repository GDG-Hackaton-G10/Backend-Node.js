import assert from "node:assert/strict";
import { once } from "node:events";
import app from "../src/app.js";

const server = app.listen(0);
await once(server, "listening");

const { port } = server.address();

const request = async (path, options = {}) => {
  const response = await fetch(`http://127.0.0.1:${port}${path}`, options);
  const payload = await response.json();

  return { status: response.status, payload };
};

try {
  const health = await request("/health");
  assert.equal(health.status, 200);
  assert.equal(health.payload.success, true);

  const missingRoute = await request("/missing");
  assert.equal(missingRoute.status, 404);
  assert.equal(missingRoute.payload.error.code, "ROUTE_NOT_FOUND");

  const registerValidation = await request("/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.equal(registerValidation.status, 400);
  assert.equal(registerValidation.payload.error.code, "BAD_REQUEST");

  const loginValidation = await request("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.equal(loginValidation.status, 400);
  assert.equal(loginValidation.payload.error.code, "BAD_REQUEST");

  const refreshValidation = await request("/api/v1/auth/refresh-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.equal(refreshValidation.status, 400);
  assert.equal(refreshValidation.payload.error.code, "BAD_REQUEST");

  const logoutUnauthorized = await request("/api/v1/auth/logout", {
    method: "POST",
  });
  assert.equal(logoutUnauthorized.status, 401);
  assert.equal(logoutUnauthorized.payload.error.code, "UNAUTHORIZED");

  const medicineUnauthorized = await request("/api/v1/medicines/search?q=panadol");
  assert.equal(medicineUnauthorized.status, 401);
  assert.equal(medicineUnauthorized.payload.error.code, "UNAUTHORIZED");

  const pharmacyUnauthorized = await request("/api/v1/pharmacies/nearby?lat=1&lng=2");
  assert.equal(pharmacyUnauthorized.status, 401);
  assert.equal(pharmacyUnauthorized.payload.error.code, "UNAUTHORIZED");

  const prescriptionUnauthorized = await request("/api/v1/prescriptions/upload", {
    method: "POST",
  });
  assert.equal(prescriptionUnauthorized.status, 401);
  assert.equal(prescriptionUnauthorized.payload.error.code, "UNAUTHORIZED");

  console.log("Smoke tests passed");
} finally {
  server.close();
}
