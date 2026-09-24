const disasterService = require('./disaster.service');

const disasterController = {
  async getAll(req, res, next) {
    try {
      const disasters = await disasterService.getAll(req.query);
      res.status(200).json({
        success: true,
        count: disasters.length,
        data: disasters,
      });
    } catch (error) {
      next(error);
    }
  },

  async getActive(req, res, next) {
    try {
      const active = await disasterService.getActive();
      res.status(200).json({
        success: true,
        count: active.length,
        data: active,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const disaster = await disasterService.getById(req.params.id);
      if (!disaster) {
        return res.status(404).json({
          success: false,
          error: { message: `Disaster record with ID ${req.params.id} not found` },
        });
      }
      res.status(200).json({
        success: true,
        data: disaster,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { title, description, latitude, longitude } = req.body;
      if (!title || !description || latitude === undefined || longitude === undefined) {
        return res.status(400).json({
          success: false,
          error: { message: 'Title, description, latitude, and longitude are required' },
        });
      }

      const newDisaster = await disasterService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Disaster emergency declared and broadcasted',
        data: newDisaster,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const updated = await disasterService.update(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Disaster record updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = disasterController;
