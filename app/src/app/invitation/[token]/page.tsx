import { AccepterInvitationForm } from "./invitation-form";
import "../../auth-public.css";

export const metadata = {
  title: "Définir mon mot de passe — Caba Résidence",
};

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <AccepterInvitationForm token={token} />
      </div>
    </div>
  );
}
