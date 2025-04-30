import { Suspense } from "react";
import ResetPassword from "@/components/auth/reset-password";

type Props = {
  searchParams: Promise<{
    token: string;
  }>;
};

export default async function ResetPasswordPage(prop: Props) {
  const { token } = await prop.searchParams;

  return (
    <Suspense fallback={<div>Loading form...</div>}>
      <ResetPassword token={token as string} />
    </Suspense>
  );
}
