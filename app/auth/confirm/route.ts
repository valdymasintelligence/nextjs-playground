import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";

import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  // console.log({ token_hash, type }, "token_hash and type");

  if (token_hash && type) {
    const supabase = await createClient();

    if (type === "recovery") {
      redirect(`/reset-password?token_hash=${token_hash}`);
    } else {
      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      });
      if (!error) {
        // redirect user to specified redirect URL or root of app
        // console.log({ next }, "url");
        redirect(next);
      }
    }
  }

  // redirect the user to an error page with some instructions
  redirect("/error");
}
