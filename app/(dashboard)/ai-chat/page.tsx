import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AiChatClient, {
  type ConversationRecord,
  type ResumeOption,
} from "@/components/ai/ai-chat-client";

export const metadata = {
  title: "AI Chat — KvinnResume",
};

type AiConversationRow = {
  id: string;
  title: string | null;
  last_message: string | null;
  updated_at: string | null;
  resume_id: string | null;
};

type ResumeRow = {
  id: string;
  title: string | null;
  updated_at: string | null;
};

type ProfileRow = {
  credits_balance: number | null;
};

function fallbackDate(value?: string | null) {
  return value ?? new Date().toISOString();
}

function fallbackTitle(value?: string | null) {
  const title = value?.trim();

  if (!title) return "New conversation";

  return title;
}

function fallbackLastMessage(value?: string | null) {
  const message = value?.trim();

  if (!message) return "";

  return message.length > 80 ? `${message.slice(0, 80)}…` : message;
}

export default async function AiChatPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    conversationsResult,
    resumesResult,
    profileResult,
  ] = await Promise.all([
    supabase
      .from("ai_conversations")
      .select("id, title, last_message, updated_at, resume_id")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(50),

    supabase
      .from("resumes")
      .select("id, title, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),

    supabase
      .from("profiles")
      .select("credits_balance")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  if (conversationsResult.error) {
    console.error(
      "Failed to fetch AI conversations:",
      conversationsResult.error.message
    );
  }

  if (resumesResult.error) {
    console.error("Failed to fetch resumes:", resumesResult.error.message);
  }

  if (profileResult.error) {
    console.error("Failed to fetch profile credits:", profileResult.error.message);
  }

  const conversationRows =
    ((conversationsResult.data ?? []) as AiConversationRow[]) ?? [];

  const conversationIds = conversationRows.map((conversation) => conversation.id);

  let messageCountMap = new Map<string, number>();

  if (conversationIds.length > 0) {
    const { data: messageRows, error: messageCountError } = await supabase
      .from("ai_messages")
      .select("conversation_id")
      .in("conversation_id", conversationIds);

    if (messageCountError) {
      console.error(
        "Failed to fetch AI message counts:",
        messageCountError.message
      );
    } else {
      for (const row of messageRows ?? []) {
        const conversationId = row.conversation_id as string;

        messageCountMap.set(
          conversationId,
          (messageCountMap.get(conversationId) ?? 0) + 1
        );
      }
    }
  }

  const conversations: ConversationRecord[] = conversationRows.map(
    (conversation) => ({
      id: conversation.id,
      title: fallbackTitle(conversation.title),
      lastMessage: fallbackLastMessage(conversation.last_message),
      updatedAt: fallbackDate(conversation.updated_at),
      resumeId: conversation.resume_id,
      messageCount: messageCountMap.get(conversation.id) ?? 0,
    })
  );

  const resumes: ResumeOption[] = ((resumesResult.data ?? []) as ResumeRow[]).map(
    (resume) => ({
      id: resume.id,
      title: fallbackTitle(resume.title ?? "Untitled Resume"),
      updatedAt: fallbackDate(resume.updated_at),
    })
  );

  const profile = profileResult.data as ProfileRow | null;

  const userCredits =
    typeof profile?.credits_balance === "number"
      ? profile.credits_balance
      : 0;

  return (
    <div
      style={{
        height: "calc(100vh - 64px)",
        overflow: "hidden",
        background: "#040506",
      }}
    >
      <AiChatClient
        initialConversations={conversations}
        initialResumes={resumes}
        userCredits={userCredits}
        userId={user.id}
      />
    </div>
  );
}