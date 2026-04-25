import "./globals.css";


export const metadata = {
  title: "AskMate",
  description: "AskMate is a platform for students and lecturers to ask and answer questions.",
};

import AiFloatingButton from "@/components/AiFloatingButton";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`antialiased`}
        suppressHydrationWarning
      >
        {children}
        <AiFloatingButton />
      </body>
    </html>
  );
}
