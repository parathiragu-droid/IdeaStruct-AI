/**
 * Beginner-Friendly Error Messages Helper
 *
 * Converts technical HTTP status codes and backend exceptions into
 * clear, actionable language for end users while preserving technical
 * context for developers.
 */

export function formatUserFriendlyError(err, fallbackAction = 'processing your request') {
  if (!err) {
    return {
      message: `An unexpected issue occurred while ${fallbackAction}.`,
      technical: null,
    };
  }

  // Handle ApiError or standard objects with status/data
  const status = err.status || err.statusCode;
  const rawMsg = err.message || (typeof err === 'string' ? err : '');
  const fieldErrors = err.data?.fieldErrors || err.fieldErrors;

  // 1. Optimistic Concurrency Conflict (409)
  if (status === 409 || rawMsg.includes('409') || rawMsg.toLowerCase().includes('concurrency') || rawMsg.toLowerCase().includes('revision')) {
    return {
      message: 'This project changed while you were editing it. Reload the latest version before trying again.',
      technical: `HTTP 409 Conflict: Project revision mismatch. ${rawMsg}`.trim(),
    };
  }

  // 2. Resource Not Found (404)
  if (status === 404 || rawMsg.includes('404') || rawMsg.toLowerCase().includes('not found')) {
    return {
      message: 'This project could not be found. It may have been deleted.',
      technical: `HTTP 404 Not Found: ${rawMsg}`.trim(),
    };
  }

  // 3. Validation / Bad Request (400)
  if (status === 400 || rawMsg.includes('400')) {
    let msg = 'Some information is incomplete or invalid. Please check the fields above.';
    if (rawMsg.toLowerCase().includes('gemini') || rawMsg.toLowerCase().includes('api key') || rawMsg.toLowerCase().includes('not configured')) {
      msg = 'Live AI is not configured yet. You can generate a complete sample plan in Demo mode without an API key.';
    } else if (rawMsg.toLowerCase().includes('schema') || rawMsg.toLowerCase().includes('section')) {
      msg = 'The project plan structure is missing required sections or has invalid values.';
    }

    return {
      message: msg,
      technical: `HTTP 400 Bad Request: ${rawMsg}`.trim(),
      fieldErrors,
    };
  }

  // 4. AI Provider Unavailable / Service Unavailable (503 / 504)
  if (status === 503 || status === 504 || rawMsg.toLowerCase().includes('timeout') || rawMsg.toLowerCase().includes('timed out')) {
    return {
      message: 'AI generation took too long or the AI service is busy. Please try again or switch to Demo mode.',
      technical: `HTTP ${status || 504}: ${rawMsg}`.trim(),
    };
  }

  // 5. Network / Server Disconnection
  if (rawMsg.toLowerCase().includes('failed to fetch') || rawMsg.toLowerCase().includes('network') || rawMsg.toLowerCase().includes('connection refused')) {
    return {
      message: 'Unable to connect to IdeaStruct AI backend. Please check that the server is running.',
      technical: rawMsg,
    };
  }

  // 6. Generic Fallback
  return {
    message: rawMsg ? `Could not complete: ${rawMsg}` : `We encountered a problem while ${fallbackAction}.`,
    technical: `Error: ${rawMsg || 'Unknown error'}`,
  };
}
