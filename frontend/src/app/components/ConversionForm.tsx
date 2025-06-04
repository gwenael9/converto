"use client";

import { useMutation } from "urql";
import { useState } from "react";

const CONVERT_FILE_MUTATION = `
  mutation ConvertFile($input: ConversionInput!) {
    convertFile(input: $input) {
      id
      status
      convertedFileUrl
      error
    }
  }
`;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function ConversionForm() {
  const [file, setFile] = useState<File | null>(null);
  const [sourceType, setSourceType] = useState<string | undefined>(
    file?.type || undefined
  );
  const [targetType, setTargetType] = useState<"PDF" | "DOCX">("DOCX");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [{ fetching }, convertFile] = useMutation(CONVERT_FILE_MUTATION);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);

    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError(
          `Le fichier est trop volumineux. Taille maximale : ${
            MAX_FILE_SIZE / (1024 * 1024)
          }MB`
        );
        setFile(null);
        e.target.value = "";
      } else {
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      const result = await convertFile({
        input: {
          file,
          sourceType,
          targetType,
        },
      });

      console.log("result", result);

      setResult(result.data?.convertFile);
    } catch (err) {
      console.error("Erreur de conversion:", err);
      setError(
        "Une erreur s'est produite lors de la conversion. Veuillez réessayer."
      );
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Convertir un fichier</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fichier à convertir (max {MAX_FILE_SIZE / (1024 * 1024)}MB)
          </label>
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
            required
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de fichier source
          </label>
          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="PDF">PDF</option>
            <option value="DOCX">DOCX</option>
            <option value="sourceeeeee">{sourceType}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de fichier cible
          </label>
          <select
            value={targetType}
            onChange={(e) => setTargetType(e.target.value as "PDF" | "DOCX")}
            className="w-full p-2 border rounded"
          >
            <option value="PDF">PDF</option>
            <option value="DOCX">DOCX</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={fetching || !file}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {fetching ? "Conversion en cours..." : "Convertir"}
        </button>
      </form>

      {result && (
        <div className="mt-4 p-4 border rounded">
          <h3 className="font-bold mb-2">Résultat de la conversion :</h3>
          <p>Statut : {result.status}</p>
          {result.convertedFileUrl && (
            <a
              href={result.convertedFileUrl}
              className="text-blue-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Télécharger le fichier converti
            </a>
          )}
          {result.error && (
            <p className="text-red-500">Erreur : {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
