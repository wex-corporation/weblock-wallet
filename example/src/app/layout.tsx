import "./globals.css";

export const metadata = {
  title: "WeBlock Wallet Example",
  description: "An example project using WeBlock Wallet SDK",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900 font-sans">
        <header className="bg-blue-600 text-white p-4">
          <h1 className="text-xl font-bold">WeBlock Wallet Example</h1>
        </header>
        <main className="container mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}
