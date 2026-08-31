import axios from "axios";

async function main() {
  const code = Buffer.from("print('ByteVerse 2026 Test')").toString("base64");
  try {
    const sub = await axios.post(
      "http://192.168.6.4:2358/submissions?base64_encoded=true",
      { source_code: code, language_id: 71 }
    );
    console.log("Submission token:", sub.data.token);

    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const res = await axios.get(
        `http://192.168.6.4:2358/submissions/${sub.data.token}?base64_encoded=false`
      );
      if (res.data.status.id > 2) {
        console.log("Result status:", res.data.status);
        console.log("Full Result:", JSON.stringify(res.data, null, 2));
        break;
      }
    }
  } catch (err: any) {
    console.error("Error:", err.message, err.response?.data);
  }
}

main();
