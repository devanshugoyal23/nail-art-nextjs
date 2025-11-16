/**
 * EnrichedSalonSections Component
 *
 * Displays all enriched sections from AI-generated salon content
 * Shows real data from Google Maps + Gemini analysis
 */

import { EnrichedSalonData } from '@/types/salonEnrichment';

interface EnrichedSalonSectionsProps {
  enrichedData: EnrichedSalonData;
  salonName: string;
}

export default function EnrichedSalonSections({ enrichedData, salonName }: EnrichedSalonSectionsProps) {
  const { sections } = enrichedData;

  return (
    <div className="space-y-6">
      {/* About Section */}
      {sections.about && (
        <div className="bg-white rounded-xl p-6 md:p-8 ring-1 ring-[#ee2b8c]/15 shadow-sm">
          <h2 className="text-2xl font-bold text-[#1b0d14] mb-6 flex items-center gap-2">
            <span>ℹ️</span>
            <span>{sections.about.title || `About ${salonName}`}</span>
          </h2>
          <div
            className="prose prose-pink max-w-none text-[#1b0d14]/90 leading-[1.8] text-base md:text-lg
              [&>p]:mb-6 [&>p:last-child]:mb-0 [&>p]:text-[#1b0d14]/90 [&>p]:leading-[1.8]
              [&>p:not(:first-child)]:pt-2 [&>p:not(:first-child)]:border-t [&>p:not(:first-child)]:border-gray-100
              [&>p:first-letter]:text-2xl [&>p:first-letter]:font-semibold [&>p:first-letter]:text-[#ee2b8c]"
            dangerouslySetInnerHTML={{ __html: sections.about.content }}
          />
          <p className="text-xs text-gray-400 mt-6 pt-4 border-t border-[#ee2b8c]/10">
            {sections.about.wordCount} words • AI-generated from real reviews
          </p>
        </div>
      )}

      {/* Customer Reviews */}
      {sections.customerReviews && sections.customerReviews.featuredReviews.length > 0 && (
        <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15 shadow-sm">
          <h2 className="text-2xl font-bold text-[#1b0d14] mb-4 flex items-center gap-2">
            <span>⭐</span>
            <span>Customer Reviews</span>
          </h2>

          {/* Rating Summary */}
          <div className="mb-6 p-4 bg-gradient-to-r from-[#ee2b8c]/5 to-[#ee2b8c]/10 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#ee2b8c]">
                  {sections.customerReviews.averageRating.toFixed(1)}
                </div>
                <div className="text-sm text-[#1b0d14]/60 mt-1">
                  out of 5
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#1b0d14]/80 mb-2">
                  Based on <strong>{sections.customerReviews.totalReviews}</strong> reviews
                </p>
                {/* Star Rating Distribution */}
                <div className="space-y-1">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = sections.customerReviews!.ratingDistribution[star] || 0;
                    const percentage = (count / sections.customerReviews!.totalReviews) * 100;
                    return (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="w-12 text-[#1b0d14]/60">{star} stars</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#ee2b8c]"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-[#1b0d14]/60">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Featured Reviews */}
          <div className="space-y-4">
            {sections.customerReviews.featuredReviews.map((review, index) => (
              <div key={index} className="border-b border-[#ee2b8c]/10 pb-4 last:border-0">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#ee2b8c]/10 rounded-full flex items-center justify-center">
                    <span className="text-lg">👤</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-[#1b0d14]">{review.authorName}</p>
                        <div className="flex items-center gap-2 text-xs text-[#1b0d14]/60">
                          <span>{'⭐'.repeat(review.rating)}</span>
                          <span>•</span>
                          <span>{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[#1b0d14]/80 text-sm leading-relaxed">{review.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Insights */}
      {sections.reviewInsights && (
        <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15 shadow-sm">
          <h2 className="text-2xl font-bold text-[#1b0d14] mb-4 flex items-center gap-2">
            <span>📊</span>
            <span>Review Insights</span>
          </h2>

          <p className="text-[#1b0d14]/80 mb-6">{sections.reviewInsights.summary}</p>

          {/* Sentiment */}
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-l-4 border-green-500">
            <p className="text-sm font-semibold text-green-900">
              Overall Sentiment: <span className="capitalize">{sections.reviewInsights.overallSentiment}</span>
            </p>
          </div>

          {/* Strengths */}
          {sections.reviewInsights.strengths.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-[#1b0d14] mb-2 flex items-center gap-2">
                <span>✅</span>
                <span>Top Strengths</span>
              </h3>
              <ul className="space-y-2">
                {sections.reviewInsights.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span className="text-[#1b0d14]/80">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {sections.reviewInsights.improvements.length > 0 && (
            <div>
              <h3 className="font-semibold text-[#1b0d14] mb-2 flex items-center gap-2">
                <span>💡</span>
                <span>Areas for Improvement</span>
              </h3>
              <ul className="space-y-2">
                {sections.reviewInsights.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span className="text-[#1b0d14]/80">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Insights by Category */}
          {sections.reviewInsights.insights.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-[#1b0d14] mb-3">Detailed Analysis</h3>
              <div className="grid gap-3">
                {sections.reviewInsights.insights.map((insight, index) => {
                  // Backwards compatibility: Convert old 0-100 scores to 1-5
                  const isOldFormat = insight.score > 5;
                  const normalizedScore = isOldFormat
                    ? Math.round((insight.score / 100) * 5) || 1  // Convert 0-100 to 1-5
                    : insight.score;
                  const progressPercent = (normalizedScore / 5) * 100;

                  // Color based on score: 1-2 = red, 3 = yellow, 4-5 = green
                  const getScoreColor = (score: number) => {
                    if (score >= 4) return 'bg-green-500';
                    if (score >= 3) return 'bg-yellow-500';
                    return 'bg-red-500';
                  };

                  const getSentimentBadgeColor = (score: number) => {
                    if (score >= 4) return 'bg-green-100 text-green-700';
                    if (score >= 3) return 'bg-yellow-100 text-yellow-700';
                    return 'bg-red-100 text-red-700';
                  };

                  return (
                    <div key={index} className="p-3 bg-[#f8f6f7] rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-[#1b0d14]">{insight.category}</span>
                        <span className={`text-xs px-2 py-1 rounded ${getSentimentBadgeColor(normalizedScore)}`}>
                          {normalizedScore >= 4 ? 'Excellent' : normalizedScore >= 3 ? 'Good' : 'Needs Improvement'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getScoreColor(normalizedScore)}`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-[#1b0d14]/60">{normalizedScore}/5</span>
                      </div>
                      {insight.keyPhrases.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {insight.keyPhrases.slice(0, 3).map((phrase, i) => (
                            <span key={i} className="text-xs px-2 py-1 bg-white rounded text-[#1b0d14]/70">
                              {phrase}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Best Times to Visit */}
      {sections.bestTimes && (
        <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15 shadow-sm">
          <h2 className="text-2xl font-bold text-[#1b0d14] mb-4 flex items-center gap-2">
            <span>🕐</span>
            <span>Best Times to Visit</span>
          </h2>
          <p className="text-[#1b0d14]/80 mb-4">{sections.bestTimes.summary}</p>

          <div className="grid gap-3 mb-4">
            {sections.bestTimes.recommendations.map((rec, index) => (
              <div key={index} className="p-3 bg-[#f8f6f7] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-[#1b0d14]">{rec.period}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    rec.crowdLevel === 'low'
                      ? 'bg-green-100 text-green-700'
                      : rec.crowdLevel === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {rec.crowdLevel} crowd
                  </span>
                </div>
                <p className="text-sm text-[#1b0d14]/70">{rec.reason}</p>
                {rec.waitTime && (
                  <p className="text-xs text-[#1b0d14]/50 mt-1">Wait time: {rec.waitTime}</p>
                )}
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-[#ee2b8c]/10">
            <div>
              <h3 className="font-semibold text-[#1b0d14] mb-2">Busiest Times</h3>
              <ul className="space-y-1">
                {sections.bestTimes.busiestTimes.map((time, index) => (
                  <li key={index} className="text-sm text-[#1b0d14]/70">• {time}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[#1b0d14] mb-2">Quietest Times</h3>
              <ul className="space-y-1">
                {sections.bestTimes.quietestTimes.map((time, index) => (
                  <li key={index} className="text-sm text-[#1b0d14]/70">• {time}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Nearby Amenities */}
      {sections.nearbyAmenities && sections.nearbyAmenities.amenities.length > 0 && (
        <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15 shadow-sm">
          <h2 className="text-2xl font-bold text-[#1b0d14] mb-4 flex items-center gap-2">
            <span>📍</span>
            <span>Nearby Amenities</span>
          </h2>
          <p className="text-[#1b0d14]/80 mb-4">{sections.nearbyAmenities.summary}</p>

          <div className="grid gap-3">
            {sections.nearbyAmenities.amenities.map((amenity, index) => (
              <div key={index} className="p-3 bg-[#f8f6f7] rounded-lg">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#1b0d14]">{amenity.name}</span>
                      {amenity.rating && (
                        <span className="text-xs text-[#ee2b8c]">⭐ {amenity.rating}</span>
                      )}
                    </div>
                    <span className="text-xs text-[#1b0d14]/50 capitalize">{amenity.type}</span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-white rounded text-[#1b0d14]/60">
                    {amenity.distance}
                  </span>
                </div>
                {amenity.description && (
                  <p className="text-sm text-[#1b0d14]/70 mt-2">{amenity.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Section */}
      {sections.faq && sections.faq.questions.length > 0 && (
        <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15 shadow-sm">
          <h2 className="text-2xl font-bold text-[#1b0d14] mb-4 flex items-center gap-2">
            <span>❓</span>
            <span>Frequently Asked Questions</span>
          </h2>
          <p className="text-[#1b0d14]/80 mb-4">{sections.faq.summary}</p>

          <div className="space-y-4">
            {sections.faq.questions.map((faq, index) => (
              <div key={index} className="border-b border-[#ee2b8c]/10 pb-4 last:border-0">
                <h3 className="font-semibold text-[#1b0d14] mb-2">{faq.question}</h3>
                <p className="text-[#1b0d14]/70 text-sm">{faq.answer}</p>
                <p className="text-xs text-[#1b0d14]/40 mt-1">Source: {faq.source}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
