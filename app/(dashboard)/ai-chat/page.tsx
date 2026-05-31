import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AiChatClient } from "@/components/ai/ai-chat-client";

export default async function AiChatPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <AiChatClient />;
}
