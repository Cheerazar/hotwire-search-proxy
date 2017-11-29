const express = require('express');
const axios = require('axios');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

const { PORT = 3000, API_KEY, S3BUCKET } = process.env;
const corsOptions = {
  origin: S3BUCKET,
  optionsSuccessStatus: 200,
};

// configure middleware
app.use(morgan('dev'));

app.get('/api/search', cors(corsOptions), ({ query: { where, startDate, endDate } }, res) => {
  axios
    .get(`http://api.hotwire.com/v1/search/car?apikey=${API_KEY}&dest=${
      where
    }&startdate=${decodeURIComponent(startDate)}&enddate=${decodeURIComponent(endDate)}&pickuptime=10:00&dropofftime=13:30&format=json`)
    .then(({
      data: {
        MetaData, Result, StatusCode, StatusDesc,
      },
    }) => {
      let carTypes;
      if (MetaData && MetaData.CarMetaData && MetaData.CarMetaData.CarTypes) {
        carTypes = MetaData.CarMetaData.CarTypes;
      }
      res.json({
        carTypes,
        results: Result,
        statusCode: StatusCode,
        statusDesc: StatusDesc,
      });
    })
    .catch((err) => {
      res.json({ error: err });
    });
});

app.use('*', (req, res) => {
  res.status(404).json({ err: 'Requested resource does not exist' });
});

app.listen(PORT, (err) => {
  if (err) {
    return console.log('Error listening', err);
  }

  console.log(`Listening on port ${PORT}`);
});
