const prisma = require('../../config/database');

class SocialSentimentService {
  async getAll({ zoneId, platform, label, limit = 50 }) {
    const where = {};
    if (zoneId) where.zoneId = zoneId;
    if (platform) where.platform = platform;
    if (label) where.sentimentLabel = label;

    return await prisma.socialSentiment.findMany({
      where,
      orderBy: { postedAt: 'desc' },
      take: parseInt(limit, 10),
      include: { zone: true },
    });
  }

  async getSummary() {
    const sentiments = await prisma.socialSentiment.findMany({
      take: 200,
      orderBy: { postedAt: 'desc' },
    });

    if (sentiments.length === 0) {
      return {
        averageScore: 0,
        counts: { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0, URGENT: 0 },
        totalSampled: 0,
      };
    }

    const counts = { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0, URGENT: 0 };
    let sum = 0;

    sentiments.forEach((s) => {
      sum += s.sentimentScore;
      if (counts[s.sentimentLabel] !== undefined) {
        counts[s.sentimentLabel]++;
      }
    });

    return {
      averageScore: Number((sum / sentiments.length).toFixed(2)),
      counts,
      totalSampled: sentiments.length,
    };
  }

  async create(data) {
    const {
      zoneId,
      platform = 'Civic Feed',
      content,
      sentimentScore,
      sentimentLabel,
      keywords = [],
      latitude,
      longitude,
    } = data;

    let score = sentimentScore !== undefined ? parseFloat(sentimentScore) : 0.0;
    let label = sentimentLabel || 'NEUTRAL';

    if (sentimentScore === undefined && sentimentLabel === undefined) {
      const lower = content.toLowerCase();
      if (
        lower.includes('emergency') ||
        lower.includes('help') ||
        lower.includes('trapped') ||
        lower.includes('fire') ||
        lower.includes('flood') ||
        lower.includes('danger')
      ) {
        score = -0.9;
        label = 'URGENT';
      } else if (
        lower.includes('terrible') ||
        lower.includes('worst') ||
        lower.includes('broken') ||
        lower.includes('stuck') ||
        lower.includes('delay')
      ) {
        score = -0.6;
        label = 'NEGATIVE';
      } else if (
        lower.includes('fixed') ||
        lower.includes('clean') ||
        lower.includes('great') ||
        lower.includes('safe') ||
        lower.includes('good')
      ) {
        score = 0.7;
        label = 'POSITIVE';
      }
    }

    return await prisma.socialSentiment.create({
      data: {
        zoneId: zoneId || null,
        platform,
        content,
        sentimentScore: score,
        sentimentLabel: label,
        keywords: Array.isArray(keywords) ? keywords : [],
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      },
      include: { zone: true },
    });
  }
}

module.exports = new SocialSentimentService();
