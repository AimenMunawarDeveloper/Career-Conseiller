import https from "https";
import axios from "axios";

export const getJobsInformation = async (req, res) => {
  const options = {
    method: "GET",
    hostname: "jsearch.p.rapidapi.com",
    port: null,
    path: "/search?query=developer%20jobs%20in%20chicago&page=1&num_pages=1&country=us&date_posted=all",
    headers: {
      "x-rapidapi-key": "beba7095b9msh344e121d2d914c6p1b0455jsn4c44808386f1",
      "x-rapidapi-host": "jsearch.p.rapidapi.com",
    },
  };

  const request = https.request(options, function (response) {
    const chunks = [];

    response.on("data", function (chunk) {
      chunks.push(chunk);
    });

    response.on("end", function () {
      const body = Buffer.concat(chunks);
      try {
        const data = JSON.parse(body.toString());
        res.json(data);
      } catch (error) {
        console.error("Error parsing JSON response:", error);
        res.status(500).json({ error: "Failed to parse job data" });
      }
    });
  });

  request.on("error", (error) => {
    console.error("Error making HTTPS request:", error);
    res.status(500).json({ error: "Failed to fetch job data" });
  });

  request.end();
};

export async function getLightcastToken() {
  try {
    const params = new URLSearchParams();
    params.append("client_id", process.env.LIGHTCAST_CLIENT_ID);
    params.append("client_secret", process.env.LIGHTCAST_CLIENT_SECRET);
    params.append("grant_type", "client_credentials");
    params.append("scope", "emsi_open");

    const response = await axios.post(
      "https://auth.emsicloud.com/connect/token",
      params,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    return response.data.access_token;
  } catch (err) {
    if (err.response) {
      console.error("Lightcast token error response:", err.response.data);
    } else {
      console.error("Lightcast token error:", err.message);
    }
    throw new Error(
      "Failed to fetch Lightcast token: " +
        (err.response?.data?.error_description || err.message)
    );
  }
}
export async function getAllSkills(req, res) {
  try {
    const accessToken = await getLightcastToken();
    if (!accessToken) {
      return res
        .status(401)
        .json({ error: "Failed to obtain Lightcast access token" });
    }
    // Use all query params, but default to a broad search
    const {
      q = "a",
      fields = "id,name,type,infoUrl",
      limit = 100,
      ...rest
    } = req.query;
    const params = { q, fields, limit, ...rest };
    if (!params.typeIds) delete params.typeIds; // don't send if not specified

    const url = "https://emsiservices.com/skills/versions/latest/skills";
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      params,
    });
    return res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Error fetching occupations:",
      error.response?.data || error.message
    );
    return res.status(500).json({ error: "Failed to fetch occupations" });
  }
}
