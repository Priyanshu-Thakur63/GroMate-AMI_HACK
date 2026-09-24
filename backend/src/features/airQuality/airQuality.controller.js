const airQualityService = require('./airQuality.service');

const airQualityController = {
  async getAll(req, res, next) {
    try {
      const records = await airQualityService.getAll(req.query);
      res.status(200).json({
        success: true,
        count: records.length,
        data: records,
      });
    } catch (error) {
      next(error);
    }
  },

  async getLatest(req, res, next) {
    try {
      const latestData = await airQualityService.getLatest();
      res.status(200).json({
        success: true,
        data: latestData,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { aqi, latitude, longitude } = req.body;
      if (aqi === undefined || latitude === undefined || longitude === undefined) {
        return res.status(400).json({
          success: false,
          error: { message: 'AQI, latitude, and longitude are required fields' },
        });
      }

      const newRecord = await airQualityService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Air quality measurement recorded successfully',
        data: newRecord,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = airQualityController;
