const http = require("http");
const { MongoClient } = require("mongodb");

// ✅ Use MongoDB Atlas connection string from Render environment variable
const url = process.env.MONGO_URI;
const client = new MongoClient(url);
const dbName = "lab2_algebra";

// Function to solve equations
async function solveEquation(equation) {
  equation = equation.replace(/\s+/g, "");

  if (!equation.includes("=")) return { success: false, message: "⚠️ Invalid equation" };

  let [lhs, rhs] = equation.split("=");
  rhs = parseFloat(rhs);

  // Case 1: variable first, like "x+5"
  let match1 = lhs.match(/^([a-zA-Z])([\+\-]?\d+)?$/);
  if (match1) {
    const variable = match1[1];
    const num = match1[2] ? parseFloat(match1[2]) : 0;
    const solution = rhs - num;
    return { success: true, solution: `${variable} = ${solution}` };
  }

  // Case 2: number + variable, like "5+x" or "5-x"
  let match2 = lhs.match(/^(\d+)([\+\-])([a-zA-Z])$/);
  if (match2) {
    const num = parseFloat(match2[1]);
    const op = match2[2];
    const variable = match2[3];
    let solution;
    if (op === "+") solution = rhs - num;
    else solution = num - rhs;
    return { success: true, solution: `${variable} = ${solution}` };
  }

  // Case 3: ax+b (like 2x+3=11)
  let match3 = lhs.match(/^(\d*)([a-zA-Z])([\+\-]?\d+)?$/);
  if (match3) {
    const coeff = match3[1] === "" ? 1 : parseFloat(match3[1]);
    const variable = match3[2];
    const constant = match3[3] ? parseFloat(match3[3]) : 0;
    const solution = (rhs - constant) / coeff;
    return { success: true, solution: `${variable} = ${solution}` };
  }

  return { success: false, message: "⚠️ Unsupported equation" };
}

// Start server
async function start() {
  await client.connect();
  console.log("✅ MongoDB connected");
  const db = client.db(dbName);
  const attempts = db.collection("attempts");

  const server = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.url === "/solve" && req.method === "POST") {
      let body = "";
      req.on("data", chunk => (body += chunk.toString()));
      req.on("end", async () => {
        try {
          const { equation } = JSON.parse(body);
          const result = await solveEquation(equation);

          if (result.success) {
            await attempts.insertOne({ equation, solution: result.solution });
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(result));
        } catch (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, message: "Server error" }));
        }
      });
    } else if (req.url === "/progress" && req.method === "GET") {
      const allAttempts = await attempts.find().toArray();
      const progress = {};

      allAttempts.forEach((a) => {
        const date = new Date(a._id.getTimestamp()).toISOString().split("T")[0];
        progress[date] = (progress[date] || 0) + 1;
      });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(progress));
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Not found" }));
    }
  });

  // ✅ Use PORT from Render, fallback to 5000 locally
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
  });
}

start().catch(console.error);
