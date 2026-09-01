import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { useBulkImportProductsMutation } from "../../../features/api/apiSlice";
import {
  Upload,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";

// Define the shape of the API response
interface BulkImportError {
  row: number;
  message: string;
}

interface BulkImportResult {
  success: boolean;
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: BulkImportError[];
}

const BulkProductUpload = ({ onClose }: { onClose: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const [bulkImportProducts, { isLoading: isUploading }] =
    useBulkImportProductsMutation();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const data = await bulkImportProducts(formData).unwrap();
      setResult(data);
      const successMessage =
        data.updated > 0
          ? `Imported ${data.created} and updated ${data.updated} products successfully`
          : `Imported ${data.created} products successfully`;
      toast.success(successMessage);
      setFile(null);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "data" in err) {
        const errorData = (err as { data?: { message?: string } }).data;
        toast.error(errorData?.message || "Something went wrong");
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const downloadTemplate = () => {
    const csvContent = [
      "name,slug,description,price,compareAtPrice,category,images,stock,sku,brand,tags,isActive",
      'Example Product,example-product,Product description,10000,12000,Electronics,https://example.com/image1.jpg,50,SKU123,Apple,"tag1,tag2",true',
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk-product-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-[#141414] rounded-2xl p-6 border border-gray-200 dark:border-white/[0.08] max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Bulk Product Upload
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
          aria-label="Close bulk upload"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Upload a CSV file with product data. Download the template below to get started.
      </p>

      <button
        onClick={downloadTemplate}
        className="text-blue-600 hover:underline flex items-center gap-1 mb-6"
      >
        <FileSpreadsheet className="w-4 h-4" /> Download CSV Template
      </button>

      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer ${
          file ? "border-green-400" : "border-gray-300 dark:border-gray-700"
        }`}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <span className="text-sm font-medium">
          {file ? file.name : "Click to select CSV file"}
        </span>
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className="mt-6 w-full py-3 bg-[#e8622a] text-white rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" /> Importing...
          </>
        ) : (
          "Start Import"
        )}
      </button>

      {result && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-5 h-5" />
            <span>{result.created} products imported</span>
          </div>

          {result.updated > 0 && (
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="w-5 h-5" />
              <span>{result.updated} products updated</span>
            </div>
          )}

          {result.skipped > 0 && (
            <div className="flex items-start gap-2 text-yellow-600 dark:text-yellow-500">
              <XCircle className="w-5 h-5 mt-0.5" />
              <span>{result.skipped} products skipped</span>
            </div>
          )}

          {result.errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
              <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                Errors:
              </h4>
              <ul className="text-sm text-red-500 list-disc pl-5 space-y-1">
                {result.errors.map((err: BulkImportError, idx: number) => (
                  <li key={idx}>
                    Row {err.row}: {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkProductUpload;