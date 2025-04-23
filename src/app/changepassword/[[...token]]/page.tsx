"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { use } from "react"; // Adicione esta importação

import ChangePasswordForm from "@/app/components/change-password-form";

// Atualize a interface para corresponder à nova API do Next.js
interface TokenPageProps {
  params: Promise<{ token?: string[] }>;
  searchParams: Promise<{ email?: string }>;
}

export default function TokenPage({ params, searchParams }: TokenPageProps) {
  const unwrappedParams = use(params);
  const unwrappedSearchParams = use(searchParams);

  const searchParamsHook = useSearchParams();
  const token = searchParamsHook.get("token") || unwrappedParams.token?.[0];
  const email =
    unwrappedSearchParams.email || searchParamsHook.get("email") || "";

  const router = useRouter();

  if (!token || !email) {
    router.push("/changepassword/request");
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
