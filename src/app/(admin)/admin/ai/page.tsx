import AdminAIKeyPoolClient from "@/features/admin/AdminAIKeyPoolClient";

export const metadata = {
  title: "AI Key Pool & Token Tracker — ByteVerse Admin",
};

export default function AdminAIPage() {
  return (
    <main className="pb-16">
      <AdminAIKeyPoolClient />
    </main>
  );
}
