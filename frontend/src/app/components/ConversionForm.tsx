"use client";

import { useMutation, useQuery } from "urql";
import { useState, useEffect } from "react";

interface ConversionResult {
  id: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  convertedFileUrl?: string;
  error?: string;
}

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

const GET_CONVERSION_STATUS = `
  query GetConversionStatus($id: String!) {
    getConversionStatus(id: $id) {
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

  const [sourceType, setSourceType] = useState<"PDF" | "DOCX">("DOCX");
  const [targetType, setTargetType] = useState<"PDF" | "DOCX">("PDF");

  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conversionId, setConversionId] = useState<string | null>(null);

  const [{ fetching }, convertFile] = useMutation(CONVERT_FILE_MUTATION);
  const [{ data: statusData }, executeQuery] = useQuery({
    query: GET_CONVERSION_STATUS,
    variables: { id: conversionId },
    pause: !conversionId,
  });

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (conversionId) {
      // Configurer le polling toutes les secondes
      intervalId = setInterval(() => {
        executeQuery();
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [conversionId, executeQuery]);

  useEffect(() => {
    if (statusData?.getConversionStatus) {
      setResult(statusData.getConversionStatus);
      if (statusData.getConversionStatus.status !== "PENDING") {
        setConversionId(null);
      }
    }
  }, [statusData]);

  useEffect(() => {
    if (result?.id && result.status === "PENDING") {
      setConversionId(result.id);
    }
  }, [result?.id, result?.status]);

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

  const handleDownload = async (url: string | undefined, filename: string) => {
    if (!url) {
      setError("URL de téléchargement non disponible");
      return;
    }

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      setError("Erreur lors du téléchargement du fichier");
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
            onChange={(e) => setSourceType(e.target.value as "PDF" | "DOCX")}
            className="w-full p-2 border rounded"
          >
            <option value="PDF">PDF</option>
            <option value="DOCX">DOCX</option>
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
          disabled={!!conversionId || fetching}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {!!conversionId ? "Conversion en cours..." : "Convertir"}
        </button>
      </form>

      {result && (
        <div className="mt-4 p-4 border rounded">
          <h3 className="font-bold mb-2">Résultat de la conversion :</h3>
          <p>Statut : {result.status}</p>
          {result.status === "PENDING" && (
            <p className="text-blue-500">Conversion en cours...</p>
          )}
          {result.convertedFileUrl && (
            <button
              onClick={() =>
                handleDownload(
                  result.convertedFileUrl,
                  `converted-${result.id}.pdf`
                )
              }
              className="text-blue-500 hover:underline cursor-pointer"
            >
              Télécharger le fichier converti
            </button>
          )}
          {result.error && (
            <p className="text-red-500">Erreur : {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
