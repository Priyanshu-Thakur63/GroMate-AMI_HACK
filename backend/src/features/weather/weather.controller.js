const weatherService = require('./weather.service');

const weatherController = {
  async getAll(req, res, next) {
    try {
      const records = await weatherService.getAll(req.query);
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
      const latestData = await weatherService.getLatest();
      res.status(200).json({
        success: true,
        data: latestData,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const weather = await weatherService.getById(req.params.id);
      if (!weather) {
        return res.status(404).json({
          success: false,
          error: { message: `Weather record with ID ${req.params.id} not found` },
        });
      }
      res.status(200).json({
        success: true,
        data: weather,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { latitude, longitude, temperature } = req.body;
      if (latitude === undefined || longitude === undefined || temperature === undefined) {
        return res.status(400).json({
          success: false,
          error: { message: 'Latitude, longitude, and temperature are required fields' },
        });
      }

      const newWeather = await weatherService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Weather data recorded successfully',
        data: newWeather,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = weatherController;
