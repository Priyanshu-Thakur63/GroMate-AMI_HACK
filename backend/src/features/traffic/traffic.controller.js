const trafficService = require('./traffic.service');

class TrafficController {
  async getTrafficFeed(req, res, next) {
    try {
      const result = await trafficService.getLiveTrafficData();
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new TrafficController();
