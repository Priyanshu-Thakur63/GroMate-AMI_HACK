const pulseService = require('./pulse.service');

const pulseController = {
  async getCityPulse(req, res, next) {
    try {
      const pulseData = await pulseService.getAllZonesPulse();
      res.status(200).json({
        success: true,
        data: pulseData,
      });
    } catch (error) {
      next(error);
    }
  },

  async getZonePulse(req, res, next) {
    try {
      const zonePulse = await pulseService.calculatePulseForZone(req.params.zoneId);
      res.status(200).json({
        success: true,
        data: zonePulse,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = pulseController;
