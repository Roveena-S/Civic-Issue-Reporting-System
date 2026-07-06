/**
 * escalationCron.js
 * ─────────────────────────────────────────────────────────
 * Auto-escalation: If a complaint remains unresolved for
 * more than 48 hours, its priority is bumped to "high".
 *
 * This runs every hour as a lightweight in-process job.
 * Import and call startEscalationCron() after DB connects.
 */

const Complaint = require('../models/Complaint');

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000; // 48 hrs in ms
const CHECK_INTERVAL_MS    = 60 * 60 * 1000;        // run every 1 hour

async function runEscalation() {
  try {
    const cutoff = new Date(Date.now() - FORTY_EIGHT_HOURS_MS);

    // Find unresolved complaints older than 48 hrs that aren't already high
    const result = await Complaint.updateMany(
      {
        status:   { $in: ['reported', 'verified', 'in_progress'] },
        priority: { $ne: 'high' },
        createdAt: { $lte: cutoff }
      },
      { $set: { priority: 'high' } }
    );

    if (result.modifiedCount > 0) {
      console.log(`[Escalation] Bumped ${result.modifiedCount} complaint(s) to HIGH priority (48-hr rule)`);
    }
  } catch (err) {
    console.error('[Escalation] Error during auto-escalation:', err.message);
  }
}

/**
 * Starts the periodic escalation check.
 * Call this once after MongoDB is connected.
 */
function startEscalationCron() {
  console.log('[Escalation] Auto-escalation cron started (runs every 1 hour)');
  // Run once immediately on startup, then every hour
  runEscalation();
  setInterval(runEscalation, CHECK_INTERVAL_MS);
}

module.exports = { startEscalationCron };
