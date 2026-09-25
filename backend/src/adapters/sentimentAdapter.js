/**
 * CityPulse Social & News Sentiment Adapter
 * Analyzes raw citizen chatter, news headlines, and civic reports with a lightweight lexicon tone engine
 */

const DISTRESS_KEYWORDS = [
  'traffic jam', 'waterlogged', 'flooded', 'accident', 'fire', 'smog', 'pollution',
  'choked', 'breakdown', 'delay', 'pothole', 'hazard', 'power cut', 'outage',
  'blackout', 'submerged', 'jammed', 'congestion', 'danger', 'complaint', 'chaos'
];

const POSITIVE_KEYWORDS = [
  'cleared', 'restored', 'smooth', 'safe', 'open', 'green', 'improved',
  'repaired', 'resolved', 'relief', 'efficient', 'flowing', 'clean'
];

function calculateCivicToneScore(text) {
  if (!text) return 0.0;
  const lower = text.toLowerCase();
  let score = 0.0;

  DISTRESS_KEYWORDS.forEach(kw => {
    if (lower.includes(kw)) score -= 0.35;
  });

  POSITIVE_KEYWORDS.forEach(kw => {
    if (lower.includes(kw)) score += 0.30;
  });

  return Math.max(-1.0, Math.min(1.0, Number(score.toFixed(2))));
}

function normalizeNewsSentiment(rawArticle, zoneId) {
  const title = rawArticle.title || 'Civic report';
  const description = rawArticle.description || rawArticle.snippet || '';
  const fullText = `${title}. ${description}`;
  const toneScore = calculateCivicToneScore(fullText);

  const observedAt = new Date(rawArticle.publishedAt || rawArticle.postedAt || Date.now());
  const ingestedAt = new Date();
  const freshnessSeconds = Math.max(0, Math.floor((ingestedAt.getTime() - observedAt.getTime()) / 1000));

  let sentimentLabel = 'NEUTRAL';
  let severity = 'NORMAL';

  if (toneScore <= -0.6) {
    sentimentLabel = 'URGENT';
    severity = 'CRITICAL';
  } else if (toneScore < -0.2) {
    sentimentLabel = 'NEGATIVE';
    severity = 'ELEVATED';
  } else if (toneScore > 0.2) {
    sentimentLabel = 'POSITIVE';
    severity = 'NORMAL';
  }

  const observation = {
    source: rawArticle.platform || rawArticle.sourceName || rawArticle.source?.name || 'GNEWS_JAIPUR',
    category: 'SENTIMENT',
    metricType: 'PUBLIC_TONE',
    value: toneScore,
    unit: 'tone_index',
    severity,
    latitude: Number(rawArticle.latitude || 26.9124),
    longitude: Number(rawArticle.longitude || 75.7873),
    zoneId,
    observedAt,
    ingestedAt,
    freshnessSeconds,
    metadata: {
      title,
      sentimentLabel,
      platform: rawArticle.platform || 'Civic Feed',
      url: rawArticle.url || null
    }
  };

  return {
    observation,
    domainRecord: {
      zoneId,
      platform: rawArticle.platform || rawArticle.source?.name || 'Civic Feed',
      content: fullText.slice(0, 500),
      sentimentScore: toneScore,
      sentimentLabel,
      keywords: rawArticle.keywords || [],
      latitude: Number(rawArticle.latitude || 26.9124),
      longitude: Number(rawArticle.longitude || 75.7873),
      postedAt: observedAt
    }
  };
}

module.exports = {
  normalizeNewsSentiment,
  calculateCivicToneScore
};
