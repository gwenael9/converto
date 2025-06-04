import { ConversionForm } from "./components/ConversionForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">
          Convertisseur de fichiers PDF/DOCX
        </h1>
        <ConversionForm />
      </div>
    </main>
  );
}
