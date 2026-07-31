const jwt = require("jsonwebtoken");

const JWT_SECRET = "jasmin_premium_secret_key_123";
const token = jwt.sign({ username: "jasmin1142005" }, JWT_SECRET, { expiresIn: "24h" });

fetch("http://127.0.0.1:3000/api/gallery", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Cookie": "token=" + token
  },
  body: JSON.stringify({
    imageUrl: "https://www.image2url.com/r2/default/images/1785470876616-45625c8f-097d-4c82-9df8-5c11557536f8.png"
  })
})
.then(res => res.json())
.then(data => console.log("Added image:", data))
.catch(err => console.error(err));
