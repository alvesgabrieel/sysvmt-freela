"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import ChangePasswordForm from "@/app/components/change-password-form";

interface TokenPageProps {
  params: { token: string[] };
  searchParams: { email?: string };
}

export default function TokenPage({ params, searchParams }: TokenPageProps) {
  const searchParamsHook = useSearchParams();
  const token = searchParamsHook.get("token") || params.token[0] || null;
  const email = searchParams.email || "";

  const router = useRouter(); // Usando o hook useRouter corretamente

  if (!token || !email) {
    router.push("/changepassword/request"); // Redireciona se faltar token/email
    return null;
  }

  return (
    <div className="flex h-screen w-full">
      <div className="relative hidden h-full w-1/2 md:block">
        <Image
          src="/image_sign_in.jpg"
          alt="Redefinição de senha"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>

      <div className="flex w-full flex-col items-center justify-center px-4 md:w-1/2 md:px-10">
        <ChangePasswordForm email={email} token={token} />
      </div>
    </div>
  );
}
