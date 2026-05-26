import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Download, Copy, RefreshCw, Settings2, ImageIcon, CheckCheck, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const ASCII_SETS = {
  standard: "@%#*+=-:. ",
  detailed: "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ",
  blocks: "█▓▒░ ",
  simple: "#+-. ",
  binary: "10 ",
};

type AsciiSetKey = keyof typeof ASCII_SETS;

function imageToAscii(
  img: HTMLImageElement,
  cols: number,
  invert: boolean,
  charSet: AsciiSetKey,
  colored: boolean
): { text: string; colorData: { r: number; g: number; b: number }[][] } {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const aspectRatio = img.width / img.height;
  const charAspect = 0.45;
  const rows = Math.floor((cols / aspectRatio) * charAspect);

  canvas.width = cols;
  canvas.height = rows;
  ctx.drawImage(img, 0, 0, cols, rows);

  const imageData = ctx.getImageData(0, 0, cols, rows);
  const pixels = imageData.data;

  const chars = ASCII_SETS[charSet];
  const lines: string[] = [];
  const colorData: { r: number; g: number; b: number }[][] = [];

  for (let y = 0; y < rows; y++) {
    let line = "";
    const rowColors: { r: number; g: number; b: number }[] = [];
    for (let x = 0; x < cols; x++) {
      const idx = (y * cols + x) * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];
      const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const adjusted = invert ? brightness : 1 - brightness;
      const charIdx = Math.floor(adjusted * (chars.length - 1));
      line += chars[charIdx];
      rowColors.push({ r, g, b });
    }
    lines.push(line);
    colorData.push(rowColors);
  }

  return { text: lines.join("\n"), colorData };
}

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [asciiText, setAsciiText] = useState<string>("");
  const [colorData, setColorData] = useState<{ r: number; g: number; b: number }[][]>([]);
  const [cols, setCols] = useState(120);
  const [invert, setInvert] = useState(false);
  const [charSet, setCharSet] = useState<AsciiSetKey>("standard");
  const [colored, setColored] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const asciiRef = useRef<HTMLPreElement>(null);
  const { toast } = useToast();

  const convert = useCallback(() => {
    if (!imgRef.current) return;
    setIsProcessing(true);
    setTimeout(() => {
      const result = imageToAscii(imgRef.current!, cols, invert, charSet, colored);
      setAsciiText(result.text);
      setColorData(result.colorData);
      setIsProcessing(false);
    }, 10);
  }, [cols, invert, charSet, colored]);

  useEffect(() => {
    if (imageSrc && imgRef.current?.complete) {
      convert();
    }
  }, [cols, invert, charSet, colored, convert]);

  const loadImage = useCallback((src: string) => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const result = imageToAscii(img, 120, invert, charSet, colored);
      setAsciiText(result.text);
      setColorData(result.colorData);
      setIsProcessing(false);
    };
    img.src = src;
  }, [invert, charSet, colored]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file.", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImageSrc(src);
      loadImage(src);
    };
    reader.readAsDataURL(file);
  }, [loadImage, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleCopy = async () => {
    if (!asciiText) return;
    await navigator.clipboard.writeText(asciiText);
    setCopied(true);
    toast({ title: "Copied!", description: "ASCII art copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!asciiText) return;
    const blob = new Blob([asciiText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ascii-art.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!", description: "ASCII art saved as ascii-art.txt" });
  };

  const handleDownloadPng = () => {
    if (!asciiRef.current) return;
    const pre = asciiRef.current;
    const lines = asciiText.split("\n");
    const fontSize = 7;
    const lineHeight = fontSize * 1.2;
    const charWidth = fontSize * 0.6;
    const padding = 16;

    const canvas = document.createElement("canvas");
    canvas.width = lines[0].length * charWidth + padding * 2;
    canvas.height = lines.length * lineHeight + padding * 2;

    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#0d0d12";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
    ctx.textBaseline = "top";

    lines.forEach((line, rowIdx) => {
      [...line].forEach((char, colIdx) => {
        if (colored && colorData[rowIdx]?.[colIdx]) {
          const { r, g, b } = colorData[rowIdx][colIdx];
          ctx.fillStyle = `rgb(${r},${g},${b})`;
        } else {
          ctx.fillStyle = "#c8d0e0";
        }
        ctx.fillText(char, padding + colIdx * charWidth, padding + rowIdx * lineHeight);
      });
    });

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ascii-art.png";
      a.click();
      URL.revokeObjectURL(url);
    });
    toast({ title: "Downloaded!", description: "ASCII art saved as ascii-art.png" });
  };

  const lines = asciiText.split("\n");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-mono font-bold text-xs">A/</span>
            </div>
            <h1 className="text-lg font-semibold text-foreground">ASCII Art Converter</h1>
          </div>
          <div className="ml-auto text-xs text-muted-foreground font-mono">
            image → characters
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-screen-2xl mx-auto w-full px-6 py-8 flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">

          <div className="flex flex-col gap-4">
            <div
              data-testid="drop-zone"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                relative border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-200
                flex flex-col items-center justify-center gap-3 min-h-[200px]
                ${isDragging
                  ? "border-primary bg-accent/50 scale-[0.99]"
                  : "border-border hover:border-primary/50 hover:bg-muted/50 bg-card"
                }
              `}
            >
              {imageSrc ? (
                <div className="w-full">
                  <img
                    src={imageSrc}
                    alt="Preview"
                    className="w-full h-auto rounded-lg max-h-48 object-contain"
                  />
                  <p className="text-xs text-muted-foreground text-center mt-2">Click to change image</p>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                    <ImageIcon className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Drop an image here</p>
                    <p className="text-xs text-muted-foreground mt-1">or click to browse files</p>
                  </div>
                  <p className="text-xs text-muted-foreground/60">PNG, JPG, GIF, WebP supported</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInput}
                data-testid="input-file"
              />
            </div>

            <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-5">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Sliders className="w-4 h-4 text-primary" />
                Settings
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-foreground">Width (columns)</Label>
                  <span className="text-sm font-mono text-primary font-medium">{cols}</span>
                </div>
                <Slider
                  data-testid="slider-cols"
                  min={40}
                  max={300}
                  step={10}
                  value={[cols]}
                  onValueChange={([v]) => setCols(v)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground font-mono">
                  <span>40</span>
                  <span>300</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm text-foreground">Character Set</Label>
                <Select value={charSet} onValueChange={(v) => setCharSet(v as AsciiSetKey)}>
                  <SelectTrigger data-testid="select-charset" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="blocks">Block Characters</SelectItem>
                    <SelectItem value="simple">Simple</SelectItem>
                    <SelectItem value="binary">Binary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm text-foreground cursor-pointer" htmlFor="invert-toggle">
                  Invert brightness
                </Label>
                <Switch
                  id="invert-toggle"
                  data-testid="switch-invert"
                  checked={invert}
                  onCheckedChange={setInvert}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm text-foreground cursor-pointer" htmlFor="color-toggle">
                  Colored output
                </Label>
                <Switch
                  id="color-toggle"
                  data-testid="switch-colored"
                  checked={colored}
                  onCheckedChange={setColored}
                />
              </div>

              <Button
                data-testid="button-reconvert"
                onClick={convert}
                disabled={!imageSrc || isProcessing}
                variant="outline"
                className="w-full gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
                {isProcessing ? "Converting..." : "Reconvert"}
              </Button>
            </div>

            {asciiText && (
              <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Download className="w-4 h-4 text-primary" />
                  Export
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    data-testid="button-copy"
                    onClick={handleCopy}
                    variant="secondary"
                    size="sm"
                    className="gap-2"
                  >
                    {copied ? <CheckCheck className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy text"}
                  </Button>
                  <Button
                    data-testid="button-download-txt"
                    onClick={handleDownload}
                    variant="secondary"
                    size="sm"
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    .txt
                  </Button>
                </div>
                <Button
                  data-testid="button-download-png"
                  onClick={handleDownloadPng}
                  size="sm"
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download as PNG
                </Button>
                <p className="text-xs text-muted-foreground">
                  {lines.length} rows × {lines[0]?.length ?? 0} cols
                </p>
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <span className="text-xs font-mono text-muted-foreground">output</span>
              {asciiText && (
                <span className="text-xs font-mono text-muted-foreground/60">
                  {charSet} · {cols}col
                </span>
              )}
            </div>

            <div className="flex-1 overflow-auto p-4 bg-[#0d0d12]">
              {!asciiText && !isProcessing && (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-white/20" />
                  </div>
                  <div>
                    <p className="text-white/40 text-sm">Upload an image to see ASCII art</p>
                    <p className="text-white/20 text-xs mt-1 font-mono">@%#*+=-:. →</p>
                  </div>
                </div>
              )}
              {isProcessing && (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="w-6 h-6 text-white/40 animate-spin" />
                    <p className="text-white/40 text-sm">Converting...</p>
                  </div>
                </div>
              )}
              {asciiText && !isProcessing && (
                <pre
                  ref={asciiRef}
                  data-testid="ascii-output"
                  className="font-mono leading-none select-all"
                  style={{ fontSize: "7px", lineHeight: "1.2" }}
                >
                  {colored && colorData.length > 0
                    ? lines.map((line, rowIdx) => (
                        <span key={rowIdx} style={{ display: "block" }}>
                          {[...line].map((char, colIdx) => {
                            const px = colorData[rowIdx]?.[colIdx];
                            return (
                              <span
                                key={colIdx}
                                style={{ color: px ? `rgb(${px.r},${px.g},${px.b})` : "#c8d0e0" }}
                              >
                                {char}
                              </span>
                            );
                          })}
                        </span>
                      ))
                    : <span style={{ color: "#c8d0e0" }}>{asciiText}</span>
                  }
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
