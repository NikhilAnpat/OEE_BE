const express = require("express");
const router = express.Router();
const { getLatestBlobData } = require("../services/blobService");

// Helper function to convert UTC timestamp to IST (UTC+5:30)
function convertToIST(utcTimestamp) {
  if (!utcTimestamp) return utcTimestamp;
  
  try {
    const date = new Date(utcTimestamp);
    // IST is UTC+5:30
    const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    const istTime = date.getTime() + istOffset;
    const istDate = new Date(istTime);
    
    // Format as YYYY-MM-DDTHH:mm:ss+05:30
    const year = istDate.getUTCFullYear();
    const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(istDate.getUTCDate()).padStart(2, '0');
    const hours = String(istDate.getUTCHours()).padStart(2, '0');
    const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(istDate.getUTCSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+05:30`;
  } catch (e) {
    // If conversion fails, return original timestamp
    return utcTimestamp;
  }
}

// Helper function to convert ts field in an object to IST
function convertTsToIST(obj) {
  if (obj && typeof obj === 'object') {
    const converted = { ...obj };
    if (converted.ts) {
      converted.ts = convertToIST(converted.ts);
    }
    return converted;
  }
  return obj;
}

router.get("/ecu-data", async (req, res) => {
  try {
    const data = await getLatestBlobData();
    if (!data) {
      return res.status(404).json({ error: "No blob data found" });
    }

    const trimmedData = data.trim();
    
    // Check if data contains newlines (newline-delimited JSON)
    if (trimmedData.includes('\n')) {
      // Handle newline-delimited JSON (multiple JSON objects)
      const lines = trimmedData.split('\n').filter(line => line.trim());
      const parsedArray = [];
      
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line.trim());
          parsedArray.push(parsed);
        } catch (e) {
          // Skip invalid JSON lines
          console.warn('Skipping invalid JSON line:', line.substring(0, 100));
        }
      }

      if (parsedArray.length > 0) {
        // Sort by ts field in descending order (newest first) before converting to IST
        parsedArray.sort((a, b) => {
          if (!a.ts || !b.ts) return 0;
          const dateA = new Date(a.ts);
          const dateB = new Date(b.ts);
          return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
        });
        
        // Convert ts field to IST after sorting
        const convertedArray = parsedArray.map(item => convertTsToIST(item));
        
        // Return array of all parsed objects with count
        return res.json({
          count: convertedArray.length,
          data: convertedArray
        });
      } else {
        return res.status(400).json({ 
          error: "No valid JSON objects found in blob data"
        });
      }
    } else {
      // Try to parse as single JSON object
      try {
        const parsed = JSON.parse(trimmedData);
        // Convert ts field to IST
        const converted = convertTsToIST(parsed);
        return res.json({
          count: 1,
          data: converted
        });
      } catch (parseError) {
        return res.status(400).json({ 
          error: "Failed to parse JSON data",
          details: parseError.message,
          dataPreview: trimmedData.substring(0, 200)
        });
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Debug endpoint to see raw blob data
router.get("/ecu-data/raw", async (req, res) => {
  try {
    const data = await getLatestBlobData();
    if (!data) {
      return res.status(404).json({ error: "No blob data found" });
    }
    res.type('text/plain').send(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

