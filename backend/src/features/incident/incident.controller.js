const incidentService = require('./incident.service');

const incidentController = {
  async getAll(req, res, next) {
    try {
      const incidents = await incidentService.getAll(req.query);
      res.status(200).json({
        success: true,
        count: incidents.length,
        data: incidents,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const incident = await incidentService.getById(req.params.id);
      if (!incident) {
        return res.status(404).json({
          success: false,
          error: { message: `Incident with ID ${req.params.id} not found` },
        });
      }
      res.status(200).json({
        success: true,
        data: incident,
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

      const newIncident = await incidentService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Civic incident report submitted successfully',
        data: newIncident,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const updatedIncident = await incidentService.update(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Incident updated successfully',
        data: updatedIncident,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await incidentService.delete(req.params.id);
      res.status(200).json({
        success: true,
        message: `Incident ${req.params.id} deleted successfully`,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = incidentController;
