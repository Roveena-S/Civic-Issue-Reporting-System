/**
 * priorityUtils.js
 * ─────────────────────────────────────────────────────────
 * Utility functions for Smart Priority Classification.
 *
 * calculatePriority(issueType, confidence, upvotes)
 *   → returns "high" | "medium" | "low"
 *
 * Rules:
 *  HIGH   – pothole / water_leakage type, OR confidence > 0.8, OR upvotes > 10
 *  MEDIUM – confidence 0.5–0.8,           OR upvotes 5–10
 *  LOW    – everything else
 */

const HIGH_PRIORITY_TYPES = ['pothole', 'water_leakage'];

/**
 * Calculates the priority level for a complaint.
 * @param {string} issueType  - Complaint category (e.g. "pothole")
 * @param {number} confidence - AI confidence score (0.0 – 1.0)
 * @param {number} upvotes    - Number of upvotes the complaint has received
 * @returns {"high"|"medium"|"low"}
 */
function calculatePriority(issueType, confidence = 0, upvotes = 0) {
  // ── HIGH ──────────────────────────────────────────────
  if (
    HIGH_PRIORITY_TYPES.includes(issueType) || // critical issue type
    confidence > 0.8  ||                        // very confident AI detection
    upvotes > 10                                // widely upvoted by community
  ) {
    return 'high';
  }

  // ── MEDIUM ────────────────────────────────────────────
  if (
    (confidence >= 0.5 && confidence <= 0.8) || // moderate AI confidence
    (upvotes >= 5 && upvotes <= 10)              // moderately upvoted
  ) {
    return 'medium';
  }

  // ── LOW ───────────────────────────────────────────────
  return 'low';
}

module.exports = { calculatePriority };
