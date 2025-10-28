import { Button } from "./components/ui/button";
import { Progress } from "./components/ui/progress";
import { ScrollArea } from "./components/ui/scroll-area";
import { Input } from "./components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/ui/tooltip";
import { AlertCircle, FolderPlus, FilePlus, Trash2, X, FileText, FileType, CheckSquare, Square, ArrowUpDown } from "lucide-react";
import { useState } from "react";

interface FileItem {
  id: number;
  path: string;
  selected: boolean;
}

interface LanguageInfo {
  name: string;
  color: string;
  count: number;
  percentage: number;
}

// Language mapping by file extension - Bright, eye-catching color palette
const LANGUAGE_MAP: Record<string, { name: string; color: string }> = {
  ".py": { name: "Python", color: "#FFD43B" },        // Bright Yellow
  ".js": { name: "JavaScript", color: "#00D9FF" },    // Bright Cyan
  ".jsx": { name: "JavaScript", color: "#00D9FF" },   // Bright Cyan
  ".ts": { name: "TypeScript", color: "#FF6B6B" },    // Bright Coral Red
  ".tsx": { name: "TypeScript", color: "#FF6B6B" },   // Bright Coral Red
  ".json": { name: "JSON", color: "#A0A0A0" },        // Light Gray
  ".yml": { name: "YAML", color: "#FF69B4" },         // Hot Pink
  ".yaml": { name: "YAML", color: "#FF69B4" },        // Hot Pink
  ".md": { name: "Markdown", color: "#FFFFFF" },      // White
  ".cpp": { name: "C++", color: "#00CED1" },          // Dark Turquoise
  ".c": { name: "C", color: "#9370DB" },              // Medium Purple
  ".java": { name: "Java", color: "#FF8C00" },        // Dark Orange
  ".go": { name: "Go", color: "#00E5FF" },            // Bright Aqua
  ".rs": { name: "Rust", color: "#FF4500" },          // Orange Red
  ".php": { name: "PHP", color: "#9B59B6" },          // Amethyst Purple
  ".rb": { name: "Ruby", color: "#FF1744" },          // Bright Red
  ".swift": { name: "Swift", color: "#FF9500" },      // Vivid Orange
  ".kt": { name: "Kotlin", color: "#B085FF" },        // Light Purple
  ".css": { name: "CSS", color: "#1E90FF" },          // Dodger Blue
  ".html": { name: "HTML", color: "#E34C26" },        // HTML Orange
  ".vue": { name: "Vue", color: "#42D392" },          // Emerald Green
  ".sql": { name: "SQL", color: "#00BFFF" },          // Deep Sky Blue
};

export default function App() {
  // Demo file pool for adding
  const demoFiles = [
    "src/components/Header.tsx",
    "src/components/Sidebar.tsx",
    "src/components/Footer.tsx",
    "src/components/Navigation.tsx",
    "src/components/Modal.tsx",
    "src/utils/fileHandler.js",
    "src/utils/exportManager.js",
    "src/utils/validator.ts",
    "src/api/collector.py",
    "src/api/parser.py",
    "src/api/database.py",
    "src/api/auth.py",
    "tests/unit/test_collector.py",
    "tests/unit/test_parser.py",
    "tests/integration/test_export.py",
    "tests/integration/test_api.py",
    "config/settings.json",
    "config/database.yml",
    "models/user.py",
    "models/project.py",
    "controllers/export_controller.py",
    "views/MainView.tsx",
    "views/SettingsView.tsx",
    "README.md",
  ];

  const [files, setFiles] = useState<FileItem[]>([
    { id: 1, path: "src/components/Header.tsx", selected: true },
    { id: 2, path: "src/components/Sidebar.tsx", selected: false },
    { id: 3, path: "src/utils/fileHandler.js", selected: false },
    { id: 4, path: "src/utils/exportManager.js", selected: false },
    { id: 5, path: "src/api/collector.py", selected: true },
    { id: 6, path: "src/api/parser.py", selected: false },
    { id: 7, path: "tests/unit/test_collector.py", selected: false },
    { id: 8, path: "tests/integration/test_export.py", selected: false },
    { id: 9, path: "config/settings.json", selected: false },
    { id: 10, path: "README.md", selected: true },
  ]);

  const [filterText, setFilterText] = useState("");
  const [nextId, setNextId] = useState(11);
  const [sortMode, setSortMode] = useState<"name" | "path" | "extension">("name");
  const [isDragging, setIsDragging] = useState(false);

  // Filter and sort files
  const filteredFiles = files
    .filter((file) => file.path.toLowerCase().includes(filterText.toLowerCase()))
    .sort((a, b) => {
      if (sortMode === "name") {
        const nameA = a.path.split("/").pop() || "";
        const nameB = b.path.split("/").pop() || "";
        return nameA.localeCompare(nameB);
      } else if (sortMode === "path") {
        return a.path.localeCompare(b.path);
      } else {
        const extA = a.path.split(".").pop() || "";
        const extB = b.path.split(".").pop() || "";
        return extA.localeCompare(extB);
      }
    });

  // Count selected files
  const selectedCount = files.filter(f => f.selected).length;
  const allSelected = files.length > 0 && selectedCount === files.length;

  // Calculate language composition
  const getLanguageComposition = (): LanguageInfo[] => {
    if (files.length === 0) return [];

    const languageCounts: Record<string, number> = {};
    
    files.forEach(file => {
      const extension = "." + (file.path.split(".").pop() || "");
      const langInfo = LANGUAGE_MAP[extension.toLowerCase()];
      const langName = langInfo ? langInfo.name : "Other";
      
      languageCounts[langName] = (languageCounts[langName] || 0) + 1;
    });

    const totalFiles = files.length;
    const languages: LanguageInfo[] = Object.entries(languageCounts).map(([name, count]) => {
      const extension = Object.keys(LANGUAGE_MAP).find(
        ext => LANGUAGE_MAP[ext].name === name
      );
      const color = extension ? LANGUAGE_MAP[extension].color : "#00FF7F";  // Spring Green for "Other"
      
      return {
        name,
        color,
        count,
        percentage: (count / totalFiles) * 100,
      };
    });

    // Sort by count descending
    return languages.sort((a, b) => b.count - a.count);
  };

  const languageComposition = getLanguageComposition();

  // Toggle file selection
  const toggleFileSelection = (id: number) => {
    setFiles(files.map(file => 
      file.id === id ? { ...file, selected: !file.selected } : file
    ));
  };

  // Remove selected files
  const handleRemoveSelected = () => {
    setFiles(files.filter(file => !file.selected));
  };

  // Clear all files
  const handleClearAll = () => {
    setFiles([]);
  };

  // Add random single file
  const handleAddFiles = () => {
    const availableFiles = demoFiles.filter(
      demoPath => !files.some(f => f.path === demoPath)
    );
    
    if (availableFiles.length > 0) {
      const randomFile = availableFiles[Math.floor(Math.random() * availableFiles.length)];
      const newFile: FileItem = {
        id: nextId,
        path: randomFile,
        selected: false,
      };
      setFiles([...files, newFile]);
      setNextId(nextId + 1);
    }
  };

  // Add multiple files (simulate folder add)
  const handleAddFolder = () => {
    const availableFiles = demoFiles.filter(
      demoPath => !files.some(f => f.path === demoPath)
    );
    
    const numToAdd = Math.min(5, availableFiles.length);
    const newFiles: FileItem[] = [];
    
    for (let i = 0; i < numToAdd; i++) {
      const randomIndex = Math.floor(Math.random() * availableFiles.length);
      const randomFile = availableFiles.splice(randomIndex, 1)[0];
      newFiles.push({
        id: nextId + i,
        path: randomFile,
        selected: false,
      });
    }
    
    if (newFiles.length > 0) {
      setFiles([...files, ...newFiles]);
      setNextId(nextId + newFiles.length);
    }
  };

  // Select All / Deselect All
  const handleToggleSelectAll = () => {
    if (allSelected) {
      setFiles(files.map(f => ({ ...f, selected: false })));
    } else {
      setFiles(files.map(f => ({ ...f, selected: true })));
    }
  };

  // Cycle through sort modes
  const handleToggleSort = () => {
    if (sortMode === "name") setSortMode("path");
    else if (sortMode === "path") setSortMode("extension");
    else setSortMode("name");
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Simulate adding random files on drop
    handleAddFolder();
  };

  return (
    <div className="h-screen w-full bg-[#1e1e1e] text-[#cccccc] flex items-center justify-center p-6">
      <div className="w-full max-w-[1100px] h-full max-h-[700px] flex flex-col bg-[#252526] rounded-lg border border-[#3e3e42] shadow-2xl p-4">
        {/* Header */}
        <div className="mb-3">
          <h1 className="text-[#ffffff]">CodeCollector</h1>
        </div>

        {/* Language Composition Bar */}
        {languageComposition.length > 0 && (
          <div className="mb-3 p-2.5 bg-[#2d2d30] rounded border border-[#3e3e42]">
            <TooltipProvider>
              {/* Segmented Bar */}
              <div className="flex h-5 rounded overflow-hidden mb-2 bg-[#1e1e1e]">
                {languageComposition.map((lang, index) => (
                  <Tooltip key={lang.name} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <div
                        className="transition-opacity hover:opacity-80 cursor-pointer"
                        style={{
                          width: `${lang.percentage}%`,
                          backgroundColor: lang.color,
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1e1e1e] border-[#3e3e42] text-[#cccccc]">
                      <p className="text-xs">
                        {lang.name} — {lang.percentage.toFixed(1)}% ({lang.count} {lang.count === 1 ? 'file' : 'files'})
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
              
              {/* Language Labels */}
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#cccccc]">
                {languageComposition.map((lang) => (
                  <div key={lang.name} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ backgroundColor: lang.color }}
                    />
                    <span>
                      {lang.name} {lang.percentage.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </TooltipProvider>
          </div>
        )}

        {/* ButtonFrame - Top Controls */}
        <div className="flex items-center gap-2 mb-3 p-2 bg-[#2d2d30] rounded border border-[#3e3e42]">
          {/* File Add Group */}
          <div className="flex items-center gap-1.5 pr-2 border-r border-[#3e3e42]">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddFiles}
              className="bg-[#383838] border-[#3e3e42] hover:bg-[#3e3e42] hover:border-[#007ACC] text-[#cccccc] h-8 px-3"
            >
              <FilePlus className="w-3.5 h-3.5 mr-1.5" />
              AddFiles
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddFolder}
              className="bg-[#383838] border-[#3e3e42] hover:bg-[#3e3e42] hover:border-[#007ACC] text-[#cccccc] h-8 px-3"
            >
              <FolderPlus className="w-3.5 h-3.5 mr-1.5" />
              AddFolder
            </Button>
          </div>

          {/* List Management Group */}
          <div className="flex items-center gap-1.5 pr-2 border-r border-[#3e3e42]">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleSelectAll}
              disabled={files.length === 0}
              className="bg-[#383838] border-[#3e3e42] hover:bg-[#3e3e42] hover:border-[#007ACC] text-[#cccccc] h-8 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {allSelected ? (
                <CheckSquare className="w-3.5 h-3.5 mr-1.5" />
              ) : (
                <Square className="w-3.5 h-3.5 mr-1.5" />
              )}
              {allSelected ? "DeselectAll" : "SelectAll"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveSelected}
              disabled={selectedCount === 0}
              className="bg-[#383838] border-[#3e3e42] hover:bg-[#3e3e42] hover:border-[#007ACC] text-[#cccccc] h-8 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              RemoveSelected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={files.length === 0}
              className="bg-[#383838] border-[#3e3e42] hover:bg-[#3e3e42] hover:border-[#007ACC] text-[#cccccc] h-8 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-3.5 h-3.5 mr-1.5" />
              ClearAll
            </Button>
          </div>

          {/* Export/Control Group */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled
              className="bg-[#383838] border-[#3e3e42] text-[#656565] cursor-not-allowed opacity-50 h-8 px-3"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              ExportTXT
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="bg-[#383838] border-[#3e3e42] text-[#656565] cursor-not-allowed opacity-50 h-8 px-3"
            >
              <FileType className="w-3.5 h-3.5 mr-1.5" />
              ExportPDF
            </Button>
            <Button
              size="sm"
              className="bg-[#007ACC] hover:bg-[#005a9e] text-white border-none shadow-md h-8 px-3"
            >
              <X className="w-3.5 h-3.5 mr-1.5" />
              CancelExport
            </Button>
          </div>
        </div>

        {/* Filter Input Bar and Sort Control */}
        <div className="mb-2 flex items-center gap-2">
          <Input
            type="text"
            placeholder="Filter files by name or path..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="flex-1 bg-[#2d2d30] border-[#3e3e42] text-[#cccccc] placeholder:text-[#656565] focus-visible:ring-[#007ACC] focus-visible:border-[#007ACC] h-8"
            name="FilterInput"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleSort}
            className="bg-[#2d2d30] border-[#3e3e42] hover:bg-[#3e3e42] hover:border-[#007ACC] text-[#cccccc] h-8 px-3 flex items-center gap-1.5"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="text-xs">
              {sortMode === "name" ? "Name" : sortMode === "path" ? "Path" : "Ext"}
            </span>
          </Button>
        </div>
        
        {/* Sort Mode Indicator */}
        <div className="mb-2 text-xs text-[#858585] px-1">
          Sorting: {sortMode === "name" ? "Name (A–Z)" : sortMode === "path" ? "Path (A–Z)" : "Extension (A–Z)"}
        </div>

        {/* FileListArea - Main Content */}
        <div className="flex-1 min-h-0 flex flex-col mb-2">
          <div
            className={`flex-1 min-h-0 bg-[#1e1e1e] rounded border-2 overflow-hidden transition-all ${
              isDragging
                ? "border-[#007ACC] border-dashed bg-[#094771]/10"
                : "border-[#3e3e42] border-solid"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <ScrollArea className="h-full">
              <div className="p-1.5">
                {isDragging && (
                  <div className="flex flex-col items-center justify-center py-16 text-[#007ACC]">
                    <FolderPlus className="w-12 h-12 mb-3" />
                    <p className="text-sm">Drop files or folders here to add them</p>
                  </div>
                )}
                {!isDragging && filteredFiles.length === 0 && (
                  <div className="text-center text-[#656565] py-8">
                    {filterText ? "No files match your filter" : "No files added yet"}
                  </div>
                )}
                {!isDragging && filteredFiles.length > 0 && (
                  filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => toggleFileSelection(file.id)}
                      className={`px-2.5 py-1.5 mb-0.5 rounded cursor-pointer font-mono text-sm transition-colors ${
                        file.selected
                          ? "bg-[#094771] text-[#ffffff] border border-[#007ACC]"
                          : "bg-[#2d2d30] text-[#cccccc] hover:bg-[#2a2d2e] border border-transparent"
                      }`}
                    >
                      {file.path}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
          
          {/* Selected Files Indicator */}
          {files.length > 0 && (
            <div className="mt-1.5 px-2 py-1 text-xs text-[#858585] flex-shrink-0">
              <span className="text-[#007ACC]">{selectedCount} files selected</span>
              <span> (Total: {files.length})</span>
            </div>
          )}
        </div>

        {/* StatusArea - Status and Progress */}
        <div className="space-y-2 p-2.5 bg-[#2d2d30] rounded border border-[#3e3e42]">
          {/* Error/Warning Message */}
          <div className="flex items-start gap-2 p-2 bg-[#5a1d1d] border border-[#be1100] rounded">
            <AlertCircle className="w-4 h-4 text-[#f48771] mt-0.5 flex-shrink-0" />
            <span className="text-[#f48771] text-sm">
              Permission denied: /system/protected.py
            </span>
          </div>

          {/* Status Label and Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="text-[#cccccc] min-w-[240px] text-sm">
              <span className="text-[#007ACC]">●</span> Processed 40/61 files (65%)
            </div>
            <div className="flex-1">
              <Progress value={65} className="h-2 bg-[#1e1e1e]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
