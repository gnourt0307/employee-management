document.getElementById("checkinBtn").addEventListener("click", async () => {
  const mac = await window.api.getMacAddress();

  const response = await fetch("http://localhost:3000/checkin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mac }),
  });

  const result = await response.json();
  alert(result.message);
});
