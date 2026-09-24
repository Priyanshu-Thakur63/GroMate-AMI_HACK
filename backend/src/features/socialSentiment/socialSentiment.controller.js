const sentimentService = require('./socialSentiment.service');

const socialSentimentController = {
  async getAll(req, res, next) {
    try {
      const records = await sentimentService.getAll(req.query);
      res.status(200).json({
        success: true,
        count: records.length,
        data: records,
      });
    } catch (error) {
      next(error);
    }
  },

  async getSummary(req, res, next) {
    try {
      const summary = await sentimentService.getSummary();
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({
          success: false,
          error: { message: 'Post content is required' },
        });
      }

      const newSentiment = await sentimentService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Civic social sentiment logged successfully',
        data: newSentiment,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = socialSentimentController;
