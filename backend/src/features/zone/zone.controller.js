const zoneService = require('./zone.service');

const zoneController = {
  async getAll(req, res, next) {
    try {
      const zones = await zoneService.getAll();
      res.status(200).json({
        success: true,
        count: zones.length,
        data: zones,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const zone = await zoneService.getById(req.params.id);
      if (!zone) {
        return res.status(404).json({
          success: false,
          error: { message: `Zone with ID ${req.params.id} not found` },
        });
      }
      res.status(200).json({
        success: true,
        data: zone,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { name, code, latitude, longitude } = req.body;
      if (!name || !code || latitude === undefined || longitude === undefined) {
        return res.status(400).json({
          success: false,
          error: { message: 'Name, code, latitude, and longitude are required fields' },
        });
      }

      const newZone = await zoneService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Civic zone registered successfully',
        data: newZone,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = zoneController;
