import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

type SiteLayoutProps = {
  children: React.ReactNode;
};

export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/40">
      <Header />
      <main className="mx-auto max-w-4xl p-4">{children}</main>
      <Footer />
    </div>
  );
}
