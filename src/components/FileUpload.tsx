import { useState, useRef, useCallback } from "react";
import { Upload, FileText, X, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from "pdfjs-dist";

// Use the bundled worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface FileUploadProps {
  onTextExtracted: (text: string) => void;
  currentText: string;
}

interface PdfTextItem {
  str: string;
}

function isPdfTextItem(item: unknown): item is PdfTextItem {
  return typeof item === "object" && item !== null && "str" in item && typeof (item as PdfTextItem).str === "string";
}

async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .filter(isPdfTextItem)
      .map((item) => item.str)
      .join(" ");
    pages.push(text);
  }
  return pages.join("\n\n").replace(/\s+/g, " ").trim();
}

async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  try {
    const uint8 = new Uint8Array(buffer);
    const decoder = new TextDecoder();
    const content = decoder.decode(uint8);
    const matches = content.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    if (!matches) return "";
    return matches
      .map((m) => m.replace(/<[^>]+>/g, ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return "";
  }
}

const FileUpload = ({ onTextExtracted, currentText }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const extractTextFromFile = useCallback(async (file: File) => {
    setLoading(true);
    setFileName(file.name);

    try {
      if (file.type === "text/plain") {
        const text = await file.text();
        onTextExtracted(text);
      } else if (file.type === "application/pdf") {
        const buffer = await file.arrayBuffer();
        const text = await extractPdfText(buffer);
        if (text.length > 20) {
          onTextExtracted(text);
          toast({ title: "PDF parsed successfully", description: `Extracted ${text.length} characters from ${file.name}` });
        } else {
          toast({
            title: "PDF parsing limited",
            description: "Could not extract enough text. Try pasting your resume text directly.",
            variant: "destructive",
          });
        }
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.endsWith(".docx")
      ) {
        const arrayBuffer = await file.arrayBuffer();
        const text = await extractDocxText(arrayBuffer);
        if (text.length > 10) {
          onTextExtracted(text);
        } else {
          toast({
            title: "Could not extract text",
            description: "Please paste your resume text directly.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Unsupported file type",
          description: "Please upload a PDF, DOCX, or TXT file.",
          variant: "destructive",
        });
        setFileName(null);
      }
    } catch (err) {
      console.error("File extraction error:", err);
      toast({
        title: "Error reading file",
        description: "Please try pasting your resume text directly.",
        variant: "destructive",
      });
      setFileName(null);
    }
    setLoading(false);
  }, [onTextExtracted, toast]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) extractTextFromFile(file);
    },
    [extractTextFromFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) extractTextFromFile(file);
    },
    [extractTextFromFile]
  );

  const clearFile = () => {
    setFileName(null);
    onTextExtracted("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`relative rounded-xl border-2 border-dashed p-6 text-center transition-all duration-300 cursor-pointer ${
        isDragging
          ? "border-accent bg-accent/10 scale-[1.02] shadow-[0_0_30px_hsl(var(--accent)/0.2)]"
          : fileName
          ? "border-aqua/50 bg-aqua/5"
          : "border-border hover:border-primary/50 hover:bg-primary/5"
      }`}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />

      {loading ? (
        <div className="flex flex-col items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary animate-pulse" />
          <p className="font-body text-sm text-muted-foreground">Extracting text...</p>
        </div>
      ) : fileName ? (
        <div className="flex items-center justify-center gap-3">
          <FileText className="h-6 w-6 text-aqua" />
          <span className="font-body text-sm font-medium text-foreground">{fileName}</span>
          <button
            onClick={(e) => { e.stopPropagation(); clearFile(); }}
            className="rounded-full p-1 text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full bg-gradient-to-br from-primary/20 to-accent/20 p-3">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <p className="font-body text-sm text-foreground font-medium">
            Drop your resume here or <span className="text-primary">browse</span>
          </p>
          <p className="font-body text-xs text-muted-foreground">
            PDF, DOCX, or TXT up to 5MB{currentText.trim() ? " - your pasted text will be replaced" : ""}
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
