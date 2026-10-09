async function testSolanaRecord() {
  const hash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  const recommendationId = "REC-DEMO-TEST";

  console.log("Testing Solana Devnet Record route...");
  const res = await fetch("http://localhost:3000/api/solana/record", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hash, recommendationId })
  });

  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Response:", data);
}

testSolanaRecord().catch(console.error);
