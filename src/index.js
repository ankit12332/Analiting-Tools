const axios = require('axios');
const express = require('express');
const UAParser = require('ua-parser-js');
const app = express();

app.get('/api/track-visitor', async (req, res) => {
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;

  // Handle the case of IPv6 localhost (::1) during local development
  if (ip === '::1' || ip === '127.0.0.1') {
    ip = '8.8.8.8'; // Use a public IP address for testing purposes
  }

  try {
    // Get the geolocation information using IP-API
    const geoResponse = await axios.get(`http://ip-api.com/json/${ip}`);

    // Parse the User-Agent to detect the device, browser, and OS
    const userAgent = req.headers['user-agent'];
    const parser = new UAParser(userAgent);
    const deviceInfo = parser.getResult();

    // If device type is undefined (common on desktop), assume it's a desktop
    if (!deviceInfo.device.type) {
      deviceInfo.device.type = 'Desktop';
    }

    // Send back all geolocation and device information
    res.send({
      geolocationData: geoResponse.data,  // Send all geolocation data from ip-api.com
      deviceData: deviceInfo              // Send all parsed User-Agent data with inferred desktop type
    });
  } catch (error) {
    console.error('Geolocation or Device Detection Error:', error.response?.data || error.message);
    res.status(500).send('Failed to get visitor data');
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
