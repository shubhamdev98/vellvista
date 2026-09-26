import { db } from "../../db";
import { chatSessions, chatMessages, user } from "../../schema";
import { eq, and, asc } from "drizzle-orm";
import { detectIntent } from "./intentService";
import { checkPermissions } from "./permissionService";
import { buildContext } from "./contextBuilder";
import { generateGrokResponse } from "./grokService";

export interface SendMessageOptions {
  sessionId?: string;
  message: string;
  userId?: string | null;
}

export async function processChatMessage(options: SendMessageOptions) {
  const { message, userId } = options;
  let sessionId = options.sessionId;

  // Validate userId in user table to prevent FK constraint errors
  let validUserId: string | null = null;
  if (userId) {
    try {
      const existingUser = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);
      if (existingUser.length > 0) {
        validUserId = userId;
      }
    } catch (e) {
      console.warn("User validation check error in chatService:", e);
    }
  }

  // 1. Ensure a valid session exists
  if (sessionId) {
    const existing = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, sessionId))
      .limit(1);

    if (existing.length === 0) {
      // Create session with provided ID
      await db.insert(chatSessions).values({
        id: sessionId,
        userId: validUserId,
        title: message.slice(0, 30),
      });
    } else {
      // If user is logged in, link session to user if not already linked
      if (validUserId && !existing[0].userId) {
        await db
          .update(chatSessions)
          .set({ userId: validUserId })
          .where(eq(chatSessions.id, sessionId));
      }
    }
  } else {
    // Generate new session ID
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    await db.insert(chatSessions).values({
      id: sessionId,
      userId: validUserId,
      title: message.slice(0, 30),
    });
  }

  // 2. Fetch past chat history for this session (enforcing session boundary)
  const historyRecords = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(asc(chatMessages.createdAt))
    .limit(10);

  const history = historyRecords.map((m) => ({
    sender: m.sender,
    text: m.text,
  }));

  // 3. Save user message to database
  await db.insert(chatMessages).values({
    sessionId,
    sender: "user",
    text: message,
  });

  // 4. Intent detection
  const intent = detectIntent(message);

  // 5. Permission check
  const perm = checkPermissions(intent, userId);
  if (!perm.authorized) {
    const denialText = perm.denialReason || "Access denied. Please log in to view private information.";
    await db.insert(chatMessages).values({
      sessionId,
      sender: "bot",
      text: denialText,
    });
    return {
      sessionId,
      sender: "bot",
      text: denialText,
      intent,
      authorized: false,
    };
  }

  // 6. Build Context (Retrieves ONLY authorized data scoped to userId)
  const context = await buildContext(intent, message, userId);

  // 7. Invoke Grok AI
  const grokResult = await generateGrokResponse(message, context, history);

  // 8. Save bot message to database
  const metadataStr = grokResult.structuredData
    ? JSON.stringify(grokResult.structuredData)
    : undefined;

  await db.insert(chatMessages).values({
    sessionId,
    sender: "bot",
    text: grokResult.text,
    metadata: metadataStr,
  });

  return {
    sessionId,
    sender: "bot",
    text: grokResult.text,
    intent,
    authorized: true,
    structuredData: grokResult.structuredData,
  };
}

export async function getSessionHistory(sessionId: string, userId?: string | null) {
  if (!sessionId) return [];

  // Security check: verify session ownership if session belongs to a user
  const sessObj = await db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.id, sessionId))
    .limit(1);

  if (sessObj.length === 0) return [];

  // If session belongs to a logged-in user, ensure request comes from that user
  if (sessObj[0].userId && sessObj[0].userId !== userId) {
    throw new Error("Unauthorized to access this chat session.");
  }

  const msgs = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(asc(chatMessages.createdAt));

  return msgs.map((m) => ({
    id: m.id.toString(),
    sender: m.sender as "bot" | "user",
    text: m.text,
    timestamp: m.createdAt
      ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "Just now",
    metadata: m.metadata ? JSON.parse(m.metadata) : undefined,
  }));
}
